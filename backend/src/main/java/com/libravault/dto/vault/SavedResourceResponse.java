package com.libravault.dto.vault;

import com.libravault.model.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedResourceResponse {

    private Long id;
    private ResourceType resourceType;
    private String externalId;
    private String title;
    private String authors;
    private String coverOrPdfUrl;
    private String categoryOrYear;
    private String notes;
    private Instant createdAt;
}
