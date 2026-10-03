package com.libravault.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.libravault.dto.discovery.BookSearchResponse;
import com.libravault.dto.discovery.GlobalBookDto;
import com.libravault.service.discovery.OpenLibraryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;

class OpenLibraryServiceTests {

    private OpenLibraryService service;

    @BeforeEach
    void setUp() {
        service = new OpenLibraryService(RestClient.builder(), new ObjectMapper());
    }

    @Test
    @DisplayName("Should parse valid Open Library search JSON into GlobalBookDto list")
    void testParseOpenLibraryJson() {
        String json = """
                {
                  "numFound": 42,
                  "start": 0,
                  "docs": [
                    {
                      "key": "/works/OL45883W",
                      "title": "Clean Code",
                      "author_name": ["Robert C. Martin"],
                      "first_publish_year": 2008,
                      "isbn": ["9780132350884", "0132350882"],
                      "cover_i": 8231990,
                      "edition_count": 14,
                      "has_fulltext": true,
                      "ia": ["cleancodetechniq0000mart"]
                    }
                  ]
                }
                """;

        BookSearchResponse response = service.parseOpenLibraryJson(json, "Clean Code", 1, 10);

        assertThat(response).isNotNull();
        assertThat(response.getTotalResults()).isEqualTo(42);
        assertThat(response.getBooks()).hasSize(1);

        GlobalBookDto book = response.getBooks().getFirst();
        assertThat(book.getOpenLibraryKey()).isEqualTo("OL45883W");
        assertThat(book.getTitle()).isEqualTo("Clean Code");
        assertThat(book.getAuthors()).containsExactly("Robert C. Martin");
        assertThat(book.getFirstPublishYear()).isEqualTo(2008);
        assertThat(book.getIsbn()).isEqualTo("9780132350884");
        assertThat(book.getCoverUrl()).isEqualTo("https://covers.openlibrary.org/b/id/8231990-M.jpg");
        assertThat(book.getEditionCount()).isEqualTo(14);
        assertThat(book.getHasFullText()).isTrue();
        assertThat(book.getReadUrl()).isEqualTo("https://archive.org/details/cleancodetechniq0000mart");
    }

    @Test
    @DisplayName("Should handle missing optional fields safely")
    void testParseSparseBookJson() {
        String json = """
                {
                  "numFound": 1,
                  "docs": [
                    {
                      "key": "/works/OL99999W",
                      "title": "Unknown Book"
                    }
                  ]
                }
                """;

        BookSearchResponse response = service.parseOpenLibraryJson(json, "Unknown", 1, 10);

        assertThat(response).isNotNull();
        assertThat(response.getBooks()).hasSize(1);
        GlobalBookDto book = response.getBooks().getFirst();
        assertThat(book.getTitle()).isEqualTo("Unknown Book");
        assertThat(book.getAuthors()).isEmpty();
        assertThat(book.getCoverUrl()).isNull();
        assertThat(book.getReadUrl()).isEqualTo("https://openlibrary.org/works/OL99999W");
    }
}
