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
public class GlobalBookDto {
    private String openLibraryKey;
    private String title;
    private List<String> authors;
    private Integer firstPublishYear;
    private String isbn;
    private String coverUrl;
    private Integer editionCount;
    private Boolean hasFullText;
    private String readUrl;
}
