package com.libravault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.libravault.dto.auth.LoginRequest;
import com.libravault.dto.auth.AuthResponse;
import com.libravault.dto.item.CreateItemRequest;
import com.libravault.dto.item.UpdateItemRequest;
import com.libravault.model.entity.Item;
import com.libravault.repository.ItemRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ItemControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ItemRepository itemRepository;

    private String adminToken;
    private String memberToken;

    @BeforeEach
    void setUp() throws Exception {
        adminToken = obtainToken("admin@libravault.com", "Password@123");
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

        AuthResponse authResponse = objectMapper.readValue(
                result.getResponse().getContentAsString(), AuthResponse.class);
        return authResponse.getAccessToken();
    }

    @Test
    @DisplayName("Public user can view items list with pagination")
    void testPublicGetAllItems() throws Exception {
        mockMvc.perform(get("/api/items")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.pageSize").value(5));
    }

    @Test
    @DisplayName("Admin can create a new inventory item")
    void testAdminCreateItem() throws Exception {
        String uniqueIsbn = "978-0-TEST-" + System.currentTimeMillis();
        CreateItemRequest request = CreateItemRequest.builder()
                .title("Clean Architecture in Practice")
                .isbn(uniqueIsbn)
                .author("Robert C. Martin")
                .category("Software Engineering")
                .totalCopies(4)
                .build();

        mockMvc.perform(post("/api/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Clean Architecture in Practice"))
                .andExpect(jsonPath("$.isbn").value(uniqueIsbn))
                .andExpect(jsonPath("$.totalCopies").value(4))
                .andExpect(jsonPath("$.availableCopies").value(4));
    }

    @Test
    @DisplayName("Member is forbidden from creating an item")
    void testMemberCannotCreateItem() throws Exception {
        CreateItemRequest request = CreateItemRequest.builder()
                .title("Unauthorized Book")
                .isbn("978-0-UNAUTH-1")
                .author("Jane Doe")
                .category("Fiction")
                .totalCopies(1)
                .build();

        mockMvc.perform(post("/api/items")
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Admin receives 409 Conflict when creating item with duplicate ISBN")
    void testDuplicateIsbnConflict() throws Exception {
        CreateItemRequest request = CreateItemRequest.builder()
                .title("Duplicate ISBN Test")
                .isbn("978-0132350884") // Clean Code ISBN from V2 seed
                .author("Robert C. Martin")
                .category("Software Engineering")
                .totalCopies(2)
                .build();

        mockMvc.perform(post("/api/items")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already exists")));
    }

    @Test
    @DisplayName("Admin can update existing item")
    void testAdminUpdateItem() throws Exception {
        // Create an item first
        String uniqueIsbn = "978-0-UPD-" + System.currentTimeMillis();
        Item item = itemRepository.save(Item.builder()
                .title("Original Title")
                .isbn(uniqueIsbn)
                .author("Author One")
                .category("Computer Science")
                .totalCopies(3)
                .availableCopies(3)
                .build());

        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .title("Updated Title")
                .author("Author Two")
                .category("Computer Science")
                .totalCopies(5)
                .build();

        mockMvc.perform(put("/api/items/" + item.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.author").value("Author Two"))
                .andExpect(jsonPath("$.totalCopies").value(5))
                .andExpect(jsonPath("$.availableCopies").value(5));
    }

    @Test
    @DisplayName("Admin can delete item without active loans")
    void testAdminDeleteItem() throws Exception {
        String uniqueIsbn = "978-0-DEL-" + System.currentTimeMillis();
        Item item = itemRepository.save(Item.builder()
                .title("Item to Delete")
                .isbn(uniqueIsbn)
                .author("Author")
                .category("General")
                .totalCopies(1)
                .availableCopies(1)
                .build());

        mockMvc.perform(delete("/api/items/" + item.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        assertThat(itemRepository.findById(item.getId())).isEmpty();
    }
}
