package com.libravault.controller;

import com.libravault.dto.borrow.BorrowRecordResponse;
import com.libravault.dto.borrow.BorrowRequest;
import com.libravault.dto.common.PageResponse;
import com.libravault.security.UserPrincipal;
import com.libravault.service.BorrowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/borrow-records")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Borrow Operations", description = "Endpoints for book checkouts, returns, fines, and borrowing history")
public class BorrowController {

    private final BorrowService borrowService;

    public BorrowController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Issue book to member (Staff)", description = "Checkout an available book copy to a member with concurrency protection")
    public ResponseEntity<BorrowRecordResponse> issueBook(
            @Valid @RequestBody BorrowRequest request,
            @AuthenticationPrincipal UserPrincipal staffPrincipal) {

        BorrowRecordResponse response = borrowService.processBorrow(request, staffPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/return")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Process book return (Staff)", description = "Return an active loan, compute overdue fines if late, and restore available stock")
    public ResponseEntity<BorrowRecordResponse> returnBook(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal staffPrincipal) {

        return ResponseEntity.ok(borrowService.processReturn(id, staffPrincipal));
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasAnyRole('MEMBER', 'STAFF', 'ADMIN')")
    @Operation(summary = "Get my borrow history (Member/Staff/Admin)", description = "Retrieve current and past borrow records for the logged-in user")
    public ResponseEntity<PageResponse<BorrowRecordResponse>> getMyHistory(
            @AuthenticationPrincipal UserPrincipal memberPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("borrowedAt").descending());
        return ResponseEntity.ok(borrowService.getMemberBorrowHistory(memberPrincipal.getId(), pageable));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "List overdue loans (Staff/Admin)", description = "Retrieve all loans currently exceeding their return due date")
    public ResponseEntity<PageResponse<BorrowRecordResponse>> getOverdueRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("dueDate").ascending());
        return ResponseEntity.ok(borrowService.getOverdueRecords(pageable));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "List all borrow records (Staff/Admin)", description = "Retrieve all borrow records with pagination")
    public ResponseEntity<PageResponse<BorrowRecordResponse>> getAllBorrowRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("borrowedAt").descending());
        return ResponseEntity.ok(borrowService.getAllBorrowRecords(pageable));
    }
}
