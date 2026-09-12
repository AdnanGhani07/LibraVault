package com.libravault.service;

import com.libravault.audit.AuditEvent;
import com.libravault.dto.common.PageResponse;
import com.libravault.dto.item.CreateItemRequest;
import com.libravault.dto.item.ItemResponse;
import com.libravault.dto.item.UpdateItemRequest;
import com.libravault.exception.DuplicateResourceException;
import com.libravault.exception.ResourceNotFoundException;
import com.libravault.model.entity.Item;
import com.libravault.repository.ItemRepository;
import com.libravault.security.UserPrincipal;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ItemService(ItemRepository itemRepository, ApplicationEventPublisher eventPublisher) {
        this.itemRepository = itemRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ItemResponse createItem(CreateItemRequest request, UserPrincipal actor) {
        if (itemRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("An item with ISBN '" + request.getIsbn() + "' already exists");
        }

        Item item = Item.builder()
                .title(request.getTitle().trim())
                .isbn(request.getIsbn().trim())
                .author(request.getAuthor().trim())
                .category(request.getCategory().trim())
                .totalCopies(request.getTotalCopies())
                .availableCopies(request.getTotalCopies())
                .build();

        Item savedItem = itemRepository.save(item);

        eventPublisher.publishEvent(AuditEvent.builder()
                .actorId(actor != null ? actor.getId() : null)
                .actorEmail(actor != null ? actor.getUsername() : "SYSTEM")
                .action("ITEM_CREATED")
                .targetType("ITEM")
                .targetId(savedItem.getId())
                .details(String.format("Created item '%s' (ISBN: %s) with %d copies",
                        savedItem.getTitle(), savedItem.getIsbn(), savedItem.getTotalCopies()))
                .timestamp(Instant.now())
                .build());

        return ItemResponse.from(savedItem);
    }

    @Transactional
    public ItemResponse updateItem(Long id, UpdateItemRequest request, UserPrincipal actor) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        int borrowedCopies = item.getTotalCopies() - item.getAvailableCopies();
        if (request.getTotalCopies() < borrowedCopies) {
            throw new IllegalArgumentException(String.format(
                    "Total copies (%d) cannot be less than currently borrowed copies (%d)",
                    request.getTotalCopies(), borrowedCopies));
        }

        item.setTitle(request.getTitle().trim());
        item.setAuthor(request.getAuthor().trim());
        item.setCategory(request.getCategory().trim());
        item.setTotalCopies(request.getTotalCopies());
        item.setAvailableCopies(request.getTotalCopies() - borrowedCopies);

        Item updatedItem = itemRepository.save(item);

        eventPublisher.publishEvent(AuditEvent.builder()
                .actorId(actor != null ? actor.getId() : null)
                .actorEmail(actor != null ? actor.getUsername() : "SYSTEM")
                .action("ITEM_UPDATED")
                .targetType("ITEM")
                .targetId(updatedItem.getId())
                .details(String.format("Updated item '%s' (Total: %d, Available: %d)",
                        updatedItem.getTitle(), updatedItem.getTotalCopies(), updatedItem.getAvailableCopies()))
                .timestamp(Instant.now())
                .build());

        return ItemResponse.from(updatedItem);
    }

    @Transactional
    public void deleteItem(Long id, UserPrincipal actor) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        int borrowedCopies = item.getTotalCopies() - item.getAvailableCopies();
        if (borrowedCopies > 0) {
            throw new IllegalStateException("Cannot delete item '" + item.getTitle() + "' while " + borrowedCopies + " copies are actively borrowed");
        }

        itemRepository.delete(item);

        eventPublisher.publishEvent(AuditEvent.builder()
                .actorId(actor != null ? actor.getId() : null)
                .actorEmail(actor != null ? actor.getUsername() : "SYSTEM")
                .action("ITEM_DELETED")
                .targetType("ITEM")
                .targetId(id)
                .details("Deleted item '" + item.getTitle() + "' (ISBN: " + item.getIsbn() + ")")
                .timestamp(Instant.now())
                .build());
    }

    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return ItemResponse.from(item);
    }

    @Transactional(readOnly = true)
    public PageResponse<ItemResponse> getAllItems(String keyword, String category, Pageable pageable) {
        Page<Item> page;

        if (category != null && !category.trim().isEmpty()) {
            page = itemRepository.findByCategoryIgnoreCase(category.trim(), pageable);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            String trimmedKeyword = keyword.trim();
            page = itemRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
                    trimmedKeyword, trimmedKeyword, pageable);
        } else {
            page = itemRepository.findAll(pageable);
        }

        return PageResponse.from(page.map(ItemResponse::from));
    }
}
