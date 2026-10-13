'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { AuthCloth } from '@/components/AuthCloth';
import { Notice, Spinner } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { EMAIL_RULES, emailRuleError } from '@/lib/emailRules';
import { useApi } from '@/lib/hooks';
import { useSession } from '@/lib/session';
import type { Department } from '@/lib/types';

type SignupRole = 'student' | 'faculty';

export default function SignupPage() {
  const { session, ready, signIn } = useSession();
  const router = useRouter();
  const depts = useApi<Department[]>('/departments');

  const [role, setRole] = useState<SignupRole>('student');
  const [v, setV] = useState({ id: '', name: '', email: '', password: '', department_id: '', year: '1', designation: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) router.replace('/desk');
  }, [ready, session, router]);

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }));

  function check() {
    const e: Record<string, string> = {};
    if (!/^\d+$/.test(v.id)) e.id = `Enter your ${role === 'student' ? 'student' : 'faculty'} ID as a number.`;
    if (!v.name.trim()) e.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = EMAIL_RULES[role].hint;
    else {
      const rule = emailRuleError(role, v.email);
      if (rule) e.email = rule;
    }
    if (v.password.length < 6) e.password = 'Use at least 6 characters.';
    if (!v.department_id) e.department_id = 'Choose your department.';
    if (role === 'student' && !/^[1-5]$/.test(v.year)) e.year = 'Year must be between 1 and 5.';
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = check();
    setErrors(e);
    setGeneral(null);
    if (Object.keys(e).length) {
      setGeneral('Some fields need attention.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/auth/register', {
        role,
        id: Number(v.id),
        name: v.name.trim(),
        email: v.email.trim(),
        password: v.password,
        department_id: Number(v.department_id),
        ...(role === 'student' ? { year: Number(v.year) } : { designation: v.designation.trim() || undefined }),
      });
      await signIn(v.email.trim(), v.password);
      router.replace('/desk');
    } catch (err) {
      if (err instanceof ApiError) {
        const fe = err.fieldErrors;
        setErrors(fe);
        setGeneral(/already exists/.test(err.message) ? 'An account with this ID or email already exists. Try signing in instead.' : err.message);
      } else {
        setGeneral(err instanceof Error ? err.message : 'Sign-up failed. Try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  const field = (k: string, label: string, input: ReactNode, hint?: string) => (
    <div className="field">
      <label htmlFor={k}>{label}</label>
      {input}
      {errors[k] ? (
        <span className="err" id={`${k}-err`}><AlertCircle size={14} aria-hidden style={{ marginTop: 2, flex: 'none' }} />{errors[k]}</span>
      ) : hint ? (
        <span className="hint" id={`${k}-hint`}>{hint}</span>
      ) : null}
    </div>
  );
  const aria = (k: string, hint?: boolean) => ({
    id: k,
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `${k}-err` : hint ? `${k}-hint` : undefined,
  });

  return (
    <div className="login">
      <AuthCloth />
      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit} noValidate>
          <h2>Create your account</h2>
          <p>For students and faculty of VIT. Admin accounts are created by the department.</p>

          {general && <Notice>{general}</Notice>}

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>I am a</legend>
            <div className="roles" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {(['student', 'faculty'] as SignupRole[]).map((r) => (
                <label key={r}>
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => { setRole(r); setErrors({}); }} />
                  {r === 'student' ? 'Student' : 'Faculty'}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-grid">
            {field('id', role === 'student' ? 'Student ID' : 'Faculty ID', <input className="input num" inputMode="numeric" value={v.id} onChange={set('id')} {...aria('id')} />)}
            {field('department_id', 'Department', (
              <select className="select" value={v.department_id} onChange={set('department_id')} {...aria('department_id')}>
                <option value="">{depts.loading ? 'Loading…' : 'Choose…'}</option>
                {(depts.data ?? []).map((d) => <option key={d.DEPARTMENT_ID} value={d.DEPARTMENT_ID}>{d.DEPARTMENT_NAME}</option>)}
              </select>
            ))}
          </div>
          {field('name', 'Full name', <input className="input" autoComplete="name" value={v.name} onChange={set('name')} {...aria('name')} />)}
          {field('email', 'Email', <input className="input" type="email" autoComplete="email" value={v.email} onChange={set('email')} {...aria('email', true)} />, EMAIL_RULES[role].hint)}
          <div className="form-grid">
            {role === 'student'
              ? field('year', 'Year of study', (
                  <select className="select" value={v.year} onChange={set('year')} {...aria('year')}>
                    {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                ))
              : field('designation', 'Designation', <input className="input" placeholder="Assistant Professor" value={v.designation} onChange={set('designation')} {...aria('designation')} />)}
            {field('password', 'Password', <input className="input" type="password" autoComplete="new-password" value={v.password} onChange={set('password')} {...aria('password', true)} />, 'At least 6 characters.')}
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: 44 }} disabled={busy}>
            {busy && <Spinner />}
            Create account
          </button>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Already registered? <Link href="/login" style={{ color: 'var(--cloth)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
