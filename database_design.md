## Database Design

Tables:
USER
FOOD_LISTING
CATEGORY
TAGS
LISTING_TAG
CLAIM
REPORT
RATING

USER Table:
user_id INT (PK)
username VARCHAR
email VARCHAR
password_hash VARCHAR
role VARCHAR
created_at DATETIME

FOOD_LISTING Table:
listing_id INT (PK)
user_id INT (FK → USER.user_id)
category_id INT (FK → CATEGORY.category_id)
title VARCHAR
description VARCHAR
quantity INT
expiry_date DATE
collection_start DATETIME
collection_end DATETIME
pickup_location VARCHAR
status VARCHAR
create_at DATETIME

CATEGORY Table:
category_id INT (PK)
name VARCHAR

TAGS Table:
tag_id INT (PK)
tag_name VARCHAR

LISTING_TAG Table:
listing_id INT (PK, FK → FOOD_LISTING.listing_id)
tag_id INT (PK, FK → TAGS.tag_id)

CLAIM Table:
claims_id INT (PK)
listing_id INT (FK → FOOD_LISTING.listing_id)
user_id INT (FK → USER.user_id)
called_at DATETIME
status VARCHAR

REPORT Table:
report_id INT (PK)
user_id INT (FK → USER.user_id)
listing_id INT (FK → FOOD_LISTING.listing_id)
reason VARCHAR
created_at DATETIME
status VARCHAR

RATING Table:
rating_id INT (PK)
claim_id INT (FK → CLAIM.claims_id)
score INT
feedback VARCHAR
created_at DATETIME
