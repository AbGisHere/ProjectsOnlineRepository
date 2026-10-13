// Which email addresses each role may use. Shared by the API (enforced) and
// the sign-up form (shown as hints), so the two can never disagree.

export type AccountRole = 'student' | 'faculty' | 'admin';

export const EMAIL_RULES: Record<AccountRole, { domain: string | null; hint: string }> = {
  student: { domain: 'vitstudent.ac.in', hint: 'Use your VIT student email, like name.surname2023@vitstudent.ac.in.' },
  faculty: { domain: 'vit.ac.in', hint: 'Use your VIT staff email, like name@vit.ac.in.' },
  admin: { domain: null, hint: 'Any valid email address.' },
};

/** Returns a message when `email` isn't allowed for `role`, otherwise null. */
export function emailRuleError(role: AccountRole, email: string): string | null {
  const domain = EMAIL_RULES[role].domain;
  if (!domain) return null;
  const at = email.trim().toLowerCase().split('@');
  if (at.length !== 2 || at[1] !== domain) {
    return role === 'student'
      ? 'Student accounts must use a @vitstudent.ac.in email.'
      : 'Faculty accounts must use a @vit.ac.in email.';
  }
  return null;
}

/** Guess the role an email belongs to from its domain (admins: any other domain). */
export function roleForEmail(email: string): AccountRole {
  const domain = email.trim().toLowerCase().split('@')[1];
  if (domain === EMAIL_RULES.student.domain) return 'student';
  if (domain === EMAIL_RULES.faculty.domain) return 'faculty';
  return 'admin';
}
