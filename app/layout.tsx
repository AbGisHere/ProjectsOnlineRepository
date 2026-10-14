import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next, Libre_Caslon_Display } from 'next/font/google';
import { SessionProvider } from '@/lib/session';
import { ToastProvider } from '@/components/Toast';
import './globals.css';

const ui = Atkinson_Hyperlegible_Next({ subsets: ['latin'], variable: '--font-atkinson', weight: ['400', '500', '600', '700'] });
const mono = Atkinson_Hyperlegible_Mono({ subsets: ['latin'], variable: '--font-atkinson-mono', weight: ['400', '600'] });
const foil = Libre_Caslon_Display({ subsets: ['latin'], variable: '--font-caslon', weight: '400' });

export const metadata: Metadata = {
  title: { default: 'PRO — Project Online Repository', template: '%s · PRO' },
  description: 'The department record of student projects: teams, guides, technologies, domains and evaluations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ui.variable} ${mono.variable} ${foil.variable}`}>
      <body>
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
