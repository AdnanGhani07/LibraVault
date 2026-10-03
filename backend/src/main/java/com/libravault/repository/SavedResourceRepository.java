package com.libravault.repository;

import com.libravault.model.entity.SavedResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedResourceRepository extends JpaRepository<SavedResource, Long> {

    List<SavedResource> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndExternalId(Long userId, String externalId);

    Optional<SavedResource> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
