Marcica Cercel A00037209

## Meeting Record 3

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


- Fully designed and implemented both the sequence diagram “Claim Listing Process” and the activity diagram “Claim a Food Listing.” Following the Sprint 2 demo, I incorporated the lecturer’s feedback and refined the activity diagram to better align with the project’s workflow, domain model, and system logic.

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
