# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Frontend: Next.js (user's choice), consuming the existing REST API. The backend already exists and stays: Node.js + Express, Oracle DB via `oracledb` (thin mode), JWT auth with bcrypt, `express-validator`, and centralized error handling. See `README.md`.

## Users

All three roles matter equally, and each one gets its own view:

- **Students**: create and join teams, submit projects (abstract, Git URL, technologies, domains, categories), track project status, and look at their project history across years.
- **Faculty**: guide teams (`Guide_ID`) and evaluate projects with a score from 0 to 100 plus written feedback.
- **Admins**: maintain master data (departments, technologies, domains, categories) and manage student and faculty records.

A secondary audience is the course reviewer, who will grade the system as a DBMS course project.

## Product Purpose

PRO (Project Online Repository) is a central, searchable record of student projects in an institution. It tracks who built each project, in which team, under which guide, which year, which technologies and domains it covers, and how faculty scored it. Success means each role can do its job end to end in the UI, and every database entity is visible and manageable.

## Positioning

PRO is relational at its core. It links projects, teams, people, departments, technologies, domains, categories and evaluations, so you can ask things like "all completed ML projects in CSE from 2024–2025 that used Python" or "this student's projects across years". It is not a file dump.

## Operating Context

- Projects belong to one team and one academic year (formatted `YYYY-YYYY`, e.g. `2025-2026`). Status is one of `ONGOING`, `SUBMITTED`, `COMPLETED`, `REJECTED`.
- A team has one student leader and one faculty guide. Members are linked through `Team_Member`.
- Search is `GET /projects/search?title=&domain=&department=&technology=&year=`. Aggregate scores come from `/projects/:id/average-score` (count, avg, min, max).
- Login is `POST /auth/login`, which returns a JWT for the Student, Faculty or Admin role. For now only the student and faculty DELETE routes require the token.
- Seed data: 5 departments, 18 students, 9 faculty, 2 admins, 6 teams, 12 projects, 12 technologies, 8 domains, 6 categories and 16 evaluations. Every account's password is `password123`.

## Capabilities and Constraints

- **Hard deadline:** the build must be done tonight (2026-10-13) and will be submitted tomorrow (2026-10-14). Scope decisions should favour complete, working coverage over extra flourish.
- **All 13 entities must be visible in the UI**, with CRUD where the API supports it: Department, Student, Faculty, Team, Team_Member, Project, Technology, Project_Technology, Domain, Project_Domain, Category, Project_Category and Evaluation. Admin is the extra login table.
- The UI may only use endpoints that already exist (see `README.md` and `postman_collection.json`). Any new endpoint is a backend change and must be called out.
- Validation errors come back as `400` with a `details` array per field. The UI must show these next to the relevant fields.
- Known schema deviations, which are deliberate and documented: Faculty has a `Password` column, and there is an `Admin` table.

## Brand Commitments

Name: **PRO: Project Online Repository**. No institution branding, logo or palette has been provided.

## Evidence on Hand

- Real seed data in `sql/seed.sql` for demos.
- API docs: `README.md`, `curl-examples.md`, `postman_collection.json`.
- No testimonials, usage metrics or institution assets exist. Do not invent any.

## Product Principles

1. **Coverage before ornament.** Every entity and relationship is reachable and editable. A missing table loses more marks than a plain one.
2. **Relationships are the product.** Always show the links: project → team → leader, guide and members; project → technologies, domains and categories; project → evaluations and average score.
3. **Role-appropriate, not role-locked.** Each role lands on its own job, but the shared repository and search stay available to everyone.
4. **Errors speak the user's language.** FK and unique-constraint failures and validation details appear as clear, field-level messages, never as raw Oracle errors.

## Accessibility & Inclusion

Accessibility is a stated requirement, but no specific standard was named. Working assumption: WCAG 2.2 AA (keyboard-operable forms and tables, visible focus, labelled inputs, sufficient contrast, status that doesn't rely on colour alone). Open: confirm whether the course requires a different standard.
