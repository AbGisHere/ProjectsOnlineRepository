import type { FieldDef, FormValues } from '@/components/EntityForm';
import { isoDate, STATUS_LABEL } from './format';
import { STATUSES, type Project, type Team } from './types';

export function projectFields(teams: Team[]): FieldDef[] {
  return [
    { name: 'project_id', label: 'Project ID', type: 'int', required: true, createOnly: true, hint: 'Next free ID is filled in for you.' },
    { name: 'academic_year', label: 'Academic year', required: true, placeholder: '2025-2026', hint: 'Written as YYYY-YYYY.' },
    { name: 'title', label: 'Title', required: true, wide: true },
    { name: 'team_id', label: 'Team', type: 'select', required: true, options: teams.map((t) => ({ value: t.TEAM_ID, label: `${t.TEAM_NAME} (#${t.TEAM_ID})` })) },
    { name: 'status', label: 'Status', type: 'select', required: true, options: STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })) },
    { name: 'abstract', label: 'Abstract', type: 'textarea', placeholder: 'What the project does and how, in two or three sentences.' },
    { name: 'git_url', label: 'Repository URL', type: 'url', placeholder: 'https://github.com/…', wide: true },
    { name: 'submission_date', label: 'Submission date', type: 'date' },
  ];
}

export function currentAcademicYear(d = new Date()): string {
  // Indian academic years start in July.
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-${y + 1}`;
}

export function projectToForm(p: Project): FormValues {
  return {
    project_id: String(p.PROJECT_ID),
    title: p.TITLE,
    abstract: p.ABSTRACT ?? '',
    academic_year: p.ACADEMIC_YEAR,
    team_id: String(p.TEAM_ID),
    status: p.STATUS,
    git_url: p.GITURL ?? '',
    submission_date: isoDate(p.SUBMISSION_DATE),
  };
}
