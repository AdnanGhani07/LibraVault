package com.libravault.controller;

import com.libravault.dto.vault.SaveResourceRequest;
import com.libravault.dto.vault.SavedResourceResponse;
import com.libravault.security.UserPrincipal;
import com.libravault.service.vault.MemberVaultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vault")
@Tag(name = "Member Vault", description = "Endpoints for managing saved research papers and global books in a member's personal vault")
@SecurityRequirement(name = "BearerAuth")
public class VaultController {

    private final MemberVaultService memberVaultService;

    public VaultController(MemberVaultService memberVaultService) {
        this.memberVaultService = memberVaultService;
    }

    @PostMapping("/save")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Bookmark an academic research paper or external book into personal vault")
    public ResponseEntity<SavedResourceResponse> saveResource(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SaveResourceRequest request
    ) {
        SavedResourceResponse response = memberVaultService.saveResource(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-resources")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Retrieve all papers and books saved in authenticated member's personal vault")
    public ResponseEntity<List<SavedResourceResponse>> getMySavedResources(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<SavedResourceResponse> list = memberVaultService.getMySavedResources(principal);
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remove a saved resource from personal vault")
    public ResponseEntity<Void> removeSavedResource(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        memberVaultService.removeSavedResource(principal, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{externalId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if an external item (arXiv ID or Open Library Key) is already bookmarked")
    public ResponseEntity<Map<String, Boolean>> checkSaved(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String externalId
    ) {
        boolean isSaved = memberVaultService.isResourceSaved(principal, externalId);
        return ResponseEntity.ok(Map.of("saved", isSaved));
    }
}
