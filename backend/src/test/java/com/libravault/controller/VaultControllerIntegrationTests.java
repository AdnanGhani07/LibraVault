package com.libravault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.libravault.dto.auth.LoginRequest;
import com.libravault.dto.vault.SaveResourceRequest;
import com.libravault.model.enums.ResourceType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class VaultControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String memberToken;

    @BeforeEach
    void setup() throws Exception {
        LoginRequest login = LoginRequest.builder()
                .email("member@libravault.com")
                .password("Password@123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        memberToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("accessToken").asText();
    }

    @Test
    @DisplayName("Should successfully save, check, list, and delete a research paper in Member Vault")
    void fullVaultLifecycle() throws Exception {
        SaveResourceRequest request = SaveResourceRequest.builder()
                .resourceType(ResourceType.RESEARCH_PAPER)
                .externalId("1706.03762")
                .title("Attention Is All You Need")
                .authors("Ashish Vaswani, Noam Shazeer")
                .coverOrPdfUrl("https://arxiv.org/pdf/1706.03762.pdf")
                .categoryOrYear("cs.CL")
                .notes("Key reference paper for transformers.")
                .build();

        // 1. Save paper
        MvcResult saveResult = mockMvc.perform(post("/api/vault/save")
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.externalId", is("1706.03762")))
                .andExpect(jsonPath("$.title", is("Attention Is All You Need")))
                .andExpect(jsonPath("$.resourceType", is("RESEARCH_PAPER")))
                .andReturn();

        long savedId = objectMapper.readTree(saveResult.getResponse().getContentAsString())
                .get("id").asLong();

        // 2. Duplicate save should fail with 409 Conflict
        mockMvc.perform(post("/api/vault/save")
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());

        // 3. Check if saved
        mockMvc.perform(get("/api/vault/check/1706.03762")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saved", is(true)));

        // 4. List my resources
        mockMvc.perform(get("/api/vault/my-resources")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].externalId", is("1706.03762")));

        // 5. Remove resource
        mockMvc.perform(delete("/api/vault/" + savedId)
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isNoContent());

        // 6. Check again -> should be false
        mockMvc.perform(get("/api/vault/check/1706.03762")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saved", is(false)));
    }

    @Test
    @DisplayName("Unauthenticated request to /api/vault/save should be rejected with 401")
    void unauthenticatedSaveRejected() throws Exception {
        SaveResourceRequest request = SaveResourceRequest.builder()
                .resourceType(ResourceType.RESEARCH_PAPER)
                .externalId("2401.00001")
                .title("Unauthorized Paper")
                .build();

        mockMvc.perform(post("/api/vault/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
