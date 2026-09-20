-- PRO — Project Online Repository
-- Oracle DDL script. Run as the `system` user (or any user with CREATE TABLE
-- privileges) against the FREEPDB1 pluggable database.
--
-- Drop order respects FK dependencies (children before parents).
-- Run via: npm run ddl   (see scripts/runSql.js)

BEGIN EXECUTE IMMEDIATE 'DROP TABLE Admin CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Evaluation CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Project_Category CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Project_Domain CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Project_Technology CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Team_Member CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Project CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Team CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Category CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Domain CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Technology CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Faculty CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Student CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE Department CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- ===========================================================================
-- 1. Department
-- ===========================================================================
CREATE TABLE Department (
    Department_ID    NUMBER(6)       CONSTRAINT pk_department PRIMARY KEY,
    Department_Name  VARCHAR2(100)   NOT NULL UNIQUE
);

-- ===========================================================================
-- 2. Student
-- ===========================================================================
CREATE TABLE Student (
    Student_ID     NUMBER(10)      CONSTRAINT pk_student PRIMARY KEY,
    Name           VARCHAR2(100)   NOT NULL,
    Email          VARCHAR2(150)   NOT NULL UNIQUE,
    Department_ID  NUMBER(6)       NOT NULL,
    Year           NUMBER(1)       NOT NULL CHECK (Year BETWEEN 1 AND 5),
    Credits        NUMBER(5)       DEFAULT 0,
    Password       VARCHAR2(255)   NOT NULL,
    Score          NUMBER(5,2)     DEFAULT 0,
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
    Faculty_ID     NUMBER(10)      CONSTRAINT pk_faculty PRIMARY KEY,
    Name           VARCHAR2(100)   NOT NULL,
    Email          VARCHAR2(150)   NOT NULL UNIQUE,
    Department_ID  NUMBER(6)       NOT NULL,
    Designation    VARCHAR2(100),
    Password       VARCHAR2(255)   NOT NULL,
    Score          NUMBER(5,2)     DEFAULT 0,
    CONSTRAINT fk_faculty_department FOREIGN KEY (Department_ID)
        REFERENCES Department (Department_ID)
);

-- ===========================================================================
-- 4. Team
-- ===========================================================================
CREATE TABLE Team (
    Team_ID    NUMBER(10)      CONSTRAINT pk_team PRIMARY KEY,
    Team_Name  VARCHAR2(150)   NOT NULL,
    Leader_ID  NUMBER(10)      NOT NULL,
    Guide_ID   NUMBER(10)      NOT NULL,
    CONSTRAINT fk_team_leader FOREIGN KEY (Leader_ID)
        REFERENCES Student (Student_ID),
    CONSTRAINT fk_team_guide FOREIGN KEY (Guide_ID)
        REFERENCES Faculty (Faculty_ID)
);

-- ===========================================================================
-- 5. Team_Member (junction: Team <-> Student)
-- ===========================================================================
CREATE TABLE Team_Member (
    Team_ID     NUMBER(10)  NOT NULL,
    Student_ID  NUMBER(10)  NOT NULL,
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
    Project_ID        NUMBER(10)      CONSTRAINT pk_project PRIMARY KEY,
    Title             VARCHAR2(200)   NOT NULL,
    Abstract          CLOB,
    Academic_Year     VARCHAR2(9)     NOT NULL, -- e.g. '2025-2026'
    Team_ID           NUMBER(10)      NOT NULL,
    Status            VARCHAR2(30)    DEFAULT 'ONGOING'
                       CHECK (Status IN ('ONGOING', 'COMPLETED', 'SUBMITTED', 'REJECTED')),
    GitURL            VARCHAR2(300),
    Submission_Date   DATE,
    CONSTRAINT fk_project_team FOREIGN KEY (Team_ID)
        REFERENCES Team (Team_ID)
);

-- ===========================================================================
-- 7. Technology
-- ===========================================================================
CREATE TABLE Technology (
    Technology_ID    NUMBER(6)      CONSTRAINT pk_technology PRIMARY KEY,
    Technology_Name  VARCHAR2(100)  NOT NULL UNIQUE
);

-- ===========================================================================
-- 8. Project_Technology (junction: Project <-> Technology)
-- ===========================================================================
CREATE TABLE Project_Technology (
    Project_ID     NUMBER(10)  NOT NULL,
    Technology_ID  NUMBER(6)   NOT NULL,
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
    Domain_ID    NUMBER(6)      CONSTRAINT pk_domain PRIMARY KEY,
    Domain_Name  VARCHAR2(100)  NOT NULL UNIQUE
);

-- ===========================================================================
-- 10. Project_Domain (junction: Project <-> Domain)
-- ===========================================================================
CREATE TABLE Project_Domain (
    Project_ID  NUMBER(10)  NOT NULL,
    Domain_ID   NUMBER(6)   NOT NULL,
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
    Category_ID    NUMBER(6)      CONSTRAINT pk_category PRIMARY KEY,
    Category_Name  VARCHAR2(100)  NOT NULL UNIQUE
);

-- ===========================================================================
-- 12. Project_Category (junction: Project <-> Category)
-- ===========================================================================
CREATE TABLE Project_Category (
    Project_ID   NUMBER(10)  NOT NULL,
    Category_ID  NUMBER(6)   NOT NULL,
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
    Evaluation_ID     NUMBER(10)     CONSTRAINT pk_evaluation PRIMARY KEY,
    Project_ID        NUMBER(10)     NOT NULL,
    Faculty_ID        NUMBER(10)     NOT NULL,
    Score             NUMBER(5,2)    NOT NULL CHECK (Score BETWEEN 0 AND 100),
    Feedback          VARCHAR2(1000),
    Evaluation_Date   DATE           DEFAULT SYSDATE,
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
    Admin_ID   NUMBER(10)      CONSTRAINT pk_admin PRIMARY KEY,
    Name       VARCHAR2(100)   NOT NULL,
    Email      VARCHAR2(150)   NOT NULL UNIQUE,
    Password   VARCHAR2(255)   NOT NULL
);

COMMIT;
