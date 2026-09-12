package com.libravault.repository;

import com.libravault.model.entity.Item;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    Optional<Item> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    Page<Item> findByCategoryIgnoreCase(String category, Pageable pageable);

    Page<Item> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
            String titleKeyword, String authorKeyword, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Item i WHERE i.id = :id")
    Optional<Item> findByIdWithPessimisticLock(@Param("id") Long id);
}
