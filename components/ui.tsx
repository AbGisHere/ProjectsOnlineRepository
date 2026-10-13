'use client';

import { AlertCircle, Info, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { STATUS_LABEL } from '@/lib/format';
import type { Status } from '@/lib/types';

export function StatusTag({ s }: { s: Status }) {
  return (
    <span className="status" data-s={s}>
      <i aria-hidden />
      {STATUS_LABEL[s] ?? s}
    </span>
  );
}

export type Hue = 'project' | 'team' | 'people' | 'subject' | 'eval';
export const HUE_VAR: Record<Hue, string> = {
  project: 'var(--h-project)',
  team: 'var(--h-team)',
  people: 'var(--h-people)',
  subject: 'var(--h-subject)',
  eval: 'var(--h-eval)',
};

export function Chip({ hue, href, children, onRemove, removeLabel, onHover }: {
  hue: Hue; href?: string; children: ReactNode; onRemove?: () => void; removeLabel?: string;
  onHover?: (on: boolean) => void;
}) {
  const hover = onHover ? { onMouseEnter: () => onHover(true), onMouseLeave: () => onHover(false), onFocus: () => onHover(true), onBlur: () => onHover(false) } : {};
  if (href && !onRemove) {
    return <Link href={href} className={`chip chip-${hue}`} {...hover}>{children}</Link>;
  }
  return (
    <span className={`chip chip-${hue}`} {...hover}>
      {href ? <Link href={href} style={{ color: 'inherit', textDecoration: 'none' }}>{children}</Link> : children}
      {onRemove && (
        <button type="button" className="x" onClick={onRemove} aria-label={removeLabel ?? 'Remove'}>
          <X size={13} aria-hidden />
        </button>
      )}
    </span>
  );
}

export function Notice({ kind = 'error', children }: { kind?: 'error' | 'ok' | 'info'; children: ReactNode }) {
  const Icon = kind === 'error' ? AlertCircle : Info;
  return (
    <div className={`notice notice-${kind}`} role={kind === 'error' ? 'alert' : undefined}>
      <Icon size={16} aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function PageHead({ title, lede, hue, crumbs, actions }: {
  title: ReactNode; lede?: ReactNode; hue?: Hue; crumbs?: { href: string; label: string }[]; actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        {crumbs && (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={c.href} style={{ display: 'contents' }}>
                {i > 0 && <span aria-hidden>/</span>}
                <Link href={c.href}>{c.label}</Link>
              </span>
            ))}
          </nav>
        )}
        <h1>
          {hue && <span className="hue-mark" style={{ background: HUE_VAR[hue] }} aria-hidden />}
          {title}
        </h1>
        {lede && <p>{lede}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

/** Two-step delete: no modal, the button itself asks for confirmation. */
export function ConfirmDelete({ onConfirm, label = 'Delete', what }: { onConfirm: () => Promise<void> | void; label?: string; what: string }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!armed) return;
    confirmRef.current?.focus();
    const t = setTimeout(() => setArmed(false), 6000);
    return () => clearTimeout(t);
  }, [armed]);
  if (!armed) {
    return (
      <button type="button" className="btn btn-text danger" onClick={() => setArmed(true)} aria-label={`${label} ${what}`}>
        {label}
      </button>
    );
  }
  return (
    <span className="confirm">
      <button
        ref={confirmRef}
        type="button"
        className="btn btn-danger btn-sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try { await onConfirm(); } finally { setBusy(false); setArmed(false); }
        }}
        aria-label={`Confirm: ${label.toLowerCase()} ${what}`}
      >
        {busy ? <span className="spin" aria-hidden /> : <Trash2 size={13} aria-hidden />}
        Confirm
      </button>
      <button type="button" className="btn btn-text" onClick={() => setArmed(false)}>Cancel</button>
    </span>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function SkeletonRows({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="skeleton-row" aria-hidden>
          {Array.from({ length: cols }, (_, c) => (
            <td key={c}><span className="sk" style={{ width: `${40 + ((r * 7 + c * 13) % 50)}%` }} /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function Spinner() {
  return <span className="spin" aria-hidden />;
}
