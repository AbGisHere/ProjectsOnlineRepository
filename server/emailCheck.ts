import { emailRuleError, type AccountRole } from '@/lib/emailRules';
import { ApiError } from './errors';

/** 400 in the API's validation shape when an email breaks the role's domain rule. */
export function checkEmailRule(role: AccountRole, email: unknown) {
  if (email === undefined) return;
  const message = emailRuleError(role, String(email));
  if (message) throw new ApiError(400, 'Validation failed', [{ field: 'email', message }]);
}
