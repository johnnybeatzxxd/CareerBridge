# Job Listing Site

Full-stack job listing site for the final project assignment.

## Tech Stack

- Backend: Java Servlets, JDBC, JWT authentication
- Database: H2 file database, no external database server required
- Frontend: React, Vite, Tailwind CSS
- Structure: Monorepo

## Project Structure

```text
backend/     Java Servlet API
frontend/    React application
database/    SQL schema and seed data
docs/        Assignment notes
```

## Requirements Covered

- Job seeker registration, login, account management, dashboard, job search, applications, CV upload/build/download
- Employer registration, login, account management, dashboard, job posting, job management, application review
- Admin dashboard, user management, employer approval, CV template preparation
- Candidate hiring, simulated employer payments, seeker wallet balances, and withdrawals
- Employer candidate profiles with built resume viewing and uploaded resume downloads
- Gmail SMTP email verification with expiring signup OTP codes
- Automatic local configuration from the ignored `backend/.env` file

## Local Development

Detailed setup steps are added as the backend and frontend features are implemented.
