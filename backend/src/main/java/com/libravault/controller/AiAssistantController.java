package com.libravault.controller;

import com.libravault.dto.ai.PaperSummaryDto;
import com.libravault.dto.ai.PaperSummaryRequest;
import com.libravault.service.ai.AiSummarizerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Assistant", description = "AI-powered microservices for scientific paper summarization and research insights")
public class AiAssistantController {

    private final AiSummarizerService aiSummarizerService;

    public AiAssistantController(AiSummarizerService aiSummarizerService) {
        this.aiSummarizerService = aiSummarizerService;
    }

    @PostMapping("/summarize")
    @Operation(summary = "Distill paper abstract into structured executive takeaways (TL;DR, core problem, methodology, findings, and applications)")
    public ResponseEntity<PaperSummaryDto> summarizePaper(@Valid @RequestBody PaperSummaryRequest request) {
        PaperSummaryDto summary = aiSummarizerService.summarizePaper(request);
        return ResponseEntity.ok(summary);
    }
}
