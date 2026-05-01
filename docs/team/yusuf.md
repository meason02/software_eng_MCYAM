## Yusuf – Sprint 3 Progress Report

## Date
21 March 2026

## Summary
Today I worked on the authentication part of the web application and tested that it works correctly within our Docker development environment. My main contribution was adding user registration, login, logout, and session handling so that protected pages can only be accessed by logged-in users.

## What I did today

### 1. Checked the existing application routes and pages
I first tested the existing application endpoints to confirm that the core pages were running correctly before making changes. I verified that the following routes returned a successful response:

- `/users`
- `/categories`
- `/listings`
- `/listings/1`

This confirmed that the existing users, categories, listings, and detail functionality was working before I added authentication.

### 2. Reviewed the project structure
I checked the project folders and files to understand how the app was organised. I reviewed:

- `src/routes`
- `src/controllers`
- `src/views`
- `src/app.js`

This helped me identify how the current Express routes, controllers, and Pug views were connected so I could integrate authentication in the same structure.

### 3. Reviewed the database schema and seed data
I checked the database files to confirm the structure of the `USER` table and existing seeded users. I confirmed that the table already included the fields needed for authentication:

- `username`
- `email`
- `password_hash`
- `role`
- `created_at`

I also reviewed `seed.sql` to see the existing inserted users and their roles.

### 4. Installed authentication dependencies
I installed the required packages for authentication:

- `express-session`
- `bcryptjs`

These were needed to support session-based login and secure password hashing.

### 5. Backed up the main app file
Before editing the server setup, I created a backup of `src/app.js` as:

- `src/app.js.auth.bak`

This was done as a safety step in case I needed to restore the original version.

### 6. Created authentication files
I created the new authentication MVC files and view templates:

- `src/controllers/authController.js`
- `src/routes/auth.js`
- `src/views/auth/login.pug`
- `src/views/auth/register.pug`

This set up a separate authentication feature following the same structure as the rest of the project.

### 7. Implemented the authentication controller
In `authController.js` I added the following functionality:

- `showRegister` to render the register page
- `register` to create a new user account
- `showLogin` to render the login page
- `login` to authenticate a user
- `logout` to destroy the session and sign the user out

The registration logic:
- validates required fields
- checks for duplicate username or email
- hashes passwords using `bcrypt`
- inserts the new user into the `USER` table

The login logic:
- checks the email and password
- compares the password with the stored hash
- stores the logged-in user in the session

### 8. Implemented authentication routes
In `src/routes/auth.js` I added routes for:

- `GET /register`
- `POST /register`
- `GET /login`
- `POST /login`
- `GET /logout`

This connected the controller methods to accessible routes in the app.

### 9. Built the login and register pages in Pug
I created the user interface for authentication using Pug templates:

#### `register.pug`
Includes:
- username input
- email input
- password input
- role selection
- create account button
- link to login page

#### `login.pug`
Includes:
- email input
- password input
- login button
- link to register page

This allowed users to interact with the authentication feature through the browser.

### 10. Updated the Express app configuration
I edited `src/app.js` to integrate authentication into the application.

I added:
- `express-session` middleware
- `authRoutes`
- session user storage through `res.locals.currentUser`
- a `requireLogin` middleware function
- route protection for:
  - `/users`
  - `/listings`
  - `/categories`

I also changed the root route `/` to redirect users to `/login` instead of `/users`.

This means users now have to log in before accessing the main application pages.

### 11. Syntax checked the updated files
To make sure there were no JavaScript syntax errors, I ran checks on:

- `src/controllers/authController.js`
- `src/routes/auth.js`
- `src/app.js`

All syntax checks passed successfully.

### 12. Restarted Docker container and tested routes
After making the changes, I restarted the web container using Docker and tested the new authentication routes.

I confirmed that:
- `/login` returned status `200`
- `/register` returned status `200`

This showed that the new pages were loading correctly inside the containerised environment.

### 13. Tested registration
I tested user registration by submitting a new user through the application.

Test account created:
- username: generated test username
- email: generated test email
- role: `user`

The registration request redirected successfully to `/login`, showing that account creation worked correctly.

### 14. Tested login and logout
I tested the full authentication flow using a session in PowerShell.

I confirmed that:
- a valid login redirected to `/users`
- logout redirected back to `/login`

This verified that session creation and destruction were working correctly.

### 15. Added route protection and re-tested access control
After implementing `requireLogin`, I tested protected route behaviour.

I confirmed that:
- accessing `/users` without being logged in redirected to `/login`
- accessing `/users` after logging in worked correctly
- logging out removed access again

This proved that the route protection was working as intended.

### 16. Checked Git status and committed my work
I reviewed the changed files using `git status`, then staged the relevant project files and created a commit:

`feat: add authentication routes and session handling`

This documents my contribution to Sprint 3 in version control.

### 17. Synced changes with the remote repository
When pushing, I found that the remote repository had new changes. I resolved this by running:

- `git pull --rebase origin main`

After rebasing successfully, I pushed my changes to GitHub and confirmed the branch was up to date.

### 18. Verified database changes
Finally, I checked the MySQL database inside the Docker container and confirmed that the new registered user had been inserted into the `USER` table.

This verified that the registration feature correctly stores users in the database.

## Files I worked on

### Modified
- `package.json`
- `package-lock.json`
- `src/app.js`

### Created
- `src/controllers/authController.js`
- `src/routes/auth.js`
- `src/views/auth/login.pug`
- `src/views/auth/register.pug`

## Key outcomes
By the end of today’s work, I successfully:

- added registration, login, and logout functionality
- implemented password hashing using `bcryptjs`
- added session handling with `express-session`
- protected the main routes so users must log in first
- created login and register pages with Pug
- tested the feature in Docker
- verified user data was inserted into MySQL
- committed and pushed my contribution to the shared GitHub repository

## Reflection
This work contributes to Sprint 3 by extending the application with an important user feature and showing practical development using Express, MySQL, Pug, Docker, and GitHub. It also prepares the project for Sprint 4, where user login is listed as one of the more advanced features to be included.
