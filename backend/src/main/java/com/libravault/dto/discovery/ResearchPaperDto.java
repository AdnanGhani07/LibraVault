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
public class ResearchPaperDto {
    private String arxivId;
    private String title;
    private String summary;
    private List<String> authors;
    private String publishedDate;
    private String updatedDate;
    private String primaryCategory;
    private List<String> categories;
    private String pdfUrl;
    private String absUrl;
    private String doi;
    private String journalRef;
    private String bibtex;
}
