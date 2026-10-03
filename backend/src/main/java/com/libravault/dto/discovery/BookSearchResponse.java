package com.libravault.dto.discovery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookSearchResponse {
    private String query;
    private int totalResults;
    private int page;
    private int size;
    private List<GlobalBookDto> books;
}
