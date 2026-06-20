# Backend Requirements Coverage

This file maps the assignment requirements to the Java Servlet backend endpoints.

## Job Seeker

- Login/register/logout: `POST /api/auth/register`, `POST /api/auth/verify-email`, `POST /api/auth/login`, `POST /api/auth/logout`
- Resend signup verification code: `POST /api/auth/resend-otp`
- Manage account CRUD: `POST /api/auth/register`, `GET /api/account`, `PUT /api/account`, `DELETE /api/account`
- View dashboard: `GET /api/dashboard`
- Submit application: `POST /api/applications`
- View company email on job post: `GET /api/jobs`, `GET /api/jobs/{id}`
- Upload CV: `POST /api/cv/upload`
- Build CV CRUD: `GET /api/cv`, `PUT /api/cv`, `DELETE /api/cv`
- Download CV: `GET /api/cv/download`
- View jobs: `GET /api/jobs`
- Search jobs by title, description, or skill: `GET /api/jobs?q=...`
- Filter job search: `GET /api/jobs?location=...&jobType=...&skill=...`
- View landing page data: `GET /api/public/landing`
- Get job alert: `GET /api/job-alerts`, `POST /api/job-alerts`, `PUT /api/job-alerts/{id}`, `DELETE /api/job-alerts/{id}`
- View applied jobs: `GET /api/applications`
- View wallet balance and transactions: `GET /api/wallet`
- Withdraw available funds: `POST /api/wallet/withdrawals`

## Employer

- Login/register/logout: `POST /api/auth/register`, `POST /api/auth/verify-email`, `POST /api/auth/login`, `POST /api/auth/logout`
- Resend signup verification code: `POST /api/auth/resend-otp`
- Manage account CRUD: `POST /api/auth/register`, `GET /api/account`, `PUT /api/account`, `DELETE /api/account`
- Post a job: `POST /api/jobs`
- Add and manage structured skill tags on a job: `POST /api/jobs`, `PUT /api/jobs/{id}`
- Manage job: `GET /api/jobs?scope=EMPLOYER`, `PUT /api/jobs/{id}`, `DELETE /api/jobs/{id}`
- View dashboard: `GET /api/dashboard`
- View applications: `GET /api/applications`
- View an applicant profile and built resume: `GET /api/applications/{id}/profile`
- Download an applicant's uploaded resume: `GET /api/applications/{id}/resume-file`
- Update application status: `PATCH /api/applications/{id}`
- Hire a candidate: `PATCH /api/applications/{id}` with status `HIRED`
- Pay a hired candidate: `POST /api/payments`
- View payment history: `GET /api/payments`

## Admin

- Manage system: `GET /api/admin/stats`
- Prepare CV template: `GET /api/admin/cv-templates`, `POST /api/admin/cv-templates`
- Manage users CRUD: `GET /api/admin/users`, `POST /api/admin/users`, `PUT /api/admin/users/{id}`, `DELETE /api/admin/users/{id}`
- Approve employer: `PATCH /api/admin/users/{id}/approve`

## Extended Hiring And Payment Workflow

The original assignment does not explicitly require payments. CareerBridge extends it with a simulated
financial workflow:

- Employers can only pay applications that they own and have marked as `HIRED`.
- Each job has a required numeric price. Employers cannot enter or override the amount during payment.
- Hiring a candidate closes the job and removes it from public search and public job details.
- A hired application can be paid once, and the exact job price immediately credits the job seeker's wallet.
- Wallet balances are calculated from immutable payment and withdrawal records.
- Withdrawals require a payout method and destination and cannot exceed the available balance.
- This is a local demonstration ledger. It does not connect to a real bank or payment processor.
