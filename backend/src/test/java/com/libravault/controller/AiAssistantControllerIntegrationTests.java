package com.libravault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.libravault.dto.ai.PaperSummaryDto;
import com.libravault.dto.ai.PaperSummaryRequest;
import com.libravault.service.ai.AiSummarizerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiAssistantControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AiSummarizerService aiSummarizerService;

    @Test
    @DisplayName("POST /api/ai/summarize should return structured breakdown")
    void summarizePaperSuccess() throws Exception {
        PaperSummaryDto dto = PaperSummaryDto.builder()
                .arxivId("2301.00001")
                .title("A Study on Distributed Systems")
                .oneSentenceSummary("This paper explores distributed consensus mechanisms.")
                .coreProblem("High latency under partitioned networks.")
                .methodology(List.of("Byzantine fault tolerance"))
                .keyFindings(List.of("Reduced consensus delay by 40%"))
                .practicalApplications(List.of("Cloud databases"))
                .provider("HEURISTIC_FALLBACK")
                .build();

        when(aiSummarizerService.summarizePaper(any())).thenReturn(dto);

        PaperSummaryRequest request = PaperSummaryRequest.builder()
                .arxivId("2301.00001")
                .title("A Study on Distributed Systems")
                .abstractText("This paper explores distributed consensus mechanisms. High latency under partitioned networks...")
                .build();

        mockMvc.perform(post("/api/ai/summarize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.arxivId", is("2301.00001")))
                .andExpect(jsonPath("$.oneSentenceSummary", is("This paper explores distributed consensus mechanisms.")))
                .andExpect(jsonPath("$.coreProblem", is("High latency under partitioned networks.")))
                .andExpect(jsonPath("$.provider", is("HEURISTIC_FALLBACK")));
    }

    @Test
    @DisplayName("POST /api/ai/summarize with blank title should return 400 Bad Request")
    void summarizePaperValidationFailure() throws Exception {
        PaperSummaryRequest request = PaperSummaryRequest.builder()
                .title("")
                .abstractText("Some abstract text here")
                .build();

        mockMvc.perform(post("/api/ai/summarize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
