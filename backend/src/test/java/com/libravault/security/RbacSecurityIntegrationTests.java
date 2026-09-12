package com.libravault.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.libravault.dto.auth.LoginRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(RbacSecurityIntegrationTests.TestProtectedControllerConfig.class)
class RbacSecurityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String staffToken;
    private String memberToken;

    @TestConfiguration
    static class TestProtectedControllerConfig {
        @RestController
        @RequestMapping("/api/test-rbac")
        static class TestRbacController {

            @GetMapping("/admin")
            @PreAuthorize("hasRole('ADMIN')")
            public ResponseEntity<Map<String, String>> adminEndpoint() {
                return ResponseEntity.ok(Map.of("message", "Admin access granted"));
            }

            @GetMapping("/staff")
            @PreAuthorize("hasRole('STAFF')")
            public ResponseEntity<Map<String, String>> staffEndpoint() {
                return ResponseEntity.ok(Map.of("message", "Staff access granted"));
            }

            @GetMapping("/member")
            @PreAuthorize("hasRole('MEMBER')")
            public ResponseEntity<Map<String, String>> memberEndpoint() {
                return ResponseEntity.ok(Map.of("message", "Member access granted"));
            }
        }
    }

    @BeforeEach
    void setupTokens() throws Exception {
        adminToken = obtainToken("admin@libravault.com", "Password@123");
        staffToken = obtainToken("staff@libravault.com", "Password@123");
        memberToken = obtainToken("member@libravault.com", "Password@123");
    }

    private String obtainToken(String email, String password) throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email(email)
                .password(password)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        return objectMapper.readTree(json).get("accessToken").asText();
    }

    @Test
    @DisplayName("Admin role should successfully access @PreAuthorize('hasRole(\"ADMIN\")') endpoint")
    void adminCanAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/test-rbac/admin")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Admin access granted")));
    }

    @Test
    @DisplayName("Staff role accessing Admin endpoint should receive 403 Forbidden JSON")
    void staffForbiddenFromAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/test-rbac/admin")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.message", is("You do not have permission to access this resource")));
    }

    @Test
    @DisplayName("Member role accessing Admin endpoint should receive 403 Forbidden JSON")
    void memberForbiddenFromAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/test-rbac/admin")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.message", is("You do not have permission to access this resource")));
    }

    @Test
    @DisplayName("Staff role should successfully access @PreAuthorize('hasRole(\"STAFF\")') endpoint")
    void staffCanAccessStaffEndpoint() throws Exception {
        mockMvc.perform(get("/api/test-rbac/staff")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Staff access granted")));
    }

    @Test
    @DisplayName("Member role accessing Staff endpoint should receive 403 Forbidden JSON")
    void memberForbiddenFromStaffEndpoint() throws Exception {
        mockMvc.perform(get("/api/test-rbac/staff")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("Member role should successfully access @PreAuthorize('hasRole(\"MEMBER\")') endpoint")
    void memberCanAccessMemberEndpoint() throws Exception {
        mockMvc.perform(get("/api/test-rbac/member")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Member access granted")));
    }

    @Test
    @DisplayName("Unauthenticated request to protected endpoint should receive 401 Unauthorized JSON")
    void unauthenticatedAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/test-rbac/admin"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.path", is("/api/test-rbac/admin")));
    }
}
