'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '@/lib/session';

export default function Home() {
  const { session, ready } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (ready) router.replace(session ? '/desk' : '/login');
  }, [ready, session, router]);
  return null;
}
