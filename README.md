# LocalTrade

## Summary

LocalTrade is a local consumer-to-consumer (C2C) marketplace where users can discover, buy, and sell second-hand items. The application provides a simple web interface for browsing categorized listings, managing user profiles, completing purchases, and rating buyers and sellers after a transaction.

## Features

- User registration, login, logout, and session management
- Browse listings by category and view individual item details
- Create, edit, and delete personal listings with image uploads
- Search and browse available items
- Checkout with saved payment details and shipping addresses
- Purchase tracking and purchase completion flow
- Buyer and seller ratings with reviews and average rating summaries
- User profile and listing management
- Administrative user and listing management

## Technology

- **Frontend:** HTML, CSS, and vanilla JavaScript
- **Backend:** PHP 8 with Apache
- **Database:** MySQL 8
- **Local environment:** Docker Compose
- **Database administration:** phpMyAdmin

## Running locally

1. Start the application and database:

   ```bash
   docker compose up --build
   ```

2. Open the application at [http://localhost](http://localhost).

3. Open phpMyAdmin at [http://localhost:8080](http://localhost:8080) when database administration is needed.

The database schema and seed categories are loaded from `database/database.sql` when the MySQL volume is initialized. The default local database configuration uses the `LocalTrade_DB` database with the root password `root`.

## Project structure

```text
api/       PHP endpoints for authentication, listings, purchases, profiles, and ratings
database/  MySQL schema and initial category data
public/    HTML pages, JavaScript, and stylesheets
Dockerfile PHP/Apache application image
docker-compose.yml Local development services
```
