package com.libravault.service.discovery;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.libravault.dto.discovery.BookSearchResponse;
import com.libravault.dto.discovery.GlobalBookDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class OpenLibraryService {

    private static final Logger log = LoggerFactory.getLogger(OpenLibraryService.class);
    private static final String OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public OpenLibraryService(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public BookSearchResponse searchBooks(String query, int page, int size) {
        int safePage = Math.max(1, page);
        int safeSize = Math.min(Math.max(1, size), 50);

        String searchQuery = (query != null && !query.trim().isBlank()) ? query.trim() : "computer science";

        try {
            String encodedQuery = URLEncoder.encode(searchQuery, StandardCharsets.UTF_8);
            String url = String.format("%s?q=%s&page=%d&limit=%d", OPEN_LIBRARY_SEARCH_URL, encodedQuery, safePage, safeSize);

            log.info("Fetching global books from Open Library: query='{}', page={}, size={}", searchQuery, safePage, safeSize);

            String jsonResponse = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (jsonResponse == null || jsonResponse.isBlank()) {
                return BookSearchResponse.builder()
                        .query(searchQuery)
                        .totalResults(0)
                        .page(safePage)
                        .size(safeSize)
                        .books(List.of())
                        .build();
            }

            return parseOpenLibraryJson(jsonResponse, searchQuery, safePage, safeSize);
        } catch (Exception e) {
            log.error("Failed to query or parse Open Library for query='{}': {}", searchQuery, e.getMessage(), e);
            return BookSearchResponse.builder()
                    .query(searchQuery)
                    .totalResults(0)
                    .page(safePage)
                    .size(safeSize)
                    .books(List.of())
                    .build();
        }
    }

    public BookSearchResponse parseOpenLibraryJson(String json, String query, int page, int size) {
        try {
            JsonNode root = objectMapper.readTree(json);
            int totalResults = root.path("numFound").asInt(0);
            JsonNode docsNode = root.path("docs");

            List<GlobalBookDto> books = new ArrayList<>();
            if (docsNode.isArray()) {
                for (JsonNode doc : docsNode) {
                    GlobalBookDto book = parseDoc(doc);
                    if (book != null) {
                        books.add(book);
                    }
                }
            }

            return BookSearchResponse.builder()
                    .query(query)
                    .totalResults(totalResults)
                    .page(page)
                    .size(size)
                    .books(books)
                    .build();
        } catch (Exception e) {
            log.error("Error parsing Open Library JSON response: {}", e.getMessage());
            return BookSearchResponse.builder()
                    .query(query)
                    .totalResults(0)
                    .page(page)
                    .size(size)
                    .books(List.of())
                    .build();
        }
    }

    private GlobalBookDto parseDoc(JsonNode doc) {
        String key = doc.path("key").asText("");
        String cleanKey = key.startsWith("/works/") ? key.substring(7) : key;
        String title = doc.path("title").asText("Untitled");

        List<String> authors = new ArrayList<>();
        JsonNode authorNode = doc.path("author_name");
        if (authorNode.isArray()) {
            for (JsonNode a : authorNode) {
                authors.add(a.asText());
            }
        }

        Integer firstPublishYear = doc.has("first_publish_year") ? doc.path("first_publish_year").asInt() : null;

        String isbn = null;
        JsonNode isbnNode = doc.path("isbn");
        if (isbnNode.isArray() && !isbnNode.isEmpty()) {
            isbn = isbnNode.get(0).asText();
        }

        String coverUrl = null;
        if (doc.has("cover_i")) {
            long coverId = doc.path("cover_i").asLong(0);
            if (coverId > 0) {
                coverUrl = String.format("https://covers.openlibrary.org/b/id/%d-M.jpg", coverId);
            }
        }

        int editionCount = doc.path("edition_count").asInt(1);
        boolean hasFullText = doc.path("has_fulltext").asBoolean(false);

        String readUrl = null;
        JsonNode iaNode = doc.path("ia");
        if (iaNode.isArray() && !iaNode.isEmpty()) {
            String iaId = iaNode.get(0).asText();
            if (!iaId.isBlank()) {
                readUrl = String.format("https://archive.org/details/%s", iaId);
            }
        }
        if (readUrl == null && !key.isBlank()) {
            readUrl = String.format("https://openlibrary.org%s", key.startsWith("/") ? key : "/" + key);
        }

        return GlobalBookDto.builder()
                .openLibraryKey(cleanKey)
                .title(title)
                .authors(authors)
                .firstPublishYear(firstPublishYear)
                .isbn(isbn)
                .coverUrl(coverUrl)
                .editionCount(editionCount)
                .hasFullText(hasFullText)
                .readUrl(readUrl)
                .build();
    }
}
