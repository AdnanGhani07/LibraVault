package com.libravault.dto.borrow;

import com.libravault.model.entity.BorrowRecord;
import com.libravault.model.enums.BorrowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowRecordResponse {

    private Long id;
    private Long itemId;
    private String itemTitle;
    private String itemIsbn;
    private Long userId;
    private String userEmail;
    private String userName;
    private Instant borrowedAt;
    private Instant dueDate;
    private Instant returnedAt;
    private BorrowStatus status;
    private BigDecimal fineAmount;

    public static BorrowRecordResponse from(BorrowRecord record) {
        return BorrowRecordResponse.builder()
                .id(record.getId())
                .itemId(record.getItem() != null ? record.getItem().getId() : null)
                .itemTitle(record.getItem() != null ? record.getItem().getTitle() : null)
                .itemIsbn(record.getItem() != null ? record.getItem().getIsbn() : null)
                .userId(record.getUser() != null ? record.getUser().getId() : null)
                .userEmail(record.getUser() != null ? record.getUser().getEmail() : null)
                .userName(record.getUser() != null ? record.getUser().getFullName() : null)
                .borrowedAt(record.getBorrowedAt())
                .dueDate(record.getDueDate())
                .returnedAt(record.getReturnedAt())
                .status(record.getStatus())
                .fineAmount(record.getFineAmount())
                .build();
    }
}
