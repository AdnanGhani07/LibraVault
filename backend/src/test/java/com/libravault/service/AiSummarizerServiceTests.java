package com.libravault.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.libravault.dto.ai.PaperSummaryDto;
import com.libravault.dto.ai.PaperSummaryRequest;
import com.libravault.service.ai.AiSummarizerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;

class AiSummarizerServiceTests {

    private AiSummarizerService service;

    @BeforeEach
    void setUp() {
        service = new AiSummarizerService(RestClient.builder(), new ObjectMapper());
    }

    @Test
    @DisplayName("Should heuristically summarize academic paper abstract when no external API key is present")
    void testHeuristicSummarizerWithRealisticAbstract() {
        String title = "Attention Is All You Need";
        String abstractText = "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. " +
                "However, recurrent models suffer from sequential computation bottlenecks that limit parallelization. " +
                "In this paper, we propose the Transformer, a model architecture eschewing recurrence and relying entirely on an attention mechanism. " +
                "Experiments on two machine translation tasks show the models to be superior in quality while being more parallelizable and requiring significantly less time to train. " +
                "Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results by over 2 BLEU.";

        PaperSummaryRequest request = PaperSummaryRequest.builder()
                .arxivId("1706.03762")
                .title(title)
                .abstractText(abstractText)
                .build();

        PaperSummaryDto result = service.summarizePaper(request);

        assertThat(result).isNotNull();
        assertThat(result.getArxivId()).isEqualTo("1706.03762");
        assertThat(result.getTitle()).isEqualTo("Attention Is All You Need");
        assertThat(result.getProvider()).isEqualTo("HEURISTIC_FALLBACK");

        assertThat(result.getOneSentenceSummary()).contains("Transformer");
        assertThat(result.getCoreProblem()).contains("bottleneck");
        assertThat(result.getMethodology()).isNotEmpty();
        assertThat(result.getKeyFindings()).isNotEmpty();
        assertThat(result.getPracticalApplications()).isNotEmpty();
    }

    @Test
    @DisplayName("Should handle empty or null abstract without throwing exceptions")
    void testHeuristicSummarizerWithEmptyAbstract() {
        PaperSummaryDto result = service.summarizeWithHeuristics("Title Only", "", "2401.00000");

        assertThat(result).isNotNull();
        assertThat(result.getOneSentenceSummary()).isNotBlank();
        assertThat(result.getProvider()).isEqualTo("HEURISTIC_FALLBACK");
    }
}
