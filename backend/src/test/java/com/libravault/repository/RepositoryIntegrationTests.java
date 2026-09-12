package com.libravault.repository;

import com.libravault.model.entity.AuditLog;
import com.libravault.model.entity.BorrowRecord;
import com.libravault.model.entity.Item;
import com.libravault.model.entity.User;
import com.libravault.model.enums.BorrowStatus;
import com.libravault.model.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RepositoryIntegrationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Verify Flyway seeded users and password hashing")
    void testSeededUsers() {
        Optional<User> adminOpt = userRepository.findByEmail("admin@libravault.com");
        assertThat(adminOpt).isPresent();
        User admin = adminOpt.get();
        assertThat(admin.getRole()).isEqualTo(Role.ROLE_ADMIN);
        assertThat(admin.getFullName()).isEqualTo("System Admin");
        assertThat(passwordEncoder.matches("Password@123", admin.getPasswordHash())).isTrue();

        Optional<User> staffOpt = userRepository.findByEmail("staff@libravault.com");
        assertThat(staffOpt).isPresent();
        assertThat(staffOpt.get().getRole()).isEqualTo(Role.ROLE_STAFF);

        Optional<User> memberOpt = userRepository.findByEmail("member@libravault.com");
        assertThat(memberOpt).isPresent();
        assertThat(memberOpt.get().getRole()).isEqualTo(Role.ROLE_MEMBER);
    }

    @Test
    @DisplayName("Verify Flyway seeded catalog items and query pagination")
    void testSeededItems() {
        List<Item> allItems = itemRepository.findAll();
        assertThat(allItems).hasSizeGreaterThanOrEqualTo(8);

        Page<Item> csItems = itemRepository.findByCategoryIgnoreCase("Computer Science", PageRequest.of(0, 10));
        assertThat(csItems.getContent()).isNotEmpty();
        assertThat(csItems.getContent().stream().allMatch(i -> i.getCategory().equalsIgnoreCase("Computer Science"))).isTrue();

        Optional<Item> cleanCode = itemRepository.findByIsbn("978-0132350884");
        assertThat(cleanCode).isPresent();
        assertThat(cleanCode.get().getTitle()).contains("Clean Code");
        assertThat(cleanCode.get().getAvailableCopies()).isGreaterThan(0);
    }

    @Test
    @DisplayName("Verify ItemRepository pessimistic locking query executes")
    void testPessimisticLockQuery() {
        Item item = itemRepository.findAll().get(0);
        Optional<Item> lockedItem = itemRepository.findByIdWithPessimisticLock(item.getId());
        assertThat(lockedItem).isPresent();
        assertThat(lockedItem.get().getId()).isEqualTo(item.getId());
    }

    @Test
    @DisplayName("Verify BorrowRecord creation and query by status and due date")
    void testBorrowRecordPersistenceAndQueries() {
        User member = userRepository.findByEmail("member@libravault.com").orElseThrow();
        Item item = itemRepository.findAll().get(0);

        Instant now = Instant.now();
        BorrowRecord record = BorrowRecord.builder()
                .user(member)
                .item(item)
                .borrowedAt(now.minus(20, ChronoUnit.DAYS))
                .dueDate(now.minus(6, ChronoUnit.DAYS)) // Overdue by 6 days
                .status(BorrowStatus.ACTIVE)
                .fineAmount(BigDecimal.ZERO)
                .build();

        BorrowRecord saved = borrowRecordRepository.save(record);
        assertThat(saved.getId()).isNotNull();

        // Check findByUserIdAndStatus
        List<BorrowRecord> activeBorrows = borrowRecordRepository.findByUserIdAndStatus(member.getId(), BorrowStatus.ACTIVE);
        assertThat(activeBorrows).isNotEmpty();

        // Check findOverdueRecords
        Page<BorrowRecord> overdueRecords = borrowRecordRepository.findOverdueRecords(now, PageRequest.of(0, 10));
        assertThat(overdueRecords.getContent()).anyMatch(r -> r.getId().equals(saved.getId()));
    }

    @Test
    @DisplayName("Verify AuditLog persistence and order query")
    void testAuditLogPersistence() {
        User admin = userRepository.findByEmail("admin@libravault.com").orElseThrow();

        AuditLog log = AuditLog.builder()
                .actor(admin)
                .actorEmail(admin.getEmail())
                .action("SYSTEM_INIT_VERIFIED")
                .targetType("SYSTEM")
                .targetId(1L)
                .details("{\"message\":\"Week 1 system initialization verified\"}")
                .timestamp(Instant.now())
                .build();

        AuditLog saved = auditLogRepository.save(log);
        assertThat(saved.getId()).isNotNull();

        Page<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, 5));
        assertThat(logs.getContent()).isNotEmpty();
        assertThat(logs.getContent().get(0).getAction()).isEqualTo("SYSTEM_INIT_VERIFIED");
    }
}
