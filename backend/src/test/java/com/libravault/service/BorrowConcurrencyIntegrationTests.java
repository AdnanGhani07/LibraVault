package com.libravault.service;

import com.libravault.dto.borrow.BorrowRequest;
import com.libravault.exception.ItemUnavailableException;
import com.libravault.model.entity.Item;
import com.libravault.model.entity.User;
import com.libravault.model.enums.Role;
import com.libravault.repository.ItemRepository;
import com.libravault.repository.UserRepository;
import com.libravault.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class BorrowConcurrencyIntegrationTests {

    @Autowired
    private BorrowService borrowService;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Pessimistic Locking ensures only 1 borrow succeeds when 1 copy is available under concurrent requests")
    void testConcurrentBorrowingPessimisticLock() throws Exception {
        // Create an item with exactly 1 copy available
        Item item = itemRepository.save(Item.builder()
                .title("High Demand Concurrent Book")
                .isbn("978-0-CONCUR-" + System.currentTimeMillis())
                .author("Concurrency Expert")
                .category("Database Systems")
                .totalCopies(1)
                .availableCopies(1)
                .build());

        // Create 5 distinct members so borrowing limits per member are not exceeded
        List<User> members = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            User member = userRepository.save(User.builder()
                    .email("concurrent_member_" + i + "_" + System.currentTimeMillis() + "@libravault.com")
                    .passwordHash("hashedpassword")
                    .fullName("Concurrent Member " + i)
                    .role(Role.ROLE_MEMBER)
                    .build());
            members.add(member);
        }

        User staffUser = userRepository.findByEmail("staff@libravault.com").orElseThrow();
        UserPrincipal staffPrincipal = UserPrincipal.create(staffUser);

        int numberOfThreads = 5;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(numberOfThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            final User currentMember = members.get(i);
            executor.submit(() -> {
                try {
                    startLatch.await(); // wait for all threads to align
                    BorrowRequest request = BorrowRequest.builder()
                            .memberId(currentMember.getId())
                            .itemId(item.getId())
                            .build();

                    borrowService.processBorrow(request, staffPrincipal);
                    successCount.incrementAndGet();
                } catch (ItemUnavailableException e) {
                    failureCount.incrementAndGet();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        // Release all threads simultaneously to trigger maximum contention
        startLatch.countDown();
        boolean completed = finishLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertThat(completed).isTrue();
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(4);

        // Verify database state: available copies must be exactly 0, never negative
        Item finalItemState = itemRepository.findById(item.getId()).orElseThrow();
        assertThat(finalItemState.getAvailableCopies()).isEqualTo(0);
    }
}
