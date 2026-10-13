'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { STATUS_LABEL } from '@/lib/format';
import { STATUSES, type Project } from '@/lib/types';
import { StatusTag } from './ui';

type ShelfProject = Pick<Project, 'PROJECT_ID' | 'TITLE' | 'ACADEMIC_YEAR' | 'STATUS'> & { TEAM_NAME?: string };

// Stable per-title spine height, so the shelf doesn't reshuffle on reload.
function spineHeight(title: string, max: number) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return Math.round(max * (0.72 + ((h % 1000) / 1000) * 0.28));
}

export function Shelf({
  projects, title = 'The shelf', lit, onHover, maxHeight = 196, emptyText = 'No reports on this shelf yet.',
}: {
  projects: ShelfProject[] | undefined;
  title?: string;
  lit?: Set<number> | null;
  onHover?: (id: number | null) => void;
  maxHeight?: number;
  emptyText?: string;
}) {
  const years = useMemo(() => {
    const map = new Map<string, ShelfProject[]>();
    for (const p of projects ?? []) {
      const list = map.get(p.ACADEMIC_YEAR) ?? [];
      list.push(p);
      map.set(p.ACADEMIC_YEAR, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [projects]);

  const dimming = !!lit && lit.size > 0;

  return (
    <section className="sheet shelf" aria-labelledby="shelf-h">
      <div className="shelf-head">
        <h2 id="shelf-h">{title}</h2>
        <div className="legend" aria-label="Binding colours">
          {STATUSES.map((s) => <StatusTag key={s} s={s} />)}
        </div>
      </div>
      {!projects ? (
        <div className="shelf-empty" aria-busy="true"><span className="sk" style={{ width: 180 }} /></div>
      ) : years.length === 0 ? (
        <div className="shelf-empty">{emptyText}</div>
      ) : (
        <div className="shelf-scroll" tabIndex={0} role="region" aria-label={`${title}, scrollable`}>
          <div className="shelf-run">
            {years.map(([year, list]) => (
              <div className="shelf-year" key={year}>
                <ul className={`spines${dimming ? ' dimming' : ''}`} style={{ listStyle: 'none', margin: 0, height: maxHeight + 8 }} aria-label={`Academic year ${year}`}>
                  {list.map((p) => (
                    <li key={p.PROJECT_ID} style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                      <Link
                        href={`/projects/${p.PROJECT_ID}`}
                        className="spine"
                        data-s={p.STATUS}
                        data-lit={lit?.has(p.PROJECT_ID) ? 'true' : undefined}
                        style={{ height: spineHeight(p.TITLE, maxHeight) }}
                        title={`${p.TITLE} (${STATUS_LABEL[p.STATUS]}, ${p.ACADEMIC_YEAR})`}
                        aria-label={`${p.TITLE}, ${STATUS_LABEL[p.STATUS]}, ${p.ACADEMIC_YEAR}`}
                        onMouseEnter={() => onHover?.(p.PROJECT_ID)}
                        onMouseLeave={() => onHover?.(null)}
                        onFocus={() => onHover?.(p.PROJECT_ID)}
                        onBlur={() => onHover?.(null)}
                      >
                        <span className="spine-title">{p.TITLE}</span>
                        <span className="spine-id">{String(p.PROJECT_ID).slice(-3)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="shelf-ledge" aria-hidden />
                <div className="shelf-label">
                  <span className="num">{year}</span>
                  <span>{list.length} {list.length === 1 ? 'report' : 'reports'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
