package com.libravault.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperSummaryDto {

    private String arxivId;
    private String title;
    private String oneSentenceSummary;
    private String coreProblem;
    private List<String> methodology;
    private List<String> keyFindings;
    private List<String> practicalApplications;
    private String provider;
}
