package com.libravault.dto.vault;

import com.libravault.model.enums.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveResourceRequest {

    @NotNull(message = "Resource type is required (RESEARCH_PAPER or EXTERNAL_BOOK)")
    private ResourceType resourceType;

    @NotBlank(message = "External ID is required (e.g. arXiv ID or Open Library Key)")
    private String externalId;

    @NotBlank(message = "Title is required")
    private String title;

    private String authors;
    private String coverOrPdfUrl;
    private String categoryOrYear;
    private String notes;
}
