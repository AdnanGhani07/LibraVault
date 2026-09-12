package com.libravault.service;

import com.libravault.audit.AuditEvent;
import com.libravault.dto.borrow.BorrowRecordResponse;
import com.libravault.dto.borrow.BorrowRequest;
import com.libravault.dto.common.PageResponse;
import com.libravault.exception.BorrowLimitExceededException;
import com.libravault.exception.ItemUnavailableException;
import com.libravault.exception.ResourceNotFoundException;
import com.libravault.model.entity.BorrowRecord;
import com.libravault.model.entity.Item;
import com.libravault.model.entity.User;
import com.libravault.model.enums.BorrowStatus;
import com.libravault.repository.BorrowRecordRepository;
import com.libravault.repository.ItemRepository;
import com.libravault.repository.UserRepository;
import com.libravault.security.UserPrincipal;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class BorrowService {

    public static final int MAX_ACTIVE_BORROWS = 5;
    public static final int DEFAULT_LOAN_DAYS = 14;
    public static final BigDecimal DAILY_FINE_RATE = new BigDecimal("0.50");

    private final BorrowRecordRepository borrowRecordRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public BorrowService(BorrowRecordRepository borrowRecordRepository,
                         ItemRepository itemRepository,
                         UserRepository userRepository,
                         ApplicationEventPublisher eventPublisher) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BorrowRecordResponse processBorrow(BorrowRequest request, UserPrincipal staffActor) {
        User member = userRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + request.getMemberId()));

        long activeBorrows = borrowRecordRepository.countByUserIdAndStatus(member.getId(), BorrowStatus.ACTIVE);
        if (activeBorrows >= MAX_ACTIVE_BORROWS) {
            throw new BorrowLimitExceededException(String.format(
                    "Member '%s' has reached the maximum allowed limit of %d active loans",
                    member.getEmail(), MAX_ACTIVE_BORROWS));
        }

        // Concurrency protection: Pessimistic write lock ensures serialized row access
        Item item = itemRepository.findByIdWithPessimisticLock(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + request.getItemId()));

        if (item.getAvailableCopies() <= 0) {
            throw new ItemUnavailableException(String.format(
                    "Item '%s' has zero available copies for checkout", item.getTitle()));
        }

        // Decrement stock
        item.setAvailableCopies(item.getAvailableCopies() - 1);
        itemRepository.save(item);

        Instant now = Instant.now();
        Instant dueDate = now.plus(DEFAULT_LOAN_DAYS, ChronoUnit.DAYS);

        BorrowRecord record = BorrowRecord.builder()
                .item(item)
                .user(member)
                .borrowedAt(now)
                .dueDate(dueDate)
                .status(BorrowStatus.ACTIVE)
                .fineAmount(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                .build();

        BorrowRecord savedRecord = borrowRecordRepository.save(record);

        eventPublisher.publishEvent(AuditEvent.builder()
                .actorId(staffActor != null ? staffActor.getId() : null)
                .actorEmail(staffActor != null ? staffActor.getUsername() : "SYSTEM")
                .action("BORROW_RECORD_CREATED")
                .targetType("BORROW_RECORD")
                .targetId(savedRecord.getId())
                .details(String.format("Issued '%s' (ISBN: %s) to member '%s'. Due: %s",
                        item.getTitle(), item.getIsbn(), member.getEmail(), dueDate))
                .timestamp(now)
                .build());

        return BorrowRecordResponse.from(savedRecord);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BorrowRecordResponse processReturn(Long recordId, UserPrincipal staffActor) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with id: " + recordId));

        if (record.getStatus() == BorrowStatus.RETURNED) {
            throw new IllegalStateException("Borrow record #" + recordId + " has already been returned on " + record.getReturnedAt());
        }

        Instant now = Instant.now();
        BigDecimal fine = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        if (now.isAfter(record.getDueDate())) {
            long overdueDays = Math.max(1, Duration.between(record.getDueDate(), now).toDays());
            fine = DAILY_FINE_RATE.multiply(BigDecimal.valueOf(overdueDays)).setScale(2, RoundingMode.HALF_UP);
        }

        // Restore available copies with pessimistic lock
        Item item = itemRepository.findByIdWithPessimisticLock(record.getItem().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + record.getItem().getId()));

        item.setAvailableCopies(item.getAvailableCopies() + 1);
        itemRepository.save(item);

        record.setReturnedAt(now);
        record.setStatus(BorrowStatus.RETURNED);
        record.setFineAmount(fine);

        BorrowRecord updatedRecord = borrowRecordRepository.save(record);

        eventPublisher.publishEvent(AuditEvent.builder()
                .actorId(staffActor != null ? staffActor.getId() : null)
                .actorEmail(staffActor != null ? staffActor.getUsername() : "SYSTEM")
                .action("BORROW_RECORD_RETURNED")
                .targetType("BORROW_RECORD")
                .targetId(updatedRecord.getId())
                .details(String.format("Returned '%s' from member '%s'. Fine assessed: $%s",
                        item.getTitle(), record.getUser().getEmail(), fine))
                .timestamp(now)
                .build());

        return BorrowRecordResponse.from(updatedRecord);
    }

    @Transactional(readOnly = true)
    public PageResponse<BorrowRecordResponse> getMemberBorrowHistory(Long userId, Pageable pageable) {
        Page<BorrowRecordResponse> page = borrowRecordRepository
                .findByUserIdOrderByBorrowedAtDesc(userId, pageable)
                .map(BorrowRecordResponse::from);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<BorrowRecordResponse> getOverdueRecords(Pageable pageable) {
        Page<BorrowRecordResponse> page = borrowRecordRepository
                .findOverdueRecords(Instant.now(), pageable)
                .map(BorrowRecordResponse::from);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<BorrowRecordResponse> getAllBorrowRecords(Pageable pageable) {
        Page<BorrowRecordResponse> page = borrowRecordRepository
                .findAll(pageable)
                .map(BorrowRecordResponse::from);
        return PageResponse.from(page);
    }
}
