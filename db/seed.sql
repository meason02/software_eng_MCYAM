-- ========================
-- USERS
-- ========================
INSERT INTO `USER` (username, email, password_hash, role, created_at) VALUES
('sarah_w', 'sarah@example.com', 'hashed_pw', 'sharer', NOW()),
('tom_p', 'tom@example.com', 'hashed_pw', 'receiver', NOW()),
('daniel_e', 'daniel@example.com', 'hashed_pw', 'user', NOW()),
('alice_k', 'alice@example.com', 'hashed_pw', 'user', NOW()),
('john_d', 'john@example.com', 'hashed_pw', 'user', NOW());

-- ========================
-- CATEGORIES
-- ========================
INSERT INTO CATEGORY (name) VALUES
('Bakery'),
('Vegetables'),
('Cooked Meals'),
('Dairy');

-- ========================
-- TAGS
-- ========================
INSERT INTO TAGS (tag_name) VALUES
('Fresh'),
('Organic'),
('Vegan'),
('Halal'),
('Gluten-Free'),
('Ready-to-eat');

-- ========================
-- FOOD LISTINGS
-- ========================
INSERT INTO FOOD_LISTING 
(user_id, category_id, title, description, quantity, expiry_date, collection_start, collection_end, pickup_location, status, create_at)
VALUES
(1, 1, 'Bread Loaves', 'Fresh bakery bread', 5, '2026-03-25', NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'London', 'AVAILABLE', NOW()),
(1, 2, 'Carrots Pack', 'Organic carrots', 10, '2026-03-26', NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'London', 'AVAILABLE', NOW()),
(2, 3, 'Rice Meal', 'Cooked rice meal', 3, '2026-03-24', NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'Campus', 'CLAIM_PENDING', NOW()),
(3, 4, 'Milk Bottles', 'Dairy milk', 6, '2026-03-23', NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'Shop', 'AVAILABLE', NOW()),
(4, 2, 'Spinach', 'Fresh spinach', 8, '2026-03-27', NOW(), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Market', 'AVAILABLE', NOW()),
(5, 1, 'Croissants', 'Butter croissants', 4, '2026-03-22', NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'Bakery', 'EXPIRED', NOW());

-- ========================
-- LISTING TAGS
-- ========================
INSERT INTO LISTING_TAG (listing_id, tag_id) VALUES
(1, 1),
(1, 6),
(2, 2),
(2, 3),
(3, 6),
(4, 1),
(5, 2),
(6, 1);

-- ========================
-- CLAIMS
-- ========================
INSERT INTO CLAIM (listing_id, user_id, called_at, status) VALUES
(3, 2, NOW(), 'PENDING'),
(1, 3, NOW(), 'CONFIRMED'),
(2, 4, NOW(), 'REJECTED');

-- ========================
-- REPORTS
-- ========================
INSERT INTO REPORT (user_id, listing_id, reason, created_at, status) VALUES
(3, 6, 'Expired food listed', NOW(), 'OPEN'),
(2, 3, 'Incorrect description', NOW(), 'REVIEWED');

-- ========================
-- RATINGS
-- ========================
INSERT INTO RATING (claim_id, score, feedback, created_at) VALUES
(1, 5, 'Great experience', NOW()),
(2, 4, 'Good quality food', NOW());
