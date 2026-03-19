
-- Drop tables if they already exist (to avoid errors when re-running)
DROP TABLE IF EXISTS RATING;
DROP TABLE IF EXISTS REPORT;
DROP TABLE IF EXISTS CLAIM;
DROP TABLE IF EXISTS LISTING_TAG;
DROP TABLE IF EXISTS TAGS;
DROP TABLE IF EXISTS FOOD_LISTING;
DROP TABLE IF EXISTS CATEGORY;
DROP TABLE IF EXISTS USER;

CREATE TABLE `USER` (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(100),
    created_at DATETIME
);

-- CATEGORY TABLE
CREATE TABLE CATEGORY (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

-- FOOD_LISTING TABLE
CREATE TABLE FOOD_LISTING (
    listing_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_id INT,
    title VARCHAR(255),
    description VARCHAR(255),
    quantity INT,
    expiry_date DATE,
    collection_start DATETIME,
    collection_end DATETIME,
    pickup_location VARCHAR(255),
    status VARCHAR(100),
    create_at DATETIME,

    FOREIGN KEY (user_id) REFERENCES USER(user_id),
    FOREIGN KEY (category_id) REFERENCES CATEGORY(category_id)
);

-- TAGS TABLE
CREATE TABLE TAGS (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(255)
);

-- LISTING_TAG TABLE (Junction Table)
CREATE TABLE LISTING_TAG (
    listing_id INT,
    tag_id INT,
    PRIMARY KEY (listing_id, tag_id),

    FOREIGN KEY (listing_id) REFERENCES FOOD_LISTING(listing_id),
    FOREIGN KEY (tag_id) REFERENCES TAGS(tag_id)
);

-- CLAIM TABLE
CREATE TABLE CLAIM (
    claims_id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT,
    user_id INT,
    called_at DATETIME,
    status VARCHAR(100),

    FOREIGN KEY (listing_id) REFERENCES FOOD_LISTING(listing_id),
    FOREIGN KEY (user_id) REFERENCES USER(user_id)
);

-- REPORT TABLE
CREATE TABLE REPORT (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    listing_id INT,
    reason VARCHAR(255),
    created_at DATETIME,
    status VARCHAR(100),

    FOREIGN KEY (user_id) REFERENCES USER(user_id),
    FOREIGN KEY (listing_id) REFERENCES FOOD_LISTING(listing_id)
);

CREATE TABLE RATING (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    claim_id INT,
    score INT,
    feedback VARCHAR(255),
    created_at DATETIME,
    FOREIGN KEY (claim_id) REFERENCES CLAIM(claims_id)
);