'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, readSession, writeSession, type Role, type Session } from './api';

type Ctx = {
  session: Session | null;
  ready: boolean;
  signIn: (role: Role, email: string, password: string) => Promise<Session>;
  signOut: () => void;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  const signIn = useCallback(async (role: Role, email: string, password: string) => {
    const data = await api.post<Omit<Session, 'role'> & { role: Role }>('/auth/login', { role, email, password });
    const s: Session = { id: Number(data.id), name: data.name, role: data.role, email: data.email, token: data.token };
    writeSession(s);
    setSession(s);
    return s;
  }, []);

  const signOut = useCallback(() => {
    writeSession(null);
    setSession(null);
  }, []);

  return <SessionContext.Provider value={{ session, ready, signIn, signOut }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

export const ROLE_LABEL: Record<Role, string> = { student: 'Student', faculty: 'Faculty', admin: 'Admin' };
