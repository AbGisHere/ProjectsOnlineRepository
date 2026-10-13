import type { Hue } from '@/components/ui';

// The 13 tables from the brief, in schema order, each with the endpoint that
// lists it and the screen that manages it.
export const TABLES: { table: string; path: string; screen: string; hue: Hue; kind: 'entity' | 'junction' }[] = [
  { table: 'Department', path: '/departments', screen: '/departments', hue: 'people', kind: 'entity' },
  { table: 'Student', path: '/students', screen: '/students', hue: 'people', kind: 'entity' },
  { table: 'Faculty', path: '/faculty', screen: '/faculty', hue: 'people', kind: 'entity' },
  { table: 'Team', path: '/teams', screen: '/teams', hue: 'team', kind: 'entity' },
  { table: 'Team_Member', path: '/team-members', screen: '/teams', hue: 'team', kind: 'junction' },
  { table: 'Project', path: '/projects', screen: '/projects', hue: 'project', kind: 'entity' },
  { table: 'Technology', path: '/technologies', screen: '/subjects?tab=technologies', hue: 'subject', kind: 'entity' },
  { table: 'Project_Technology', path: '/technologies/links/all', screen: '/subjects?tab=technologies', hue: 'subject', kind: 'junction' },
  { table: 'Domain', path: '/domains', screen: '/subjects?tab=domains', hue: 'subject', kind: 'entity' },
  { table: 'Project_Domain', path: '/domains/links/all', screen: '/subjects?tab=domains', hue: 'subject', kind: 'junction' },
  { table: 'Category', path: '/categories', screen: '/subjects?tab=categories', hue: 'subject', kind: 'entity' },
  { table: 'Project_Category', path: '/categories/links/all', screen: '/subjects?tab=categories', hue: 'subject', kind: 'junction' },
  { table: 'Evaluation', path: '/evaluations', screen: '/evaluations', hue: 'eval', kind: 'entity' },
];
