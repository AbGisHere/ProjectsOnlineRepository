# Changelog

All notable changes to PRO (Project Online Repository) are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Add new entries under **Unreleased** as you make changes, then move them
under a dated heading when you tag or submit a version.

## [Unreleased]

### Changed
- Demo student login is now `student@vitstudent.ac.in` (Aarav Sharma, #1001).
  Faculty stays `rakesh.kumar@vit.ac.in`.
- **One admin: `abg.592006@gmail.com`**, replacing the two seeded demo
  admins. It signs in through Better Auth like everyone else.
- The login page no longer offers a one-click admin login.
- README deploy guide rewritten around the wallet. The old steps said to turn
  off mTLS, which Oracle only allows once an IP allow list is set, and
  Vercel has no fixed IPs. Added a step to run Vercel functions in the region
  nearest the database, and a troubleshooting note.

### Added
- **Wallet (mutual TLS) connections to Oracle Autonomous Database** through
  two new environment variables, `DB_WALLET_PEM` (the wallet's `ewallet.pem`,
  as base64 or raw PEM) and `DB_WALLET_PASSWORD`. The app and the scripts
  connect without wallet files on disk, so it works on Vercel with mTLS left
  on and no IP allow list. `scripts/dbConfig.js` holds the scripts' shared
  connection settings.
- `npm run set-password -- <email>`: sets a new password (hidden prompt) for
  any account in both the person table and Better Auth, and signs out its
  sessions. Use it on the admin account right after seeding.

### Security
- `POST /api/auth/register` with `role: "admin"` now requires a signed-in
  admin (session or Bearer token). Before this, anyone could create an admin
  account. The Postman collection's "Register Admin" request now sends
  `{{admin_token}}` from "Login (Admin)".

## [0.4.0] - 2026-10-14

### Added
- **Better Auth sign-in for the web app**: email and password with cookie
  sessions (7 days), mounted at `/api/auth/*`.
  - `server/auth/oracleAdapter.ts`: a Better Auth database adapter for Oracle
    (none exists upstream), built on `createAdapterFactory` and
    node-oracledb.
  - Four tables in `ddl.sql`: `auth_user`, `auth_session`, `auth_account`,
    `auth_verification`. They're prefixed because `USER` and `SESSION` are
    reserved in Oracle.
  - Passwords use bcrypt, so the seed's existing hashes sign in unchanged.
- **Email rules per role**: students must use `@vitstudent.ac.in`, faculty
  `@vit.ac.in`, admins any address. Enforced on `POST /api/auth/register`,
  `POST`/`PUT /api/students` and `POST`/`PUT /api/faculty`, and shown as
  hints in the forms.
- `/signup` page for students and faculty. It creates the Student/Faculty row
  and the sign-in account, then signs the user in.
- Seed data creates a sign-in account for every student, faculty member and
  admin.

### Changed
- Sign-in is email + password; the role comes from the account, so the role
  picker is gone. The login page shows which role an email will sign in as.
- Seed emails now follow the rules: students `@vitstudent.ac.in`, faculty
  `@vit.ac.in`. Admins keep `@vit.edu`. The Postman collection and
  `curl-examples.md` use the new addresses.
- `DELETE /api/students/:id` and `/api/faculty/:id` accept a signed-in session
  or a Bearer JWT.
- `POST /api/auth/register` also creates the web sign-in account, and editing
  or deleting a student or faculty member updates or removes it.
- The browser no longer keeps a JWT in localStorage; it uses the Better Auth
  session cookie.
- New environment variables: `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`.

### Kept
- `POST /api/auth/login` still issues JWTs for API clients (Postman, curl).

### Known gaps
- Better Auth sign-in, sign-up and every write action have not yet been run
  against a live Oracle database.

## [0.3.0] - 2026-10-14

### Changed
- **The API moved from Express into Next.js route handlers.** The UI and
  API are now one app on one port, deployable to Vercel as a single project
  with one database.
  - Every endpoint keeps its path, request body and JSON response, now under
    `/api` (for example `/api/projects/search`).
  - Every SQL statement, validation rule and Oracle error mapping is carried
    over unchanged. The SQL lives in `server/handlers/`, and the route files
    are in `app/api/`.
  - `DELETE /api/students/:id` and `DELETE /api/faculty/:id` still require a
    JWT.
  - Unknown `/api` paths still return the JSON `Route not found` 404.
- The Next.js app moved from `frontend/` to the repository root, and the two
  `package.json` files were merged. `npm run dev` now starts everything on
  `http://localhost:3001`.
- `bcrypt` was replaced by `bcryptjs`: same algorithm, no native build, so it
  installs cleanly on Vercel. Existing `$2b$` hashes in `seed.sql` still
  verify.
- The browser calls the API on its own origin (`/api`), so no CORS or
  `NEXT_PUBLIC_API_URL` is needed.
- `.env.example` documents the Oracle Autonomous Database (TLS, no wallet)
  settings and adds `DB_POOL_MAX`. `PORT` was removed, since the port is set
  in the npm scripts.
- The Postman collection and `curl-examples.md` now use
  `http://localhost:3001/api`.
- README rewritten for the single app: run locally, deploy to Vercel, project
  structure. PRODUCT.md updated to match.

### Removed
- The Express server: `app.js`, `server.js`, `routes/`, `controllers/`,
  `middleware/`, `utils/`, `config/`, and the `express`, `cors`, `morgan`,
  `express-validator`, `nodemon` and `bcrypt` dependencies.
- The separate `frontend/` package. Its port fix from earlier today (0.2.1,
  frontend on 3002) no longer applies, since it is all one app now.

### Known gaps
- Reads and writes against a live Oracle database haven't been run since the
  move. Validation, auth and error responses were checked without a database.
- On phones, the status and action columns in wide tables need a sideways
  scroll.

## [0.2.1] - 2026-10-14

### Fixed
- The frontend and the API both tried to use port 3001; the frontend moved
  to 3002. (Superseded by 0.3.0.)

### Added
- This changelog, and a README covering both the API and the frontend.

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
