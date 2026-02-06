# Food Waste Management – Community Sharing App

A web app to reduce food waste by helping people share surplus food locally in a safe, respectful way.

## Project description
Food waste happens in homes and small businesses when plans change or food is overbought. At the same time, people in the same community may struggle with food costs. This project focuses on a community-based way to list surplus food and arrange collection.

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
