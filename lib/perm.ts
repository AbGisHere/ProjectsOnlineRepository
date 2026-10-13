// UI-level role gating. The API itself only guards two DELETE routes, so
// this decides what each role is offered, not what the server enforces.
import type { Session } from './api';

export const isAdmin = (s: Session | null) => s?.role === 'admin';
export const isFaculty = (s: Session | null) => s?.role === 'faculty';
export const isStudent = (s: Session | null) => s?.role === 'student';
