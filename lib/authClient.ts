'use client';

import { createAuthClient } from 'better-auth/react';

// Same origin: the client talks to /api/auth/* on whatever address the page
// was opened on. Passing it explicitly stops the client from reading
// BETTER_AUTH_URL from the environment while pages are prerendered.
export const authClient = createAuthClient({
  baseURL: typeof window === 'undefined' ? 'http://localhost' : window.location.origin,
});
