-- ==============================================================================
-- Flyway Migration V2: Seed Starter Data for LibraVault
-- Description: Seeds initial RBAC users and a rich starter catalog.
-- Default password for seeded users is 'Password@123'
-- ==============================================================================

-- 1. Seed RBAC Users (Default password: 'Password@123')
INSERT INTO users (email, password_hash, role, full_name, created_at, updated_at)
VALUES 
  ('admin@libravault.com', '$2a$10$avGHZilorV9sTCzSu5NcY.k9Q3/qplu1orYkkP0CQ73uAjD9nQHsK', 'ROLE_ADMIN', 'System Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('staff@libravault.com', '$2a$10$avGHZilorV9sTCzSu5NcY.k9Q3/qplu1orYkkP0CQ73uAjD9nQHsK', 'ROLE_STAFF', 'Library Staff Member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('member@libravault.com', '$2a$10$avGHZilorV9sTCzSu5NcY.k9Q3/qplu1orYkkP0CQ73uAjD9nQHsK', 'ROLE_MEMBER', 'Alice Johnson', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Seed Books Catalog
INSERT INTO items (title, isbn, author, category, total_copies, available_copies, created_at, updated_at)
VALUES
  ('Clean Code: A Handbook of Agile Software Craftsmanship', '978-0132350884', 'Robert C. Martin', 'Computer Science', 5, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Designing Data-Intensive Applications', '978-1449373320', 'Martin Kleppmann', 'Computer Science', 3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Effective Java (3rd Edition)', '978-0134685991', 'Joshua Bloch', 'Computer Science', 4, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Introduction to Algorithms (4th Edition)', '978-0262046305', 'Thomas H. Cormen', 'Computer Science', 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('The Pragmatic Programmer', '978-0135957059', 'David Thomas, Andrew Hunt', 'Computer Science', 3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Zero to One: Notes on Startups', '978-0804139298', 'Peter Thiel', 'Business', 4, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Thinking, Fast and Slow', '978-0374533557', 'Daniel Kahneman', 'Psychology', 5, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('A Brief History of Time', '978-0553380163', 'Stephen Hawking', 'Science', 3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
