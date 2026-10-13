// The bookcloth panel beside the sign-in and sign-up forms.

// Decorative shelf: bindings in the four status colours.
const SPINES = [
  [150, 'var(--st-completed)'], [168, 'var(--st-submitted)'], [138, 'var(--st-ongoing)'], [176, 'var(--st-completed)'],
  [128, '#5f5b57'], [160, 'var(--st-completed)'], [146, 'var(--st-submitted)'], [170, 'var(--st-ongoing)'],
  [134, 'var(--st-completed)'], [156, 'var(--st-completed)'], [142, 'var(--st-submitted)'], [164, 'var(--st-ongoing)'],
] as const;

export function AuthCloth() {
  return (
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
  );
}
