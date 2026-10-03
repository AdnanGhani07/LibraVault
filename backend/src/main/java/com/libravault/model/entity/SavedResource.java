package com.libravault.model.entity;

import com.libravault.model.enums.ResourceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "saved_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 50)
    private ResourceType resourceType;

    @Column(name = "external_id", nullable = false, length = 100)
    private String externalId;

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "authors", length = 500)
    private String authors;

    @Column(name = "cover_or_pdf_url", length = 1000)
    private String coverOrPdfUrl;

    @Column(name = "category_or_year", length = 100)
    private String categoryOrYear;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
