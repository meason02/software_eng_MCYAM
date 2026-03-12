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
	•	Calvin: Created initial Dockerfile for Node.js
	•	Meason: Tested Docker setup locally
	•	Alvan: Added Docker instructions to README
	•	Yusuf: Configured docker-compose with MySQL
	•	Marcica: Confirmed containers run successfully
Discussion Points:
	•	Confirmed Docker runs on all group members’ machines
	•	Discussed environment variable handling
	•	Identified minor setup issues and fixes	
Actions:
	•	Fix remaining Docker issues – Yusuf
	•	Finalise README Docker section – Alvan
	•	Verify all members can run containers – Meason
	•	Prepare Sprint 1 PDF submission – Calvin

#####Fully designed and implemented both the sequence diagram “Claim Listing Process” and the activity diagram “Claim a Food Listing.” Following the Sprint 2 demo, I incorporated the lecturer’s feedback and refined the activity diagram to better align with the project’s workflow, domain model, and system logic.
## Sequence Diagram – Claim Listing Process
- Designed and updated the sequence diagram for the food listing claim workflow.
- Added authentication validation using session/token verification.
- Implemented atomic database operation `claimListingIfAvailable(userId, listingId)` to prevent concurrent claims.
- Added result handling branches for "EXPIRED", "UNAVAILABLE", and "SUCCESS".
- Integrated NotificationService interaction to notify the sharer after a successful claim.

## Activity Diagram – Claim A Food Listing
- Updated the activity workflow to align with the system domain model.
- Added step to create a Claim record with ClaimStatus = "PENDING".
- Updated listing status to ListingStatus = "PENDING_CONFIRMATION".
- Added notification step to inform the sharer via NotificationService.
- Ensured consistency with the class diagram enums and system logic.
