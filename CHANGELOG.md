# Changelog

All notable changes to PRO (Project Online Repository) are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Add new entries under **Unreleased** as you make changes, then move them
under a dated heading when you tag or submit a version.

## [Unreleased]

### Fixed
- The frontend and the API both tried to use port 3001, and the frontend
  called the API on 3000. The frontend now runs on **3002** and calls the API
  on **3001** (the `PORT` in `.env.example`). `curl-examples.md` and the
  README now use 3001 as well.

### Changed
- README now covers the whole project (API and frontend): ports, folder
  layout, a link to this changelog, and the frontend's testing status.

### Known gaps
- The frontend's write actions (create, edit, delete, link/unlink, add
  member, evaluate) have not yet been tested against the live Oracle
  database.
- On phones, the status and action columns in wide tables need a sideways
  scroll.

## [0.2.0] - 2026-10-14

### Added
- **Next.js frontend** in `frontend/` (Next.js 16, React 19, TypeScript).
  - Login with a role picker (Student, Faculty, Admin) and one-click demo
    logins for the seeded accounts.
  - A desk for each role: student (reports, teams, feedback), faculty (guided
    teams, evaluation queue, scores given), admin (every report plus row
    counts for all 13 tables).
  - Repository: projects shown as spines on a shelf grouped by academic
    year, plus a sortable table filtered through `/projects/search`
    (title, domain, technology, department, year) and by status.
  - Project record: team, leader, guide, members; linking and unlinking
    technologies, domains and categories; an evaluation certificate built
    from `/projects/:id/average-score`; faculty can add and edit their own
    evaluation.
  - CRUD screens for Department, Student, Faculty, Team (with member
    management), Evaluation, Technology, Domain and Category, plus views of
    the `Project_Technology`, `Project_Domain` and `Project_Category`
    junction tables.
  - A Ledger page listing all 13 tables exactly as the API returns them.
  - Validation errors next to each field; Oracle errors rewritten as plain
    sentences.
  - Edit actions shown by role, enforced in the UI only.
- `PRODUCT.md` (users, purpose, constraints) and `DESIGN.md` (frontend
  design system).
- README section on running the frontend.

## [0.1.2] - 2026-09-21

### Fixed
- `PUT /students/:id`, `/faculty/:id`, `/projects/:id` and
  `/evaluations/:id` now update only the fields sent in the request.
  Previously an omitted optional field (credits, score, designation,
  feedback, abstract, git_url, submission_date) was overwritten with NULL.
- `PUT /teams/:id` no longer sets `Leader_ID`/`Guide_ID` to NULL when only
  `team_name` is sent (this previously failed with ORA-01407).

## [0.1.1] - 2026-09-20

### Added
- Postman collection covering every endpoint (`postman_collection.json`).

### Fixed
- Routes selecting `Project.*` crashed because CLOB columns came back as
  streaming Lob objects; CLOBs are now fetched as strings.
- `/projects/search` failed with ORA-22848 (`DISTINCT` on a CLOB); the
  unnecessary `DISTINCT` was removed.

### Changed
- Default `PORT` in `.env.example` changed to 3001 because 3000 was in use
  locally.

## [0.1.0] - 2026-09-20

### Added
- Express + Oracle REST API for the 13 entities from the brief, plus an
  `Admin` table for admin logins.
- DDL and seed scripts (`npm run ddl`, `npm run seed`).
- Full CRUD for every entity and junction table.
- JWT auth with bcrypt-hashed passwords for Student, Faculty and Admin.
- Feature endpoints: project search, project evaluations, average score,
  student project history, faculty guided teams, validated team creation.
- Centralized error handling, `express-validator` on every POST/PUT route,
  README and `curl-examples.md`.
