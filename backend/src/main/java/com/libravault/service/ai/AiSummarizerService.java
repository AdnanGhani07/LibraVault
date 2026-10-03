package com.libravault.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.libravault.dto.ai.PaperSummaryDto;
import com.libravault.dto.ai.PaperSummaryRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Service
public class AiSummarizerService {

    private static final Logger log = LoggerFactory.getLogger(AiSummarizerService.class);
    private static final String GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${libravault.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${libravault.ai.gemini.model:gemini-3.5-flash-lite}")
    private String geminiModel;

    public AiSummarizerService(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public PaperSummaryDto summarizePaper(PaperSummaryRequest request) {
        String cleanApiKey = (geminiApiKey != null) ? geminiApiKey.trim() : "";

        if (!cleanApiKey.isBlank()) {
            try {
                return callGeminiApi(request, cleanApiKey);
            } catch (Exception e) {
                log.warn("Gemini API summarization failed or quota exceeded: {}. Falling back to heuristic summarizer.", e.getMessage());
            }
        }

        return summarizeWithHeuristics(request.getTitle(), request.getAbstractText(), request.getArxivId());
    }

    private PaperSummaryDto callGeminiApi(PaperSummaryRequest request, String apiKey) throws Exception {
        String rawModel = (geminiModel != null && !geminiModel.isBlank()) ? geminiModel.trim() : "gemini-3.5-flash-lite";
        String normalizedModel = rawModel.startsWith("gemini-") ? rawModel : "gemini-" + rawModel;
        String url = String.format(GEMINI_API_URL_TEMPLATE, normalizedModel, apiKey);

        String prompt = String.format(
                """
                You are an expert scientific researcher and computer scientist.
                Analyze the following research paper and provide a concise, structured executive summary in JSON format.
                
                Paper Title: %s
                Abstract:
                %s
                
                Respond ONLY with a JSON object conforming exactly to this structure:
                {
                  "oneSentenceSummary": "A punchy, plain-English TL;DR of the paper",
                  "coreProblem": "The specific bottleneck, limitation, or question this research tackles",
                  "methodology": ["Key technique or architecture 1", "Key innovation 2"],
                  "keyFindings": ["Measurable breakthrough or benchmark result 1", "Key finding 2"],
                  "practicalApplications": ["Real-world application for engineers/developers 1", "Industry use case 2"]
                }
                """,
                request.getTitle(), request.getAbstractText()
        );

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contents = Map.of("parts", List.of(textPart));
        Map<String, Object> generationConfig = Map.of("response_mime_type", "application/json");
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(contents),
                "generationConfig", generationConfig
        );

        String jsonPayload = objectMapper.writeValueAsString(requestBody);

        String rawResponse = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonPayload)
                .retrieve()
                .body(String.class);

        if (rawResponse == null || rawResponse.isBlank()) {
            throw new IllegalStateException("Empty response received from Gemini API");
        }

        JsonNode responseNode = objectMapper.readTree(rawResponse);
        JsonNode textNode = responseNode
                .path("candidates").path(0)
                .path("content").path("parts").path(0)
                .path("text");

        if (textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new IllegalStateException("No text candidate found in Gemini response");
        }

        JsonNode summaryJson = objectMapper.readTree(textNode.asText());

        return PaperSummaryDto.builder()
                .arxivId(request.getArxivId())
                .title(request.getTitle())
                .oneSentenceSummary(summaryJson.path("oneSentenceSummary").asText("Paper summary unavailable."))
                .coreProblem(summaryJson.path("coreProblem").asText("Research problem analysis."))
                .methodology(extractStringList(summaryJson.path("methodology")))
                .keyFindings(extractStringList(summaryJson.path("keyFindings")))
                .practicalApplications(extractStringList(summaryJson.path("practicalApplications")))
                .provider("GEMINI-" + normalizedModel)
                .build();
    }

    public PaperSummaryDto summarizeWithHeuristics(String title, String abstractText, String arxivId) {
        if (abstractText == null || abstractText.isBlank()) {
            return PaperSummaryDto.builder()
                    .arxivId(arxivId)
                    .title(title)
                    .oneSentenceSummary("No abstract provided for distillation.")
                    .coreProblem("Not specified.")
                    .methodology(List.of("Heuristic extraction"))
                    .keyFindings(List.of("Details unavailable in provided text."))
                    .practicalApplications(List.of("General exploration"))
                    .provider("HEURISTIC_FALLBACK")
                    .build();
        }

        String[] rawSentences = abstractText.split("(?<=[.!?])\\s+");
        List<String> sentences = Arrays.stream(rawSentences)
                .map(String::trim)
                .filter(s -> s.length() > 20)
                .toList();

        String oneSentenceSummary = findOneSentenceSummary(sentences, title);
        String coreProblem = findCoreProblem(sentences, title);
        List<String> methodology = findMethodology(sentences);
        List<String> keyFindings = findKeyFindings(sentences);
        List<String> practicalApplications = inferPracticalApplications(title, abstractText);

        return PaperSummaryDto.builder()
                .arxivId(arxivId)
                .title(title)
                .oneSentenceSummary(oneSentenceSummary)
                .coreProblem(coreProblem)
                .methodology(methodology)
                .keyFindings(keyFindings)
                .practicalApplications(practicalApplications)
                .provider("HEURISTIC_FALLBACK")
                .build();
    }

    private String findOneSentenceSummary(List<String> sentences, String title) {
        for (String s : sentences) {
            String lower = s.toLowerCase();
            if (lower.startsWith("in this paper") || lower.startsWith("we propose") ||
                lower.startsWith("we present") || lower.startsWith("this paper introduces") ||
                lower.startsWith("this work presents")) {
                return s;
            }
        }
        return !sentences.isEmpty() ? sentences.getFirst() : ("Overview of " + title);
    }

    private String findCoreProblem(List<String> sentences, String title) {
        for (String s : sentences) {
            String lower = s.toLowerCase();
            if (lower.contains("however") || lower.contains("challenge") || lower.contains("bottleneck") ||
                lower.contains("limitation") || lower.contains("suffers from") || lower.contains("costly") ||
                lower.contains("difficult") || lower.contains("problem")) {
                return s;
            }
        }
        return "Tackling core scalability and efficiency limitations in " + title;
    }

    private List<String> findMethodology(List<String> sentences) {
        List<String> methods = new ArrayList<>();
        for (String s : sentences) {
            String lower = s.toLowerCase();
            if (lower.contains("propose") || lower.contains("introduce") || lower.contains("develop") ||
                lower.contains("architecture") || lower.contains("framework") || lower.contains("model") ||
                lower.contains("algorithm") || lower.contains("we design") || lower.contains("utilize")) {
                methods.add(s);
                if (methods.size() >= 3) break;
            }
        }
        if (methods.isEmpty() && sentences.size() > 1) {
            methods.add(sentences.get(1));
        }
        if (methods.isEmpty()) {
            methods.add("Modular analytical architecture and empirical modeling.");
        }
        return methods;
    }

    private List<String> findKeyFindings(List<String> sentences) {
        List<String> findings = new ArrayList<>();
        for (String s : sentences) {
            String lower = s.toLowerCase();
            if (lower.contains("show") || lower.contains("demonstrate") || lower.contains("achieve") ||
                lower.contains("outperform") || lower.contains("results") || lower.contains("improve") ||
                lower.contains("superior") || lower.contains("%")) {
                findings.add(s);
                if (findings.size() >= 3) break;
            }
        }
        if (findings.isEmpty() && !sentences.isEmpty()) {
            findings.add(sentences.getLast());
        }
        if (findings.isEmpty()) {
            findings.add("Demonstrated measurable performance improvements across reference benchmarks.");
        }
        return findings;
    }

    private List<String> inferPracticalApplications(String title, String abstractText) {
        String combined = (title + " " + abstractText).toLowerCase();
        List<String> apps = new ArrayList<>();

        if (combined.contains("neural") || combined.contains("transformer") || combined.contains("llm") || combined.contains("language model")) {
            apps.add("Enhanced natural language processing pipelines and generative AI automation.");
            apps.add("Scalable token generation and context window optimization.");
        }
        if (combined.contains("distributed") || combined.contains("consensus") || combined.contains("cloud") || combined.contains("cluster")) {
            apps.add("High-availability distributed database and event streaming systems.");
            apps.add("Fault-tolerant cloud orchestration and microservices.");
        }
        if (combined.contains("security") || combined.contains("crypt") || combined.contains("vulnerability") || combined.contains("privacy")) {
            apps.add("Zero-trust security postures and cryptographic audit verification.");
            apps.add("Secure data transmission and identity federation.");
        }
        if (combined.contains("database") || combined.contains("query") || combined.contains("sql") || combined.contains("index")) {
            apps.add("Low-latency relational query optimization and indexing strategies.");
        }

        if (apps.isEmpty()) {
            apps.add("Production software systems requiring robust architectural patterns.");
            apps.add("Academic and industrial research R&D prototypes.");
        }

        return apps;
    }

    private List<String> extractStringList(JsonNode arrayNode) {
        List<String> result = new ArrayList<>();
        if (arrayNode != null && arrayNode.isArray()) {
            for (JsonNode n : arrayNode) {
                if (!n.asText().isBlank()) {
                    result.add(n.asText().trim());
                }
            }
        }
        return result;
    }
}
