// Row shapes as the API returns them. server/db.ts upper-cases every column
// name (as the original Oracle version did), so the keys here are upper-case.

export type Status = 'ONGOING' | 'SUBMITTED' | 'COMPLETED' | 'REJECTED';
export const STATUSES: Status[] = ['ONGOING', 'SUBMITTED', 'COMPLETED', 'REJECTED'];

export type Department = { DEPARTMENT_ID: number; DEPARTMENT_NAME: string };

export type Student = {
  STUDENT_ID: number; NAME: string; EMAIL: string; DEPARTMENT_ID: number;
  YEAR: number; CREDITS: number | null; SCORE: number | null;
};

export type Faculty = {
  FACULTY_ID: number; NAME: string; EMAIL: string; DEPARTMENT_ID: number;
  DESIGNATION: string | null; SCORE: number | null;
};

export type Team = {
  TEAM_ID: number; TEAM_NAME: string; LEADER_ID: number; GUIDE_ID: number;
  LEADER_NAME: string; GUIDE_NAME: string;
};

export type TeamMember = { TEAM_ID: number; STUDENT_ID: number; TEAM_NAME: string; STUDENT_NAME: string };
export type TeamMemberDetail = { TEAM_ID: number; STUDENT_ID: number; NAME: string; EMAIL: string };

export type Project = {
  PROJECT_ID: number; TITLE: string; ABSTRACT: string | null; ACADEMIC_YEAR: string;
  TEAM_ID: number; STATUS: Status; GITURL: string | null; SUBMISSION_DATE: string | null; TEAM_NAME: string;
};

export type Technology = { TECHNOLOGY_ID: number; TECHNOLOGY_NAME: string };
export type Domain = { DOMAIN_ID: number; DOMAIN_NAME: string };
export type Category = { CATEGORY_ID: number; CATEGORY_NAME: string };

export type Evaluation = {
  EVALUATION_ID: number; PROJECT_ID: number; FACULTY_ID: number; SCORE: number;
  FEEDBACK: string | null; EVALUATION_DATE: string | null; PROJECT_TITLE: string; FACULTY_NAME: string;
};

export type ProjectEvaluation = {
  EVALUATION_ID: number; SCORE: number; FEEDBACK: string | null; EVALUATION_DATE: string | null;
  FACULTY_ID: number; FACULTY_NAME: string;
};

export type AverageScore = { EVALUATION_COUNT: number; AVERAGE_SCORE: number | null; MIN_SCORE: number | null; MAX_SCORE: number | null };

export type StudentProject = {
  PROJECT_ID: number; TITLE: string; ACADEMIC_YEAR: string; STATUS: Status; GITURL: string | null;
  SUBMISSION_DATE: string | null; TEAM_ID: number; TEAM_NAME: string;
};

export type GuidedTeam = { TEAM_ID: number; TEAM_NAME: string; LEADER_ID: number; LEADER_NAME: string };
