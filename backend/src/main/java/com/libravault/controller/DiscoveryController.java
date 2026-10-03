package com.libravault.controller;

import com.libravault.dto.discovery.BookSearchResponse;
import com.libravault.dto.discovery.PaperSearchResponse;
import com.libravault.dto.discovery.ResearchPaperDto;
import com.libravault.service.discovery.ArxivDiscoveryService;
import com.libravault.service.discovery.OpenLibraryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discovery")
@Tag(name = "Discovery", description = "Endpoints for discovering open academic research papers (arXiv) and world literature (Open Library)")
public class DiscoveryController {

    private final ArxivDiscoveryService arxivDiscoveryService;
    private final OpenLibraryService openLibraryService;

    public DiscoveryController(ArxivDiscoveryService arxivDiscoveryService, OpenLibraryService openLibraryService) {
        this.arxivDiscoveryService = arxivDiscoveryService;
        this.openLibraryService = openLibraryService;
    }

    @GetMapping("/papers")
    @Operation(summary = "Search peer-reviewed academic research papers on arXiv with open-access PDFs and abstracts")
    public ResponseEntity<PaperSearchResponse> searchPapers(
            @Parameter(description = "Keywords to search in title, abstract, or authors")
            @RequestParam(required = false, defaultValue = "") String query,
            @Parameter(description = "arXiv category filter (e.g. cs.AI, cs.SE, cs.CR, cs.DC, stat.ML)")
            @RequestParam(required = false) String category,
            @Parameter(description = "Page number (1-based)")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of papers per page (max 50)")
            @RequestParam(defaultValue = "10") int size
    ) {
        PaperSearchResponse response = arxivDiscoveryService.searchPapers(query, category, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/papers/{arxivId}")
    @Operation(summary = "Retrieve specific paper metadata, BibTeX citation, and PDF links by arXiv ID")
    public ResponseEntity<ResearchPaperDto> getPaperById(
            @Parameter(description = "arXiv identifier (e.g. 2301.00001)")
            @PathVariable String arxivId
    ) {
        ResearchPaperDto paper = arxivDiscoveryService.getPaperById(arxivId);
        if (paper == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(paper);
    }

    @GetMapping("/books")
    @Operation(summary = "Search world books, edition counts, and cover art on Open Library")
    public ResponseEntity<BookSearchResponse> searchBooks(
            @Parameter(description = "Keywords, title, or author name")
            @RequestParam(required = false, defaultValue = "") String query,
            @Parameter(description = "Page number (1-based)")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of books per page (max 50)")
            @RequestParam(defaultValue = "10") int size
    ) {
        BookSearchResponse response = openLibraryService.searchBooks(query, page, size);
        return ResponseEntity.ok(response);
    }
}
