Marcica Cercel A00037209

## Sprint 1 Task: Meeting Record 3

Date and Time:
3 February 2026, 11:00 – 12:00

Project Name:
Software Engineering MCMAY

Meeting Goal:
Set up and verify Docker development environment

Yusuf

Note taker:
Calvin

Attendees:
Calvin, Meason, Alvan, Yusuf, Marcica

Roundtable Updates:
-	Calvin: Created initial Dockerfile for Node.js
-	Meason: Tested Docker setup locally
-	Alvan: Added Docker instructions to README
-	Yusuf: Configured docker-compose with MySQL
-	Marcica: Confirmed containers run successfully

Discussion Points:
-	Confirmed Docker runs on all group members’ machines
-	Discussed environment variable handling
-	Identified minor setup issues and fixes	

Actions:
-	Fix remaining Docker issues – Yusuf
-	Finalise README Docker section – Alvan
-	Verify all members can run containers – Meason
-	Prepare Sprint 1 PDF submission – Calvin


###### Fully designed and implemented both the sequence diagram “Claim Listing Process” and the activity diagram “Claim a Food Listing.” Following the Sprint 2 demo, I incorporated the lecturer’s feedback and refined the activity diagram to better align with the project’s workflow, domain model, and system logic.

## Sprint 2 Task 1: Sequence Diagram – Claim Listing Process
- Designed and updated the sequence diagram representing the food listing claim workflow.
- Implemented authentication validation using session/token verification before allowing the claim process.
- Added an atomic database operation claimListingIfAvailable(userId, listingId) to prevent concurrent claims and ensure data integrity.
- Introduced conditional result branches for “EXPIRED,” “UNAVAILABLE,” and “SUCCESS” outcomes to handle different system responses.
- Integrated the NotificationService interaction to notify the sharer after a successful claim.

## Sprint 2 Task 2: Activity Diagram – Claim A Food Listing
- Updated the activity workflow to better align with the system domain model and application behaviour.
- Added a step to create a Claim record with ClaimStatus = PENDING, reflecting the Claim entity defined in the class diagram.
- Updated the listing state to ListingStatus = PENDING_CONFIRMATION to match the enumeration defined in the domain model.
- Added a notification step using NotificationService to inform the sharer when a new claim is submitted.
- Ensured consistency with the class diagram enums, system validation logic, and sequence diagram interaction flow.


###### Implemented the Sprint 3 claim workflow for surplus food listings, covering both claim creation and the full claim status lifecycle. This included creating the backend logic, updating the listing detail page, validating business rules, synchronizing database updates, and testing the complete process with the shared team environment. 

## Sprint 3 Tasks Implementation: Claim Flow and Claim Status Actions 
- Added **“Submit Claim Request”** button on the listing detail page.
- Created backend route and controller to handle claim creation.
- Validated that users are logged in and cannot claim their own listing.
- Prevented claims on unavailable listings or listings with active claims.
- Inserted new claim with **status = PENDING**.
- Updated listing status to **CLAIM_PENDING** after claim submission.
- Added **“Submit Claim Request”** button on the listing detail page.
- Created backend route and controller to handle claim creation.
- Validated that users are logged in and cannot claim their own listing.
- Prevented claims on unavailable listings or listings with active claims.
- Inserted new claim with **status = PENDING**.
- Updated listing status to **CLAIM_PENDING** after claim submission.
- Implemented claim actions: **Confirm**, **Reject**, **Complete**.
- Restricted actions to the listing owner only.
- Enforced valid transitions:
  - **PENDING → CONFIRMED**
  - **PENDING → REJECTED**
  - **CONFIRMED → COMPLETED**
- Updated both `CLAIM` and `FOOD_LISTING` tables accordingly.
- Added UI buttons for owner actions (confirm/reject/complete).
- Displayed current claim details and status on the page.
- Added success/error feedback messages for each action.
- Tested the full flow: claim → confirm/reject → complete.
- Synced changes using Git (`git add`, `git commit`, `git push`).
- Restarted the app with `docker compose restart web` to verify updates.

## Sprint 4 Tasks Implementation: Claim-to-Rating Flow Connection

### Assigned Feature

My Sprint 4 task was to connect the existing claim flow to the rating system. The rating option should only become available after a claim has been fully completed. This makes sure that users can only rate a real completed collection and not a pending, rejected, or unfinished claim.

### Task Objectives

- Extend the claim flow so the rating option only appears after a claim status becomes `COMPLETED`.
- Add permission logic to decide who is allowed to rate.
- Make sure completed claims show the correct rating button/action.
- Prevent ratings on `PENDING`, `REJECTED`, or `CONFIRMED` claims.
- Make sure claim actions and rating actions do not conflict.
- Test the full flow end to end: `confirm → complete → rate`.

First, I checked the existing project structure to see whether rating files already existed. 

Files checked:
src/controllers
src/routes
src/views

- rating button does not show for PENDING claims
- rating button does not show for CONFIRMED claims
- rating button does not show for REJECTED claims
- owner cannot rate their own listing
- random users cannot rate someone else's completed claim
- same claim cannot be rated twice

Expected outcome, which has been successfully:
Claim request → Confirm claim → Complete claim → Rate completed claim

### Other Tasks
- Task Board managing
- Creating user stories and their implementations
