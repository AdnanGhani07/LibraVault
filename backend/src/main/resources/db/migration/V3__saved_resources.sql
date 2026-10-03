-- ==============================================================================
-- Flyway Migration V3: Saved Resources for Digital Research & Literature Vault
-- Description: Creates saved_resources table for bookmarking papers & books.
-- ==============================================================================

CREATE TABLE saved_resources (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL,
    external_id VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    authors VARCHAR(500),
    cover_or_pdf_url VARCHAR(1000),
    category_or_year VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_resource_type CHECK (resource_type IN ('RESEARCH_PAPER', 'EXTERNAL_BOOK')),
    CONSTRAINT uq_user_resource UNIQUE (user_id, external_id)
);

CREATE INDEX idx_saved_resources_user_id ON saved_resources(user_id);
CREATE INDEX idx_saved_resources_created_at ON saved_resources(created_at);
