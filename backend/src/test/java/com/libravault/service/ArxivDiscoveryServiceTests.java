package com.libravault.service;

import com.libravault.dto.discovery.PaperSearchResponse;
import com.libravault.dto.discovery.ResearchPaperDto;
import com.libravault.service.discovery.ArxivDiscoveryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;

class ArxivDiscoveryServiceTests {

    private ArxivDiscoveryService service;

    @BeforeEach
    void setUp() {
        service = new ArxivDiscoveryService(RestClient.builder());
    }

    @Test
    @DisplayName("Should parse valid arXiv Atom XML response into structured DTOs")
    void testParseArxivXml() throws Exception {
        String xml = """
                <?xml version="1.0" encoding="UTF-8"?>
                <feed xmlns="http://www.w3.org/2005/Atom"
                      xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/"
                      xmlns:arxiv="http://arxiv.org/schemas/atom">
                  <title type="html">ArXiv Query: search_query=all:transformer</title>
                  <id>http://arxiv.org/api/query?search_query=all:transformer</id>
                  <updated>2024-05-01T00:00:00Z</updated>
                  <opensearch:totalResults>105</opensearch:totalResults>
                  <opensearch:startIndex>0</opensearch:startIndex>
                  <opensearch:itemsPerPage>1</opensearch:itemsPerPage>
                  <entry>
                    <id>http://arxiv.org/abs/1706.03762v7</id>
                    <published>2017-06-12T00:00:00Z</published>
                    <title>
                      Attention Is All You Need
                    </title>
                    <summary>
                      The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.
                    </summary>
                    <author>
                      <name>Ashish Vaswani</name>
                    </author>
                    <author>
                      <name>Noam Shazeer</name>
                    </author>
                    <arxiv:doi>10.48550/arXiv.1706.03762</arxiv:doi>
                    <arxiv:journal_ref>Advances in Neural Information Processing Systems 30 (NIPS 2017)</arxiv:journal_ref>
                    <link href="http://arxiv.org/abs/1706.03762v7" rel="alternate" type="text/html"/>
                    <link title="pdf" href="http://arxiv.org/pdf/1706.03762v7" rel="related" type="application/pdf"/>
                    <arxiv:primary_category xmlns:arxiv="http://arxiv.org/schemas/atom" term="cs.CL" scheme="http://arxiv.org/schemas/atom"/>
                    <category term="cs.CL" scheme="http://arxiv.org/schemas/atom"/>
                    <category term="cs.AI" scheme="http://arxiv.org/schemas/atom"/>
                  </entry>
                </feed>
                """;

        PaperSearchResponse response = service.parseArxivXml(xml, "transformer", "cs.AI", 1, 10);

        assertThat(response).isNotNull();
        assertThat(response.getTotalResults()).isEqualTo(105);
        assertThat(response.getPapers()).hasSize(1);

        ResearchPaperDto paper = response.getPapers().getFirst();
        assertThat(paper.getArxivId()).isEqualTo("1706.03762v7");
        assertThat(paper.getTitle()).isEqualTo("Attention Is All You Need");
        assertThat(paper.getSummary()).contains("The dominant sequence transduction models");
        assertThat(paper.getAuthors()).containsExactly("Ashish Vaswani", "Noam Shazeer");
        assertThat(paper.getPublishedDate()).isEqualTo("2017-06-12");
        assertThat(paper.getPrimaryCategory()).isEqualTo("cs.CL");
        assertThat(paper.getCategories()).contains("cs.CL", "cs.AI");
        assertThat(paper.getPdfUrl()).isEqualTo("https://arxiv.org/pdf/1706.03762v7");
        assertThat(paper.getAbsUrl()).isEqualTo("https://arxiv.org/abs/1706.03762v7");
        assertThat(paper.getDoi()).isEqualTo("10.48550/arXiv.1706.03762");
        assertThat(paper.getJournalRef()).contains("NIPS 2017");
        assertThat(paper.getBibtex()).contains("@article{arxiv_1706_03762v7");
        assertThat(paper.getBibtex()).contains("author={Ashish Vaswani and Noam Shazeer}");
    }

    @Test
    @DisplayName("Should gracefully handle empty or zero-result XML feeds")
    void testParseEmptyArxivXml() throws Exception {
        String xml = """
                <?xml version="1.0" encoding="UTF-8"?>
                <feed xmlns="http://www.w3.org/2005/Atom"
                      xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/">
                  <title>Zero results</title>
                  <opensearch:totalResults>0</opensearch:totalResults>
                </feed>
                """;

        PaperSearchResponse response = service.parseArxivXml(xml, "nonexistentquery123", null, 1, 10);

        assertThat(response).isNotNull();
        assertThat(response.getTotalResults()).isZero();
        assertThat(response.getPapers()).isEmpty();
    }
}
