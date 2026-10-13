'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { useSession } from '@/lib/session';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, ready } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace('/login');
  }, [ready, session, router]);

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <TopBar />
      <main id="main" className="page">
        {ready && session ? children : null}
      </main>
    </>
  );
}
