'use client';

import { LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROLE_LABEL, useSession } from '@/lib/session';

const NAV = [
  { href: '/desk', label: 'Desk' },
  { href: '/projects', label: 'Repository' },
  { href: '/teams', label: 'Teams' },
  { href: '/students', label: 'Students' },
  { href: '/faculty', label: 'Faculty' },
  { href: '/evaluations', label: 'Evaluations' },
  { href: '/subjects', label: 'Subjects' },
  { href: '/departments', label: 'Departments' },
  { href: '/ledger', label: 'Ledger' },
];

export function TopBar() {
  const { session, signOut } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const current = (href: string) => (pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined);
  const out = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <>
      <header className="bar">
        <Link href="/desk" className="wordmark" aria-label="PRO, Project Online Repository: go to your desk">
          <b>PRO</b>
          <span>Project Online Repository</span>
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={current(n.href)}>{n.label}</Link>
          ))}
        </nav>
        <div className="bar-end">
          {session && (
            <>
              <span className="stamp">{ROLE_LABEL[session.role]}</span>
              <span className="who">{session.name}</span>
              <button className="bar-btn" onClick={out}>
                <LogOut size={14} aria-hidden />
                Sign out
              </button>
            </>
          )}
          <button className="bar-btn menu-btn" aria-expanded={open} aria-controls="drawer" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
            Menu
          </button>
        </div>
      </header>
      <nav id="drawer" className="drawer" hidden={!open} aria-label="Main">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={current(n.href)}>{n.label}</Link>
        ))}
        {session && <p className="who-line">Signed in as {session.name} · {ROLE_LABEL[session.role]}</p>}
      </nav>
    </>
  );
}
