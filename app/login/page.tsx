'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { AuthCloth } from '@/components/AuthCloth';
import { Notice, Spinner } from '@/components/ui';
import { roleForEmail } from '@/lib/emailRules';
import { ROLE_LABEL, useSession } from '@/lib/session';
import type { Role } from '@/lib/api';

// Seeded accounts from sql/seed.sql (all use password123, per the README).
const DEMO: Record<Role, { email: string; who: string }> = {
  student: { email: 'aarav.sharma@vitstudent.ac.in', who: 'Aarav Sharma, leader of Byte Busters' },
  faculty: { email: 'rakesh.kumar@vit.ac.in', who: 'Dr. Rakesh Kumar, CSE' },
  admin: { email: 'admin@vit.edu', who: 'System Admin' },
};

export default function LoginPage() {
  const { session, ready, signIn } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) router.replace('/desk');
  }, [ready, session, router]);

  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());
  const role = validEmail ? roleForEmail(email) : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!validEmail) fe.email = 'Enter the email you registered with.';
    if (!password) fe.password = 'Enter your password.';
    setFieldErr(fe);
    setError(null);
    if (Object.keys(fe).length) return;
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/desk');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(/invalid email or password/i.test(msg) || !msg ? "That email and password don't match an account." : msg);
    } finally {
      setBusy(false);
    }
  }

  function fillDemo(r: Role) {
    setEmail(DEMO[r].email);
    setPassword('password123');
    setFieldErr({});
    setError(null);
  }

  return (
    <div className="login">
      <AuthCloth />

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit} noValidate>
          <h2>Sign in</h2>
          <p>Students use their @vitstudent.ac.in email, faculty their @vit.ac.in email.</p>

          {error && <Notice>{error}</Notice>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
              aria-invalid={fieldErr.email ? true : undefined} aria-describedby={fieldErr.email ? 'email-err' : role ? 'email-role' : undefined} />
            {fieldErr.email ? (
              <span className="err" id="email-err"><AlertCircle size={14} aria-hidden style={{ marginTop: 2 }} />{fieldErr.email}</span>
            ) : role ? (
              <span className="hint" id="email-role">Signing in as <b>{ROLE_LABEL[role]}</b></span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
              aria-invalid={fieldErr.password ? true : undefined} aria-describedby={fieldErr.password ? 'pw-err' : undefined} />
            {fieldErr.password && <span className="err" id="pw-err"><AlertCircle size={14} aria-hidden style={{ marginTop: 2 }} />{fieldErr.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: 44 }} disabled={busy}>
            {busy && <Spinner />}
            Sign in
          </button>

          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            New to PRO? <Link href="/signup" style={{ color: 'var(--cloth)', fontWeight: 600 }}>Create an account</Link>
          </p>

          <div className="demo">
            Reviewing the demo? Seeded accounts use the password <span className="num">password123</span>. Fill in the{' '}
            {(['student', 'faculty', 'admin'] as Role[]).map((r, i) => (
              <span key={r}>
                {i > 0 && (i === 2 ? ' or ' : ', ')}
                <button type="button" onClick={() => fillDemo(r)} title={DEMO[r].who}>{r}</button>
              </span>
            ))}{' '}
            login.
          </div>
        </form>
      </div>
    </div>
  );
}
