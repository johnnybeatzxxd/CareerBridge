# Backend Requirements Coverage

This file maps the assignment requirements to the Java Servlet backend endpoints.

## Job Seeker

- Login/register/logout: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- Manage account CRUD: `POST /api/auth/register`, `GET /api/account`, `PUT /api/account`, `DELETE /api/account`
- View dashboard: `GET /api/dashboard`
- Submit application: `POST /api/applications`
- View company email on job post: `GET /api/jobs`, `GET /api/jobs/{id}`
- Upload CV: `POST /api/cv/upload`
- Build CV CRUD: `GET /api/cv`, `PUT /api/cv`, `DELETE /api/cv`
- Download CV: `GET /api/cv/download`
- View jobs: `GET /api/jobs`
- Search jobs: `GET /api/jobs?q=...`
- Filter job search: `GET /api/jobs?location=...&jobType=...`
- View landing page data: `GET /api/public/landing`
- Get job alert: `GET /api/job-alerts`, `POST /api/job-alerts`, `PUT /api/job-alerts/{id}`, `DELETE /api/job-alerts/{id}`
- View applied jobs: `GET /api/applications`

## Employer

- Login/register/logout: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- Manage account CRUD: `POST /api/auth/register`, `GET /api/account`, `PUT /api/account`, `DELETE /api/account`
- Post a job: `POST /api/jobs`
- Manage job: `GET /api/jobs?scope=EMPLOYER`, `PUT /api/jobs/{id}`, `DELETE /api/jobs/{id}`
- View dashboard: `GET /api/dashboard`
- View applications: `GET /api/applications`
- Update application status: `PATCH /api/applications/{id}`

## Admin

- Manage system: `GET /api/admin/stats`
- Prepare CV template: `GET /api/admin/cv-templates`, `POST /api/admin/cv-templates`
- Manage users CRUD: `GET /api/admin/users`, `POST /api/admin/users`, `PUT /api/admin/users/{id}`, `DELETE /api/admin/users/{id}`
- Approve employer: `PATCH /api/admin/users/{id}/approve`
