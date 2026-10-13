'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { Role, Session } from './api';
import { authClient } from './authClient';

type Ctx = {
  session: Session | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<Session>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

type AuthUser = { name: string; email: string; role?: string; refId?: number | string };

function toSession(u: AuthUser | null | undefined): Session | null {
  if (!u?.role || u.refId === undefined) return null;
  return { id: Number(u.refId), name: u.name, email: u.email, role: u.role as Role };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data, isPending, refetch } = authClient.useSession();
  const session = useMemo(() => toSession(data?.user as AuthUser | undefined), [data]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data: res, error } = await authClient.signIn.email({ email, password });
      if (error) throw new Error(error.message || 'Sign-in failed.');
      await refetch();
      const s = toSession(res?.user as AuthUser | undefined);
      if (!s) throw new Error('This account is not linked to a student, faculty or admin record.');
      return s;
    },
    [refetch]
  );

  const signOut = useCallback(async () => {
    await authClient.signOut();
    await refetch();
  }, [refetch]);

  return <SessionContext.Provider value={{ session, ready: !isPending, signIn, signOut }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

export const ROLE_LABEL: Record<Role, string> = { student: 'Student', faculty: 'Faculty', admin: 'Admin' };
