# Food Waste Management – Community Sharing App
A community‑focused web application designed to reduce food waste by enabling people to share surplus food quickly, safely, and conveniently. The platform supports individuals, families, students, and small businesses who may either have extra food to give away or need access to affordable options.


## Project description
Across many households and small food businesses, surplus food is often thrown away despite still being fresh and edible. At the same time, others in the community — such as students, people on tight budgets, and families — may struggle to access affordable meals.
This application provides a simple, approachable solution by allowing users to:

List surplus food with clear details
Browse available items nearby
Arrange quick, safe collection
Mark when food has been picked up

The design focuses on being fast to use, easy to understand, and helpful for people with different levels of technical confidence. Whether someone is giving away a single home‑cooked meal, a café is offering leftover pastries at the end of the day, or a family is sharing extra groceries — the platform supports it in a clean and accessible way.

## MVP (Sprint direction)
- Create a food listing (what it is, quantity, pickup window)
- Browse listings
- Mark listing as collected

## Tech stack
- Node.js + Express
- MySQL
- PUG (templates)
- Docker / Docker Compose

## Run with Docker
1. Clone the repo
2. Run:
   docker compose up --build
3. Open:
   http://localhost:3000

## Team
- Meason Silveira
- Calvin Dsouza
- Alvan Chukwuani
- Mohammad Yusuf Kapadia
- Marcica Cercel

## Links
- GitHub repo: <YOUR REPO LINK>
- Task board: <YOUR PROJECT LINK>
Commit:
•	Customise README for food waste project
______________
5) Every member can run the dev environment using Docker (prove it) 
we all need to do this
This is the most misunderstood requirement: it’s about proof.
Step-by-step
1.	From repo root:
2.	docker compose down
3.	docker compose up --build
4.	Open browser:
o	http://localhost:3000
5.	Take screenshots:
o	Docker Desktop showing container running
o	Browser showing the “Docker is running ✅” page
Evidence file (optional but strong)
Create DOCKER.md:
## Docker quickstart
docker compose up --build
Open http://localhost:3000
Each teammate should run it and ideally add their initials to a line in DOCKER.md like:
•	“Tested by: Meason, Calvin, Alvan, Yusuf, Marcica”
That’s a simple “audit trail” for the assessor.
______________
