package com.libravault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.libravault.dto.auth.AuthResponse;
import com.libravault.dto.auth.LoginRequest;
import com.libravault.dto.borrow.BorrowRequest;
import com.libravault.model.entity.BorrowRecord;
import com.libravault.model.entity.Item;
import com.libravault.model.entity.User;
import com.libravault.model.enums.BorrowStatus;
import com.libravault.repository.BorrowRecordRepository;
import com.libravault.repository.ItemRepository;
import com.libravault.repository.UserRepository;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BorrowControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    private String staffToken;
    private String memberToken;
    private User testMember;
    private Item testItem;

    @BeforeEach
    void setUp() throws Exception {
        borrowRecordRepository.deleteAll();
        staffToken = obtainToken("staff@libravault.com", "Password@123");
        memberToken = obtainToken("member@libravault.com", "Password@123");
        testMember = userRepository.findByEmail("member@libravault.com").orElseThrow();

        // Create fresh test item for each test
        testItem = itemRepository.save(Item.builder()
                .title("Test Borrow Book")
                .isbn("978-0-BORROW-" + System.currentTimeMillis())
                .author("Test Author")
                .category("Science")
                .totalCopies(3)
                .availableCopies(3)
                .build());
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
    @DisplayName("Staff can issue book and available copies decrement")
    void testStaffIssueBook() throws Exception {
        BorrowRequest request = BorrowRequest.builder()
                .memberId(testMember.getId())
                .itemId(testItem.getId())
                .build();

        mockMvc.perform(post("/api/borrow-records")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.itemId").value(testItem.getId()))
                .andExpect(jsonPath("$.userId").value(testMember.getId()))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.fineAmount").value(0.00));

        Item updatedItem = itemRepository.findById(testItem.getId()).orElseThrow();
        assertThat(updatedItem.getAvailableCopies()).isEqualTo(2);
    }

    @Test
    @DisplayName("Staff issuing book with 0 available copies returns 409 Conflict")
    void testIssueZeroStockItemFails() throws Exception {
        // Set item available copies to 0
        testItem.setAvailableCopies(0);
        itemRepository.save(testItem);

        BorrowRequest request = BorrowRequest.builder()
                .memberId(testMember.getId())
                .itemId(testItem.getId())
                .build();

        mockMvc.perform(post("/api/borrow-records")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("zero available copies")));
    }

    @Test
    @DisplayName("Member exceeding 5 active borrows is rejected with 400 Bad Request")
    void testBorrowLimitExceeded() throws Exception {
        // Create 5 active borrows for testMember
        for (int i = 0; i < 5; i++) {
            borrowRecordRepository.save(BorrowRecord.builder()
                    .item(testItem)
                    .user(testMember)
                    .borrowedAt(Instant.now())
                    .dueDate(Instant.now().plus(14, ChronoUnit.DAYS))
                    .status(BorrowStatus.ACTIVE)
                    .fineAmount(BigDecimal.ZERO)
                    .build());
        }

        BorrowRequest request = BorrowRequest.builder()
                .memberId(testMember.getId())
                .itemId(testItem.getId())
                .build();

        mockMvc.perform(post("/api/borrow-records")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("maximum allowed limit")));
    }

    @Test
    @DisplayName("Staff returns book on time: status RETURNED, fine is $0.00, stock restored")
    void testReturnBookOnTime() throws Exception {
        testItem.setAvailableCopies(2);
        itemRepository.save(testItem);

        BorrowRecord record = borrowRecordRepository.save(BorrowRecord.builder()
                .item(testItem)
                .user(testMember)
                .borrowedAt(Instant.now().minus(5, ChronoUnit.DAYS))
                .dueDate(Instant.now().plus(9, ChronoUnit.DAYS))
                .status(BorrowStatus.ACTIVE)
                .fineAmount(BigDecimal.ZERO)
                .build());

        mockMvc.perform(put("/api/borrow-records/" + record.getId() + "/return")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETURNED"))
                .andExpect(jsonPath("$.fineAmount").value(0.00));

        Item restoredItem = itemRepository.findById(testItem.getId()).orElseThrow();
        assertThat(restoredItem.getAvailableCopies()).isEqualTo(3);
    }

    @Test
    @DisplayName("Staff returns overdue book: fine calculated at $0.50 per day late")
    void testReturnOverdueBookCalculatesFine() throws Exception {
        testItem.setAvailableCopies(1);
        itemRepository.save(testItem);

        // 4 days overdue
        BorrowRecord record = borrowRecordRepository.save(BorrowRecord.builder()
                .item(testItem)
                .user(testMember)
                .borrowedAt(Instant.now().minus(18, ChronoUnit.DAYS))
                .dueDate(Instant.now().minus(4, ChronoUnit.DAYS))
                .status(BorrowStatus.ACTIVE)
                .fineAmount(BigDecimal.ZERO)
                .build());

        mockMvc.perform(put("/api/borrow-records/" + record.getId() + "/return")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETURNED"))
                .andExpect(jsonPath("$.fineAmount").value(2.00)); // 4 days * $0.50 = $2.00

        Item restoredItem = itemRepository.findById(testItem.getId()).orElseThrow();
        assertThat(restoredItem.getAvailableCopies()).isEqualTo(2);
    }

    @Test
    @DisplayName("Member can view their own borrowing history")
    void testMemberMyHistory() throws Exception {
        borrowRecordRepository.save(BorrowRecord.builder()
                .item(testItem)
                .user(testMember)
                .borrowedAt(Instant.now())
                .dueDate(Instant.now().plus(14, ChronoUnit.DAYS))
                .status(BorrowStatus.ACTIVE)
                .fineAmount(BigDecimal.ZERO)
                .build());

        mockMvc.perform(get("/api/borrow-records/my-history")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("Member cannot perform staff checkout desk operations")
    void testMemberCannotIssueBook() throws Exception {
        BorrowRequest request = BorrowRequest.builder()
                .memberId(testMember.getId())
                .itemId(testItem.getId())
                .build();

        mockMvc.perform(post("/api/borrow-records")
                        .header("Authorization", "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }
}
