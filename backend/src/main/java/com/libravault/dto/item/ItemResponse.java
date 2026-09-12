package com.libravault.dto.item;

import com.libravault.model.entity.Item;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemResponse {

    private Long id;
    private String title;
    private String isbn;
    private String author;
    private String category;
    private Integer totalCopies;
    private Integer availableCopies;
    private Instant createdAt;
    private Instant updatedAt;

    public static ItemResponse from(Item item) {
        return ItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .isbn(item.getIsbn())
                .author(item.getAuthor())
                .category(item.getCategory())
                .totalCopies(item.getTotalCopies())
                .availableCopies(item.getAvailableCopies())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
