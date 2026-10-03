package com.libravault.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperSummaryRequest {

    private String arxivId;

    @NotBlank(message = "Title is required for summarization")
    private String title;

    @NotBlank(message = "Abstract text is required for summarization")
    private String abstractText;
}
