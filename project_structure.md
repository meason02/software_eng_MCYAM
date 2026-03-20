# Food Waste Management – Community Sharing App

A Dockerised web application built with **Node.js**, **Express**, **PUG**, and **MySQL** for managing surplus food listings within the local community.

## Current Sprint 3 Progress

The following Sprint 3 setup is currently working:

- Docker environment setup
- MySQL database connected to the app
- phpMyAdmin running
- Database schema imported
- Seed data imported
- Users page working with live database data

## Tech Stack

- Node.js
- Express.js
- PUG
- MySQL
- phpMyAdmin
- Docker / Docker Compose

## Project Structure

```text
software_eng_MCYAM/
  db/
    schema.sql
    seed.sql
  docs/
    team/
  src/
    app.js
    config/
      db.js
    controllers/
    routes/
      users.js
    views/
      layout.pug
      partials/
        navbar.pug
        footer.pug
      users/
        index.pug
      listings/
      categories/
    public/
      css/
        style.css
      js/
      images/
  .env
  .env.example
  .gitignore
  docker-compose.yml
  Dockerfile
  package.json
  package-lock.json
  README.md
