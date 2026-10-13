'use client';

import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Notice, Spinner } from '@/components/ui';
import { ApiError, type Role } from '@/lib/api';
import { useSession } from '@/lib/session';

// Seeded accounts from sql/seed.sql (all use password123, per the README).
const DEMO: Record<Role, { email: string; who: string }> = {
  student: { email: 'aarav.sharma@vit.edu', who: 'Aarav Sharma, leader of Byte Busters' },
  faculty: { email: 'rakesh.kumar@vit.edu', who: 'Dr. Rakesh Kumar, CSE' },
  admin: { email: 'admin@vit.edu', who: 'System Admin' },
};

// Decorative shelf: bindings in the four status colours.
const SPINES = [
  [150, 'var(--st-completed)'], [168, 'var(--st-submitted)'], [138, 'var(--st-ongoing)'], [176, 'var(--st-completed)'],
  [128, '#5f5b57'], [160, 'var(--st-completed)'], [146, 'var(--st-submitted)'], [170, 'var(--st-ongoing)'],
  [134, 'var(--st-completed)'], [156, 'var(--st-completed)'], [142, 'var(--st-submitted)'], [164, 'var(--st-ongoing)'],
] as const;

export default function LoginPage() {
  const { session, ready, signIn } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) router.replace('/desk');
  }, [ready, session, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) fe.email = 'Enter the email you registered with, like name@vit.edu.';
    if (!password) fe.password = 'Enter your password.';
    setFieldErr(fe);
    setError(null);
    if (Object.keys(fe).length) return;
    setBusy(true);
    try {
      await signIn(role, email.trim(), password);
      router.replace('/desk');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Sign-in failed. Try again.';
      setError(/Invalid email or password/.test(msg) ? `That email and password don't match a ${role} account. Check the role you picked.` : msg);
    } finally {
      setBusy(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO[role].email);
    setPassword('password123');
    setFieldErr({});
    setError(null);
  }

  return (
    <div className="login">
      <section className="login-cloth" aria-label="About PRO">
        <div className="wordmark">
          <b>PRO</b>
        </div>
        <div>
          <h1>Every final-year report, on one shelf.</h1>
          <p>
            The department&apos;s record of student projects. Teams register their work, guides evaluate it, and anyone can
            search past years by domain, technology, department or year.
          </p>
          <div className="login-shelf" aria-hidden>
            {SPINES.map(([h, c], i) => (
              <span key={i} style={{ height: `${Math.round((h / 180) * 100)}%`, background: c }} />
            ))}
          </div>
        </div>
      </section>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit} noValidate>
          <h2>Sign in</h2>
          <p>Pick your role, then use your institute email.</p>

          {error && <Notice>{error}</Notice>}

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="field" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>I am signing in as</legend>
            <div className="roles">
              {(['student', 'faculty', 'admin'] as Role[]).map((r) => (
                <label key={r}>
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
                  {r === 'student' ? 'Student' : r === 'faculty' ? 'Faculty' : 'Admin'}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
              aria-invalid={fieldErr.email ? true : undefined} aria-describedby={fieldErr.email ? 'email-err' : undefined} />
            {fieldErr.email && <span className="err" id="email-err"><AlertCircle size={14} aria-hidden style={{ marginTop: 2 }} />{fieldErr.email}</span>}
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

          <p className="demo">
            Reviewing the demo? The seeded {role} account is {DEMO[role].who}.{' '}
            <button type="button" onClick={fillDemo}>Fill in the {role} demo login</button>
          </p>
        </form>
      </div>
    </div>
  );
}
