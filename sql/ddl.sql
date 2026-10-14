-- PRO — Project Online Repository
-- PostgreSQL DDL script (Supabase or any Postgres 14+). Drops and recreates
-- every table, so running it again resets the database.
--
-- Drop order respects FK dependencies (children before parents).
-- Run via: npm run ddl   (see scripts/runSql.js)

DROP TABLE IF EXISTS auth_verification, auth_account, auth_session, auth_user,
    Admin, Evaluation, Project_Category, Project_Domain, Project_Technology,
    Team_Member, Project, Team, Category, Domain, Technology, Faculty, Student,
    Department CASCADE;

-- ===========================================================================
-- 1. Department
-- ===========================================================================
CREATE TABLE Department (
    Department_ID    INTEGER         CONSTRAINT pk_department PRIMARY KEY,
    Department_Name  VARCHAR(100)    NOT NULL UNIQUE
);

-- ===========================================================================
-- 2. Student
-- ===========================================================================
CREATE TABLE Student (
    Student_ID     INTEGER         CONSTRAINT pk_student PRIMARY KEY,
    Name           VARCHAR(100)    NOT NULL,
    Email          VARCHAR(150)    NOT NULL UNIQUE,
    Department_ID  INTEGER         NOT NULL,
    Year           SMALLINT        NOT NULL CHECK (Year BETWEEN 1 AND 5),
    Credits        INTEGER         DEFAULT 0,
    Password       VARCHAR(255)    NOT NULL,
    Score          NUMERIC(5,2)    DEFAULT 0,
    CONSTRAINT fk_student_department FOREIGN KEY (Department_ID)
        REFERENCES Department (Department_ID)
);

-- ===========================================================================
-- 3. Faculty
-- ===========================================================================
-- NOTE: Password added beyond the original spec's column list so Faculty can
-- authenticate via POST /auth/login like Student and Admin (deliverable #5
-- requires login for all three roles).
CREATE TABLE Faculty (
    Faculty_ID     INTEGER         CONSTRAINT pk_faculty PRIMARY KEY,
    Name           VARCHAR(100)    NOT NULL,
    Email          VARCHAR(150)    NOT NULL UNIQUE,
    Department_ID  INTEGER         NOT NULL,
    Designation    VARCHAR(100),
    Password       VARCHAR(255)    NOT NULL,
    Score          NUMERIC(5,2)    DEFAULT 0,
    CONSTRAINT fk_faculty_department FOREIGN KEY (Department_ID)
        REFERENCES Department (Department_ID)
);

-- ===========================================================================
-- 4. Team
-- ===========================================================================
CREATE TABLE Team (
    Team_ID    INTEGER         CONSTRAINT pk_team PRIMARY KEY,
    Team_Name  VARCHAR(150)    NOT NULL,
    Leader_ID  INTEGER         NOT NULL,
    Guide_ID   INTEGER         NOT NULL,
    CONSTRAINT fk_team_leader FOREIGN KEY (Leader_ID)
        REFERENCES Student (Student_ID),
    CONSTRAINT fk_team_guide FOREIGN KEY (Guide_ID)
        REFERENCES Faculty (Faculty_ID)
);

-- ===========================================================================
-- 5. Team_Member (junction: Team <-> Student)
-- ===========================================================================
CREATE TABLE Team_Member (
    Team_ID     INTEGER         NOT NULL,
    Student_ID  INTEGER         NOT NULL,
    CONSTRAINT pk_team_member PRIMARY KEY (Team_ID, Student_ID),
    CONSTRAINT fk_tm_team FOREIGN KEY (Team_ID)
        REFERENCES Team (Team_ID) ON DELETE CASCADE,
    CONSTRAINT fk_tm_student FOREIGN KEY (Student_ID)
        REFERENCES Student (Student_ID) ON DELETE CASCADE
);

-- ===========================================================================
-- 6. Project
-- ===========================================================================
CREATE TABLE Project (
    Project_ID        INTEGER         CONSTRAINT pk_project PRIMARY KEY,
    Title             VARCHAR(200)    NOT NULL,
    Abstract          TEXT,
    Academic_Year     VARCHAR(9)      NOT NULL, -- e.g. '2025-2026'
    Team_ID           INTEGER         NOT NULL,
    Status            VARCHAR(30)     DEFAULT 'ONGOING'
                       CHECK (Status IN ('ONGOING', 'COMPLETED', 'SUBMITTED', 'REJECTED')),
    GitURL            VARCHAR(300),
    Submission_Date   DATE,
    CONSTRAINT fk_project_team FOREIGN KEY (Team_ID)
        REFERENCES Team (Team_ID)
);

-- ===========================================================================
-- 7. Technology
-- ===========================================================================
CREATE TABLE Technology (
    Technology_ID    INTEGER         CONSTRAINT pk_technology PRIMARY KEY,
    Technology_Name  VARCHAR(100)    NOT NULL UNIQUE
);

-- ===========================================================================
-- 8. Project_Technology (junction: Project <-> Technology)
-- ===========================================================================
CREATE TABLE Project_Technology (
    Project_ID     INTEGER         NOT NULL,
    Technology_ID  INTEGER         NOT NULL,
    CONSTRAINT pk_project_technology PRIMARY KEY (Project_ID, Technology_ID),
    CONSTRAINT fk_pt_project FOREIGN KEY (Project_ID)
        REFERENCES Project (Project_ID) ON DELETE CASCADE,
    CONSTRAINT fk_pt_technology FOREIGN KEY (Technology_ID)
        REFERENCES Technology (Technology_ID) ON DELETE CASCADE
);

-- ===========================================================================
-- 9. Domain
-- ===========================================================================
CREATE TABLE Domain (
    Domain_ID    INTEGER         CONSTRAINT pk_domain PRIMARY KEY,
    Domain_Name  VARCHAR(100)    NOT NULL UNIQUE
);

-- ===========================================================================
-- 10. Project_Domain (junction: Project <-> Domain)
-- ===========================================================================
CREATE TABLE Project_Domain (
    Project_ID  INTEGER         NOT NULL,
    Domain_ID   INTEGER         NOT NULL,
    CONSTRAINT pk_project_domain PRIMARY KEY (Project_ID, Domain_ID),
    CONSTRAINT fk_pd_project FOREIGN KEY (Project_ID)
        REFERENCES Project (Project_ID) ON DELETE CASCADE,
    CONSTRAINT fk_pd_domain FOREIGN KEY (Domain_ID)
        REFERENCES Domain (Domain_ID) ON DELETE CASCADE
);

-- ===========================================================================
-- 11. Category
-- ===========================================================================
CREATE TABLE Category (
    Category_ID    INTEGER         CONSTRAINT pk_category PRIMARY KEY,
    Category_Name  VARCHAR(100)    NOT NULL UNIQUE
);

-- ===========================================================================
-- 12. Project_Category (junction: Project <-> Category)
-- ===========================================================================
CREATE TABLE Project_Category (
    Project_ID   INTEGER         NOT NULL,
    Category_ID  INTEGER         NOT NULL,
    CONSTRAINT pk_project_category PRIMARY KEY (Project_ID, Category_ID),
    CONSTRAINT fk_pc_project FOREIGN KEY (Project_ID)
        REFERENCES Project (Project_ID) ON DELETE CASCADE,
    CONSTRAINT fk_pc_category FOREIGN KEY (Category_ID)
        REFERENCES Category (Category_ID) ON DELETE CASCADE
);

-- ===========================================================================
-- 13. Evaluation
-- ===========================================================================
CREATE TABLE Evaluation (
    Evaluation_ID     INTEGER         CONSTRAINT pk_evaluation PRIMARY KEY,
    Project_ID        INTEGER         NOT NULL,
    Faculty_ID        INTEGER         NOT NULL,
    Score             NUMERIC(5,2)    NOT NULL CHECK (Score BETWEEN 0 AND 100),
    Feedback          VARCHAR(1000),
    Evaluation_Date   DATE            DEFAULT CURRENT_DATE,
    CONSTRAINT fk_eval_project FOREIGN KEY (Project_ID)
        REFERENCES Project (Project_ID) ON DELETE CASCADE,
    CONSTRAINT fk_eval_faculty FOREIGN KEY (Faculty_ID)
        REFERENCES Faculty (Faculty_ID)
);

-- ===========================================================================
-- Admin (auth-only helper table; not part of the 13-entity domain model but
-- required to support the Admin role in the auth flow).
-- ===========================================================================
CREATE TABLE Admin (
    Admin_ID   INTEGER         CONSTRAINT pk_admin PRIMARY KEY,
    Name       VARCHAR(100)    NOT NULL,
    Email      VARCHAR(150)    NOT NULL UNIQUE,
    Password   VARCHAR(255)    NOT NULL
);

-- ===========================================================================
-- Better Auth tables (sign-in sessions for the web app). Named auth_* because
-- USER is a reserved word in SQL. Each auth_user row is linked
-- to exactly one Student, Faculty or Admin row by (user_role, ref_id).
-- ===========================================================================
CREATE TABLE auth_user (
    id              VARCHAR(64)     CONSTRAINT pk_auth_user PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL CONSTRAINT uq_auth_user_email UNIQUE,
    email_verified  BOOLEAN         DEFAULT FALSE NOT NULL,
    image           VARCHAR(500),
    created_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_role       VARCHAR(10)     NOT NULL CHECK (user_role IN ('student', 'faculty', 'admin')),
    ref_id          INTEGER         NOT NULL,
    CONSTRAINT uq_auth_user_ref UNIQUE (user_role, ref_id)
);

CREATE TABLE auth_session (
    id              VARCHAR(64)     CONSTRAINT pk_auth_session PRIMARY KEY,
    expires_at      TIMESTAMPTZ     NOT NULL,
    token           VARCHAR(255)    NOT NULL CONSTRAINT uq_auth_session_token UNIQUE,
    created_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address      VARCHAR(100),
    user_agent      VARCHAR(500),
    user_id         VARCHAR(64)     NOT NULL,
    CONSTRAINT fk_auth_session_user FOREIGN KEY (user_id)
        REFERENCES auth_user (id) ON DELETE CASCADE
);
CREATE INDEX ix_auth_session_user ON auth_session (user_id);

CREATE TABLE auth_account (
    id                        VARCHAR(64)     CONSTRAINT pk_auth_account PRIMARY KEY,
    account_id                VARCHAR(255)    NOT NULL,
    provider_id               VARCHAR(50)     NOT NULL,
    user_id                   VARCHAR(64)     NOT NULL,
    access_token              VARCHAR(2000),
    refresh_token             VARCHAR(2000),
    id_token                  TEXT,
    access_token_expires_at   TIMESTAMPTZ,
    refresh_token_expires_at  TIMESTAMPTZ,
    scope                     VARCHAR(500),
    password                  VARCHAR(255),
    created_at                TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at                TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_auth_account_user FOREIGN KEY (user_id)
        REFERENCES auth_user (id) ON DELETE CASCADE
);
CREATE INDEX ix_auth_account_user ON auth_account (user_id);

CREATE TABLE auth_verification (
    id                  VARCHAR(64)     CONSTRAINT pk_auth_verification PRIMARY KEY,
    identifier          VARCHAR(255)    NOT NULL,
    verification_value  VARCHAR(2000)   NOT NULL,
    expires_at          TIMESTAMPTZ     NOT NULL,
    created_at          TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMPTZ     DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX ix_auth_verification_id ON auth_verification (identifier);


-- ===========================================================================
-- Supabase publishes every table in the public schema through its Data API
-- (PostgREST). Row Level Security with no policies closes that door: only
-- the app's own connection (the table owner, which bypasses RLS) can read or
-- write, so password hashes and sessions never leak through the API key.
-- ===========================================================================
ALTER TABLE Department         ENABLE ROW LEVEL SECURITY;
ALTER TABLE Student            ENABLE ROW LEVEL SECURITY;
ALTER TABLE Faculty            ENABLE ROW LEVEL SECURITY;
ALTER TABLE Team               ENABLE ROW LEVEL SECURITY;
ALTER TABLE Team_Member        ENABLE ROW LEVEL SECURITY;
ALTER TABLE Project            ENABLE ROW LEVEL SECURITY;
ALTER TABLE Technology         ENABLE ROW LEVEL SECURITY;
ALTER TABLE Project_Technology ENABLE ROW LEVEL SECURITY;
ALTER TABLE Domain             ENABLE ROW LEVEL SECURITY;
ALTER TABLE Project_Domain     ENABLE ROW LEVEL SECURITY;
ALTER TABLE Category           ENABLE ROW LEVEL SECURITY;
ALTER TABLE Project_Category   ENABLE ROW LEVEL SECURITY;
ALTER TABLE Evaluation         ENABLE ROW LEVEL SECURITY;
ALTER TABLE Admin              ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_user          ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_session       ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_account       ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_verification  ENABLE ROW LEVEL SECURITY;
