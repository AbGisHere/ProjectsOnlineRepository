# PRO — Project Online Repository

A DBMS course project: a single **Next.js** app that serves both the web UI
and the REST API, backed by **Oracle Database** through `oracledb`. It runs
locally against Oracle in Docker (set up with SQLcl) and deploys to **Vercel**
against a free **Oracle Autonomous Database**.

| Part | Where | Local URL |
|---|---|---|
| Web app | `app/` (pages) | `http://localhost:3001` |
| REST API | `app/api/` (route handlers) → `server/` | `http://localhost:3001/api` |

Changes are recorded in [CHANGELOG.md](CHANGELOG.md).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Oracle DB (`oracledb` driver, thin mode, so no Oracle Instant Client is needed)
- [Better Auth](https://better-auth.com) for web sign-in (email + password, cookie sessions), through a custom Oracle adapter
- JWT tokens (`jsonwebtoken`) for API clients such as Postman; `bcryptjs` password hashing for both
- Request validation in `server/validate.ts` (same rules and `400` shape the
  Express version used)
- Centralized error handling in `server/http.ts` + `server/errors.ts`
- `lucide-react` icons

## Project structure

```
PRO-Project-Online-Repository/
├── app/
│   ├── api/                  # REST API: one route.ts per endpoint path
│   ├── (app)/                # Signed-in pages: desk, projects, teams, students, …
│   ├── login/                # Sign-in page
│   ├── signup/               # Sign-up page (students and faculty)
│   ├── layout.tsx            # Fonts, session + toast providers
│   └── globals.css           # Design tokens and component styles
├── server/                   # Server-only code used by app/api
│   ├── db.ts                 # Oracle connection pool + execute()
│   ├── http.ts               # route() wrapper: parses input, maps errors to JSON
│   ├── errors.ts             # ApiError + Oracle error → readable message
│   ├── auth/
│   │   ├── index.ts          # Better Auth config (tables, bcrypt, sign-up rules)
│   │   ├── oracleAdapter.ts  # Better Auth database adapter for Oracle
│   │   ├── accounts.ts       # Keeps auth_user/auth_account in step with Student/Faculty/Admin
│   │   ├── guard.ts          # authenticate(): session cookie or Bearer JWT
│   │   └── jwt.ts            # JWT sign/verify for API clients
│   ├── validate.ts           # Request validation rules
│   └── handlers/             # The SQL for each entity (auth, people, teams, projects, lookups)
├── components/               # Shelf, DataTable, EntityForm, CrudPage, TopBar, …
├── lib/                      # Browser-side API client, session, types, role scope,
│                             # emailRules.ts (allowed email domains per role)
├── sql/
│   ├── ddl.sql               # Table definitions (13 entities + Admin)
│   └── seed.sql              # Sample data for the demo
├── scripts/
│   └── runSql.js             # Runs ddl.sql / seed.sql against Oracle
├── curl-examples.md          # Example curl call for every endpoint
├── postman_collection.json   # Postman collection for every endpoint
├── PRODUCT.md                # Who the product is for and its constraints
├── DESIGN.md                 # UI design system (colours, type, components)
├── CHANGELOG.md              # Release history
└── .env.example
```

## Run it locally

### 1. Prerequisites

- Node.js 20.9+ (required by Next.js 16)
- Oracle DB reachable from your machine: either the local Docker instance at
  `localhost:1521/FREEPDB1`, or an Oracle Autonomous Database (see
  [Deploying to Vercel](#deploying-to-vercel)).

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` if your DB credentials or JWT secret differ from the defaults:

```
DB_USER=system
DB_PASSWORD=25BCE0014
DB_CONNECT_STRING=localhost:1521/FREEPDB1
BETTER_AUTH_SECRET=change_this_to_a_long_random_secret
BETTER_AUTH_URL=http://localhost:3001
JWT_SECRET=change_this_to_a_different_long_random_secret
```

### 4. Create the schema

```bash
npm run ddl
```

This drops (if present) and recreates all 14 tables (the 13 entities from the
brief, plus a small `Admin` table needed for the Admin login role) with their
PK/FK constraints, plus Better Auth's four sign-in tables (`auth_user`,
`auth_session`, `auth_account`, `auth_verification`). They're prefixed `auth_`
because `USER` and `SESSION` are reserved words in Oracle.

### 5. Seed sample data

```bash
npm run seed
```

Loads 5 departments, 18 students, 9 faculty, 2 admins, 6 teams (with
members), 12 projects, 12 technologies, 8 domains, 6 categories, and 16
evaluations, plus a sign-in account for every student, faculty member and
admin. Every seeded account has the password **`password123`**
(bcrypt-hashed in the seed data) so you can log in immediately during the
review. Demo logins:

| Role | Email |
|---|---|
| Student | `aarav.sharma@vitstudent.ac.in` |
| Faculty | `rakesh.kumar@vit.ac.in` |
| Admin | `admin@vit.edu` |

### 6. Start the app

```bash
npm run dev      # development, http://localhost:3001
npm run build && npm start   # production build
```

Open `http://localhost:3001` and sign in with any seeded account (see the
table above). The login page has a one-click "fill in the demo login" for
each role, and new students and faculty can register at `/signup`. The API answers
at `http://localhost:3001/api`; `GET /api` is a health check.

## Deploying to Vercel

The whole project is one Vercel deployment: pages and API together.

1. **Create the database.** In Oracle Cloud (free tier), create an
   *Autonomous Database* (Transaction Processing, "Always Free"). Under
   **Network**, choose *Secure access from everywhere*, and turn **off**
   *Require mutual TLS (mTLS) authentication* so the app can connect without
   a wallet. Set the `ADMIN` password.
2. **Copy the connection string.** On the database's **Database connection**
   page, pick *TLS* and copy the `_low` connection string.
3. **Load the schema** from your machine. Put the cloud values in `.env`
   (`DB_USER=ADMIN`, `DB_PASSWORD`, `DB_CONNECT_STRING=<the TLS string>`), then
   run `npm run ddl` and `npm run seed`.
4. **Import the repo into Vercel** (New Project → import from GitHub). The
   framework is detected as Next.js; keep the root directory as the repo root.
5. **Set the environment variables** in the Vercel project: `DB_USER`,
   `DB_PASSWORD`, `DB_CONNECT_STRING`, `BETTER_AUTH_SECRET` and `JWT_SECRET`
   (two different long random strings, e.g. `openssl rand -base64 32`), and
   `BETTER_AUTH_URL` set to your production URL
   (`https://<your-app>.vercel.app`). Optional: `JWT_EXPIRES_IN`,
   `BCRYPT_SALT_ROUNDS`, `DB_POOL_MAX`.
6. **Deploy.** Open `https://<your-app>.vercel.app/api` to check the API, then
   sign in on the home page.

## What's in the app

| Screen | What it covers |
|---|---|
| Desk | A dashboard for each role: a student's teams, reports and feedback; a faculty member's guided teams and evaluation queue; the admin's shelf and table row counts |
| Repository | All projects as a shelf of spines by academic year, plus a filterable table (`/api/projects/search`) |
| Project record | Team, leader, guide and members; link/unlink technologies, domains and categories; the evaluation certificate (`/api/projects/:id/average-score`) |
| Teams | Team CRUD, plus adding/removing members (`Team_Member`) |
| Students, Faculty, Departments | CRUD, with each person's project history or guided teams |
| Evaluations | Evaluation CRUD |
| Subjects | Technology, Domain and Category CRUD, plus every junction-table row |
| Ledger | All 13 tables exactly as the API returns them |

Roles are enforced in the UI only: admins can change everything; faculty
evaluate and manage the teams they guide; students manage their own teams
and projects. The API itself only guards `DELETE /api/students/:id` and
`DELETE /api/faculty/:id` (see Authentication).

Validation failures (`400` with `details`) appear next to the matching form
field, and Oracle errors are rewritten into plain sentences, so no raw
`ORA-` text reaches the screen.

**Testing status:** every screen has been checked on desktop (1440px) and
mobile (390px) against the seed data. The API's validation, email rules and
error responses have been checked without a database. Reads, writes and
Better Auth sign-in against a live Oracle database have **not yet been run**.
Check them once before the review.

## Authentication

There are two ways to sign in, backed by the same accounts and passwords.

**Web app: Better Auth.** The pages sign in through
[Better Auth](https://better-auth.com) with email and password, and stay
signed in with a cookie session (7 days). Its endpoints live under
`/api/auth/*` (for example `POST /api/auth/sign-in/email`,
`POST /api/auth/sign-out`, `GET /api/auth/get-session`). Better Auth has no
Oracle adapter, so `server/auth/oracleAdapter.ts` provides one.

**API clients: JWT.** `POST /api/auth/login` returns a JWT for Postman, curl
and other clients. Send it as `Authorization: Bearer <token>`.

**Who can sign up, and with which email:**

| Role | Email must be | How the account is created |
|---|---|---|
| Student | `@vitstudent.ac.in` | `/signup` page, `POST /api/auth/register`, or an admin adding them |
| Faculty | `@vit.ac.in` | `/signup` page, `POST /api/auth/register`, or an admin adding them |
| Admin | any address | `POST /api/auth/register` only (not on the sign-up page) |

These rules live in `lib/emailRules.ts` and are enforced by every path that
creates or edits a person: register, `POST`/`PUT /api/students`, and
`POST`/`PUT /api/faculty`. A sign-in account always belongs to one Student,
Faculty or Admin row. Better Auth refuses to create an account for an email
that isn't on record, and deleting a student or faculty member deletes their
account and sessions.

Protected routes: `DELETE /api/students/:id` and `DELETE /api/faculty/:id`
accept either a signed-in session or a Bearer token. To protect more routes,
call `authenticate()` / `requireRole()` from `server/auth/guard.ts` in a
handler.

Passwords are hashed with bcrypt (`bcryptjs`) in both the person tables and
Better Auth's `auth_account`, so the seed's hashes work for both sign-in
paths. Plaintext passwords are never stored or returned by any endpoint.

## Endpoints

Every path below is served under **`/api`**: for example
`GET /projects/search` is `GET http://localhost:3001/api/projects/search` locally,
or `https://<your-app>.vercel.app/api/projects/search` once deployed.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register a Student/Faculty/Admin |
| POST | `/auth/login` | Log in, returns a JWT |

### Department
| Method | Path | Description |
|---|---|---|
| GET | `/departments` | List all departments |
| GET | `/departments/:id` | Get one department |
| POST | `/departments` | Create a department |
| PUT | `/departments/:id` | Update a department |
| DELETE | `/departments/:id` | Delete a department |

### Student
| Method | Path | Description |
|---|---|---|
| GET | `/students` | List all students |
| GET | `/students/:id` | Get one student |
| GET | `/students/:id/projects` | Student's project history across years |
| POST | `/students` | Create a student |
| PUT | `/students/:id` | Update a student |
| DELETE | `/students/:id` | Delete a student (auth required) |

### Faculty
| Method | Path | Description |
|---|---|---|
| GET | `/faculty` | List all faculty |
| GET | `/faculty/:id` | Get one faculty member |
| GET | `/faculty/:id/guided-teams` | Teams guided by this faculty member |
| POST | `/faculty` | Create a faculty member |
| PUT | `/faculty/:id` | Update a faculty member |
| DELETE | `/faculty/:id` | Delete a faculty member (auth required) |

### Team
| Method | Path | Description |
|---|---|---|
| GET | `/teams` | List all teams |
| GET | `/teams/:id` | Get one team |
| POST | `/teams` | Create a team (validates Leader_ID is a Student, Guide_ID is a Faculty) |
| PUT | `/teams/:id` | Update a team |
| DELETE | `/teams/:id` | Delete a team |
| GET | `/teams/:teamId/members` | List a team's members |
| POST | `/teams/:teamId/members` | Add a student to a team |
| DELETE | `/teams/:teamId/members/:studentId` | Remove a student from a team |
| GET | `/team-members` | List all Team_Member rows across every team |

### Project
| Method | Path | Description |
|---|---|---|
| GET | `/projects` | List all projects |
| GET | `/projects/search?title=&domain=&department=&technology=&year=` | Filtered search |
| GET | `/projects/:id` | Get one project |
| GET | `/projects/:id/evaluations` | All faculty evaluations for a project |
| GET | `/projects/:id/average-score` | Aggregate score (count/avg/min/max) |
| POST | `/projects` | Create a project |
| PUT | `/projects/:id` | Update a project |
| DELETE | `/projects/:id` | Delete a project |
| GET/POST/DELETE | `/projects/:projectId/technologies[/:otherId]` | Manage Project_Technology links |
| GET/POST/DELETE | `/projects/:projectId/domains[/:otherId]` | Manage Project_Domain links |
| GET/POST/DELETE | `/projects/:projectId/categories[/:otherId]` | Manage Project_Category links |

### Technology / Domain / Category
| Method | Path | Description |
|---|---|---|
| GET | `/technologies`, `/domains`, `/categories` | List all |
| GET | `/technologies/:id`, `/domains/:id`, `/categories/:id` | Get one |
| POST | same base paths | Create |
| PUT | `/technologies/:id`, `/domains/:id`, `/categories/:id` | Update |
| DELETE | same | Delete |
| GET | `/technologies/links/all`, `/domains/links/all`, `/categories/links/all` | List all junction rows for that entity |

### Evaluation
| Method | Path | Description |
|---|---|---|
| GET | `/evaluations` | List all evaluations |
| GET | `/evaluations/:id` | Get one evaluation |
| POST | `/evaluations` | Create an evaluation |
| PUT | `/evaluations/:id` | Update score/feedback |
| DELETE | `/evaluations/:id` | Delete an evaluation |

See `curl-examples.md` for a runnable example of every endpoint above.

## Design notes for the review

- **Schema deviation**: the brief's `Faculty` table had no `Password` column,
  but deliverable #5 asks for Faculty login. A `Password` column was added to
  `Faculty` (see the comment in `sql/ddl.sql`) so all three roles can log in
  consistently. An `Admin` table was also added. It isn't one of the 13
  listed entities, but the login flow needs somewhere to store admin
  credentials.
- **One app instead of two**: the API started as an Express server and moved
  into Next.js route handlers, so the UI and API deploy together. Every SQL
  statement, validation rule and error mapping was carried over unchanged;
  only the request/response plumbing differs.
- **Connection pooling**: `server/db.ts` creates one Oracle connection pool
  per server instance (`oracledb.createPool`) and hands out/reclaims a
  connection per query, rather than opening a new connection each time. On
  Vercel each warm function instance reuses its pool; `DB_POOL_MAX` keeps it
  small.
- **Validation**: every POST/PUT handler validates its body before running
  SQL; failures return `400` with a `details` array listing each invalid
  field.
- **Error handling**: every handler is wrapped by `route()` in
  `server/http.ts`, so a thrown error (including Oracle constraint
  violations) becomes the standard JSON error. `server/errors.ts` maps
  common Oracle error numbers (unique constraint, FK violation) to readable
  messages.
- **Team creation guard**: `POST /api/teams` explicitly checks that
  `Leader_ID` exists in `Student` and `Guide_ID` exists in `Faculty` before
  inserting, returning a clear `400` instead of a raw Oracle FK error.
