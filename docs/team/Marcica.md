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

## Sequence Diagram – Claim Listing Process
- Designed and updated the sequence diagram representing the food listing claim workflow.
- Implemented authentication validation using session/token verification before allowing the claim process.
- Added an atomic database operation claimListingIfAvailable(userId, listingId) to prevent concurrent claims and ensure data integrity.
- Introduced conditional result branches for “EXPIRED,” “UNAVAILABLE,” and “SUCCESS” outcomes to handle different system responses.
- Integrated the NotificationService interaction to notify the sharer after a successful claim.

## Activity Diagram – Claim A Food Listing
- Updated the activity workflow to better align with the system domain model and application behaviour.
- Added a step to create a Claim record with ClaimStatus = PENDING, reflecting the Claim entity defined in the class diagram.
- Updated the listing state to ListingStatus = PENDING_CONFIRMATION to match the enumeration defined in the domain model.
- Added a notification step using NotificationService to inform the sharer when a new claim is submitted.
- Ensured consistency with the class diagram enums, system validation logic, and sequence diagram interaction flow.


###### Implemented the Sprint 3 claim workflow for surplus food listings, covering both claim creation and the full claim status lifecycle. This included creating the backend logic, updating the listing detail page, validating business rules, synchronizing database updates, and testing the complete process with the shared team environment. 

## Sprint 3 Implementation – Claim Flow and Claim Status Actions 
- Implemented the full **claim submission workflow** on the listing detail page by adding the **“Submit Claim Request”** action for available food listings. 
- Created backend claim handling logic to validate that the current user is logged in, prevent users from claiming their own listing, block claims on unavailable listings, and prevent duplicate live claims. 
- Inserted new claim records into the `CLAIM` table with status set to **`PENDING`** and updated the related `FOOD_LISTING` record to **`CLAIM_PENDING`** after a successful claim request. 
- Implemented the **confirm**, **reject**, and **complete** claim actions for listing owners, including database updates for both claim and listing statuses. 
- Enforced valid claim state transitions only, ensuring that claims move correctly from **`PENDING` → `CONFIRMED`**, **`PENDING` → `REJECTED`**, and **`CONFIRMED` → `COMPLETED`**. 
- Updated the listing detail page interface so that it dynamically shows the correct controls and information depending on the current claim state, including: 
  - claim submission for receivers, 
  - claimant details for listing owners, 
  - confirm/reject buttons for pending claims, 
  - and complete action for confirmed claims. 
- Added success and error feedback messages on the listing detail page, including states such as **claim submitted successfully**, **claim rejected successfully**, **claim confirmed successfully**, and **claim completed successfully**. 
- Verified the implementation using the working web pages and database state, confirming that claim creation, rejection, confirmation, and completion all worked correctly in practice. 
- Used Docker commands such as `docker compose restart web` to reload the application during development and testing. 
- Synced my work with the shared GitHub repository using `git status`, `git add`, `git commit -m "Add claim flow and claim action handling"`, and `git push origin main`. 
- Worked in the shared team environment using **Tailscale**, which allowed us to connect to the same project setup and keep our systems aligned while integrating Sprint 3 functionality.
