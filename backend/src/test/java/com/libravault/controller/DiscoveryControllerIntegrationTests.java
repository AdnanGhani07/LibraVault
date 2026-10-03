package com.libravault.controller;

import com.libravault.dto.discovery.BookSearchResponse;
import com.libravault.dto.discovery.GlobalBookDto;
import com.libravault.dto.discovery.PaperSearchResponse;
import com.libravault.dto.discovery.ResearchPaperDto;
import com.libravault.service.discovery.ArxivDiscoveryService;
import com.libravault.service.discovery.OpenLibraryService;
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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DiscoveryControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ArxivDiscoveryService arxivDiscoveryService;

    @MockBean
    private OpenLibraryService openLibraryService;

    @Test
    @DisplayName("GET /api/discovery/papers should be publicly accessible and return paper list")
    void searchPapersPublicAccess() throws Exception {
        ResearchPaperDto paper = ResearchPaperDto.builder()
                .arxivId("2301.00001")
                .title("Sample Research Paper")
                .summary("Abstract of paper")
                .authors(List.of("Alice Smith", "Bob Jones"))
                .publishedDate("2024-01-01")
                .primaryCategory("cs.AI")
                .pdfUrl("https://arxiv.org/pdf/2301.00001.pdf")
                .bibtex("@article{arxiv_2301_00001}")
                .build();

        PaperSearchResponse response = PaperSearchResponse.builder()
                .query("ai")
                .totalResults(1)
                .page(1)
                .size(10)
                .papers(List.of(paper))
                .build();

        when(arxivDiscoveryService.searchPapers(anyString(), anyString(), anyInt(), anyInt()))
                .thenReturn(response);

        mockMvc.perform(get("/api/discovery/papers")
                        .param("query", "ai")
                        .param("category", "cs.AI")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.papers", hasSize(1)))
                .andExpect(jsonPath("$.papers[0].arxivId", is("2301.00001")))
                .andExpect(jsonPath("$.papers[0].title", is("Sample Research Paper")))
                .andExpect(jsonPath("$.papers[0].pdfUrl", is("https://arxiv.org/pdf/2301.00001.pdf")));
    }

    @Test
    @DisplayName("GET /api/discovery/papers/{arxivId} should return specific paper if found")
    void getPaperByIdSuccess() throws Exception {
        ResearchPaperDto paper = ResearchPaperDto.builder()
                .arxivId("2301.00001")
                .title("Sample Paper")
                .build();

        when(arxivDiscoveryService.getPaperById("2301.00001")).thenReturn(paper);

        mockMvc.perform(get("/api/discovery/papers/2301.00001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.arxivId", is("2301.00001")))
                .andExpect(jsonPath("$.title", is("Sample Paper")));
    }

    @Test
    @DisplayName("GET /api/discovery/books should be publicly accessible and return book list")
    void searchBooksPublicAccess() throws Exception {
        GlobalBookDto book = GlobalBookDto.builder()
                .openLibraryKey("OL12345W")
                .title("Clean Architecture")
                .authors(List.of("Robert C. Martin"))
                .firstPublishYear(2017)
                .build();

        BookSearchResponse response = BookSearchResponse.builder()
                .query("clean")
                .totalResults(1)
                .page(1)
                .size(10)
                .books(List.of(book))
                .build();

        when(openLibraryService.searchBooks(anyString(), anyInt(), anyInt()))
                .thenReturn(response);

        mockMvc.perform(get("/api/discovery/books")
                        .param("query", "clean")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.books", hasSize(1)))
                .andExpect(jsonPath("$.books[0].openLibraryKey", is("OL12345W")))
                .andExpect(jsonPath("$.books[0].title", is("Clean Architecture")));
    }
}
