package com.libravault.service.vault;

import com.libravault.dto.vault.SaveResourceRequest;
import com.libravault.dto.vault.SavedResourceResponse;
import com.libravault.exception.DuplicateResourceException;
import com.libravault.exception.ResourceNotFoundException;
import com.libravault.model.entity.SavedResource;
import com.libravault.model.entity.User;
import com.libravault.repository.SavedResourceRepository;
import com.libravault.repository.UserRepository;
import com.libravault.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MemberVaultService {

    private final SavedResourceRepository savedResourceRepository;
    private final UserRepository userRepository;

    public MemberVaultService(SavedResourceRepository savedResourceRepository, UserRepository userRepository) {
        this.savedResourceRepository = savedResourceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SavedResourceResponse saveResource(UserPrincipal principal, SaveResourceRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

        if (savedResourceRepository.existsByUserIdAndExternalId(user.getId(), request.getExternalId())) {
            throw new DuplicateResourceException("This item is already saved in your personal vault");
        }

        SavedResource resource = SavedResource.builder()
                .user(user)
                .resourceType(request.getResourceType())
                .externalId(request.getExternalId().trim())
                .title(request.getTitle().trim())
                .authors(request.getAuthors() != null ? request.getAuthors().trim() : null)
                .coverOrPdfUrl(request.getCoverOrPdfUrl() != null ? request.getCoverOrPdfUrl().trim() : null)
                .categoryOrYear(request.getCategoryOrYear() != null ? request.getCategoryOrYear().trim() : null)
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .build();

        SavedResource saved = savedResourceRepository.save(resource);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SavedResourceResponse> getMySavedResources(UserPrincipal principal) {
        return savedResourceRepository.findAllByUserIdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void removeSavedResource(UserPrincipal principal, Long resourceId) {
        SavedResource resource = savedResourceRepository.findByIdAndUserId(resourceId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Saved resource not found with id: " + resourceId));
        savedResourceRepository.delete(resource);
    }

    @Transactional(readOnly = true)
    public boolean isResourceSaved(UserPrincipal principal, String externalId) {
        if (principal == null || externalId == null || externalId.isBlank()) {
            return false;
        }
        return savedResourceRepository.existsByUserIdAndExternalId(principal.getId(), externalId.trim());
    }

    private SavedResourceResponse mapToResponse(SavedResource entity) {
        return SavedResourceResponse.builder()
                .id(entity.getId())
                .resourceType(entity.getResourceType())
                .externalId(entity.getExternalId())
                .title(entity.getTitle())
                .authors(entity.getAuthors())
                .coverOrPdfUrl(entity.getCoverOrPdfUrl())
                .categoryOrYear(entity.getCategoryOrYear())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
