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
- Implemented claim submission on the listing detail page using the **“Submit Claim Request”** action. 
- Added validation to ensure users are logged in, cannot claim their own listing, and can only claim available listings without existing active claims. 
- Created claim records with **ClaimStatus = PENDING** and updated listings to **CLAIM_PENDING**. 
- Implemented claim actions for owners: **Confirm**, **Reject**, and **Complete**. 
- Enforced valid transitions: **PENDING → CONFIRMED**, **PENDING → REJECTED**, **CONFIRMED → COMPLETED**. 
- Updated both `CLAIM` and `FOOD_LISTING` statuses accordingly. 
- Added dynamic UI logic to display actions based on user role and claim state. 
- Implemented feedback messages for success and error cases. 
- Tested the full workflow to ensure correct behavior across all states. 
- Used `docker compose restart web` to apply and test changes. 
- Synced work using Git: `git status`, `git add`, `git commit`, `git push`. 
- Collaborated using **Tailscale** for a shared development environment.completed successfully**. 
- Verified the implementation using the working web pages and database state, confirming that claim creation, rejection, confirmation, and completion all worked correctly in practice. 
- Used Docker commands such as `docker compose restart web` to reload the application during development and testing. 
- Synced my work with the shared GitHub repository using `git status`, `git add`, `git commit -m "Add claim flow and claim action handling"`, and `git push origin main`. 
- Worked in the shared team environment using **Tailscale**, which allowed us to connect to the same project setup and keep our systems aligned while integrating Sprint 3 functionality.
