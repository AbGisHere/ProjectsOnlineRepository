# PRO — Project Online Repository

A REST API backend for a DBMS course project. Node.js + Express, backed by
Oracle Database (via `oracledb`), running against an Oracle instance in
Docker set up with SQLcl.

## Stack

- Node.js + Express
- Oracle DB (`oracledb` driver, thin mode — no Oracle Instant Client needed)
- JWT auth (`jsonwebtoken`) + `bcrypt` password hashing
- `express-validator` for request validation
- Centralized error handling middleware

## Project structure

```
PRO-Project-Online-Repository/
├── app.js                 # Express app: middleware + route mounting
├── server.js               # Entry point: starts the DB pool + HTTP server
├── config/
│   └── db.js                # Oracle connection pool + query helpers
├── controllers/             # Business logic per entity
├── routes/                  # Express routers per entity
├── middleware/
│   ├── auth.js               # JWT verification + role guard
│   ├── errorHandler.js       # ApiError class + centralized error middleware
│   └── validate.js           # express-validator result handler
├── utils/
│   └── asyncHandler.js       # try/catch wrapper for async route handlers
├── sql/
│   ├── ddl.sql                # Table definitions (13 entities + Admin)
│   └── seed.sql                # Sample data for the demo
├── scripts/
│   └── runSql.js               # Runs ddl.sql / seed.sql against Oracle
├── curl-examples.md          # Example curl call for every endpoint
└── .env.example
```

## Setup

### 1. Prerequisites

- Node.js 18+
- Oracle DB running in Docker (already set up via SQLcl per the project brief),
  reachable at `localhost:1521/FREEPDB1`.

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
PORT=3000
JWT_SECRET=change_this_to_a_long_random_secret
```

### 4. Create the schema

```bash
npm run ddl
```

This drops (if present) and recreates all 14 tables (the 13 entities from the
brief, plus a small `Admin` table needed for the Admin login role) with their
PK/FK constraints.

### 5. Seed sample data

```bash
npm run seed
```

Loads 5 departments, 18 students, 9 faculty, 2 admins, 6 teams (with
members), 12 projects, 12 technologies, 8 domains, 6 categories, and 16
evaluations. Every seeded Student/Faculty/Admin account has the password
**`password123`** (bcrypt-hashed in the seed data) so you can log in
immediately during the review.

### 6. Run the server

```bash
npm start      # production
npm run dev     # nodemon, auto-restart on changes
```

Server runs on `http://localhost:3000` by default.

## Authentication

- `POST /auth/register` — create a Student, Faculty, or Admin account.
- `POST /auth/login` — returns a JWT. Include it as `Authorization: Bearer <token>`
  on protected routes (currently `DELETE /students/:id` and `DELETE /faculty/:id`
  require a valid token — extend `authenticate`/`requireRole` in
  `middleware/auth.js` to protect more routes as needed for your demo).

Passwords are hashed with `bcrypt` before storage; plaintext passwords are
never stored or returned by any endpoint.

## Endpoints

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
  consistently. An `Admin` table was also added — it isn't one of the 13
  listed entities, but the login flow needs somewhere to store admin
  credentials.
- **Connection pooling**: `config/db.js` creates a single Oracle connection
  pool at startup (`oracledb.createPool`) and hands out/reclaims connections
  per request via `withConnection`, rather than opening a new connection per
  query.
- **Validation**: every POST/PUT route runs `express-validator` checks before
  hitting the controller; failures return `400` with a `details` array
  listing each invalid field.
- **Error handling**: all controllers use `asyncHandler` so a thrown error
  (including Oracle constraint violations) is forwarded to the centralized
  `errorHandler` middleware in `middleware/errorHandler.js`, which maps
  common Oracle error numbers (unique constraint, FK violation) to readable
  messages.
- **Team creation guard**: `POST /teams` explicitly checks that `Leader_ID`
  exists in `Student` and `Guide_ID` exists in `Faculty` before inserting,
  returning a clear `400` instead of a raw Oracle FK error.
