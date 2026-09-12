package com.libravault.repository;

import com.libravault.model.entity.BorrowRecord;
import com.libravault.model.enums.BorrowStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByUserIdAndStatus(Long userId, BorrowStatus status);

    Page<BorrowRecord> findByUserIdOrderByBorrowedAtDesc(Long userId, Pageable pageable);

    long countByUserIdAndStatus(Long userId, BorrowStatus status);

    @Query("SELECT b FROM BorrowRecord b WHERE b.status = 'ACTIVE' AND b.dueDate < :now")
    Page<BorrowRecord> findOverdueRecords(@Param("now") Instant now, Pageable pageable);
}
