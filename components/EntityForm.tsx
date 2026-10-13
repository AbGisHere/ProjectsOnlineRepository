'use client';

import { AlertCircle, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '@/lib/api';
import { Notice, Spinner } from './ui';

export type FieldDef = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'int' | 'decimal' | 'select' | 'textarea' | 'date' | 'url';
  required?: boolean;
  options?: { value: string | number; label: string }[];
  hint?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  /** Only shown when creating (e.g. hand-entered primary keys, passwords). */
  createOnly?: boolean;
  /** Shown but locked when editing. */
  lockOnEdit?: boolean;
  wide?: boolean;
};

export type FormValues = Record<string, string>;

/** Turn form strings into the JSON body the API validators expect. */
export function toBody(fields: FieldDef[], values: FormValues, mode: 'create' | 'edit') {
  const body: Record<string, unknown> = {};
  for (const f of fields) {
    if (mode === 'edit' && (f.createOnly || f.lockOnEdit)) continue;
    const raw = (values[f.name] ?? '').trim();
    if (raw === '') {
      if (f.required) body[f.name] = raw; // let the API report it
      continue;
    }
    if (f.type === 'int') body[f.name] = Number.isNaN(Number(raw)) ? raw : parseInt(raw, 10);
    else if (f.type === 'decimal') body[f.name] = Number.isNaN(Number(raw)) ? raw : Number(raw);
    else if (f.type === 'select' && f.options?.length && typeof f.options[0].value === 'number') body[f.name] = Number(raw);
    else body[f.name] = raw;
  }
  return body;
}

function clientCheck(fields: FieldDef[], values: FormValues, mode: 'create' | 'edit'): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const f of fields) {
    if (mode === 'edit' && f.createOnly) continue;
    const v = (values[f.name] ?? '').trim();
    if (f.required && !v) {
      errs[f.name] = `${f.label} is required.`;
      continue;
    }
    if (!v) continue;
    if ((f.type === 'int' || f.type === 'decimal') && Number.isNaN(Number(v))) errs[f.name] = `${f.label} must be a number.`;
    else if (f.type === 'int' && !Number.isInteger(Number(v))) errs[f.name] = `${f.label} must be a whole number.`;
    else if (f.min !== undefined && Number(v) < f.min) errs[f.name] = `${f.label} must be at least ${f.min}.`;
    else if (f.max !== undefined && Number(v) > f.max) errs[f.name] = `${f.label} must be at most ${f.max}.`;
    else if (f.type === 'password' && v.length < 6) errs[f.name] = 'Use at least 6 characters.';
    else if (f.type === 'url' && !/^https?:\/\/\S+\.\S+/.test(v)) errs[f.name] = 'Enter a full URL, starting with https://.';
  }
  return errs;
}

export function EntityForm({
  title, subtitle, fields, initial, mode, submitLabel, onSubmit, onCancel,
}: {
  title: string;
  subtitle?: string;
  fields: FieldDef[];
  initial: FormValues;
  mode: 'create' | 'edit';
  submitLabel: string;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const uid = useId();
  const firstRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setValues(initial);
    setErrors({});
    setGeneral(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initial)]);

  useEffect(() => {
    headRef.current?.focus();
  }, [title]);

  const visible = fields.filter((f) => !(mode === 'edit' && f.createOnly));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const local = clientCheck(fields, values, mode);
    setErrors(local);
    setGeneral(null);
    if (Object.keys(local).length) {
      setGeneral('Some fields need attention.');
      return;
    }
    setBusy(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setGeneral(err.message);
      } else {
        setGeneral('Something went wrong. Try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="sheet panel" onSubmit={submit} noValidate aria-labelledby={`${uid}-h`}>
      <div className="panel-head">
        <div>
          <h2 id={`${uid}-h`} ref={headRef} tabIndex={-1} style={{ outline: 'none' }}>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="Close form">
          <X size={18} aria-hidden />
        </button>
      </div>
      <div className="panel-body">
        {general && <Notice>{general}</Notice>}
        <div className="form-grid">
          {visible.map((f, i) => {
            const id = `${uid}-${f.name}`;
            const err = errors[f.name];
            const locked = mode === 'edit' && f.lockOnEdit;
            const common = {
              id,
              name: f.name,
              value: values[f.name] ?? '',
              'aria-invalid': err ? true : undefined,
              'aria-describedby': err ? `${id}-err` : f.hint ? `${id}-hint` : undefined,
              disabled: locked || busy,
              onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [f.name]: e.target.value })),
              ref: i === 0 ? (el: HTMLElement | null) => { firstRef.current = el; } : undefined,
            };
            const wide = f.wide || f.type === 'textarea';
            return (
              <div className={`field${wide ? ' wide' : ''}`} key={f.name}>
                <label htmlFor={id}>
                  {f.label}
                  {f.required && !locked && <span className="req" aria-hidden>*</span>}
                </label>
                {f.type === 'select' ? (
                  <select className="select" {...common} required={f.required}>
                    <option value="">{f.required ? 'Choose…' : 'None'}</option>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea className="textarea" {...common} placeholder={f.placeholder} />
                ) : (
                  <input
                    className={`input${f.type === 'int' || f.type === 'decimal' ? ' num' : ''}`}
                    {...common}
                    required={f.required}
                    placeholder={f.placeholder}
                    type={f.type === 'int' || f.type === 'decimal' ? 'text' : f.type === 'url' ? 'url' : f.type ?? 'text'}
                    inputMode={f.type === 'int' ? 'numeric' : f.type === 'decimal' ? 'decimal' : undefined}
                    autoComplete={f.type === 'password' ? 'new-password' : f.type === 'email' ? 'off' : undefined}
                  />
                )}
                {err ? (
                  <span className="err" id={`${id}-err`}><AlertCircle size={14} aria-hidden style={{ marginTop: 2, flex: 'none' }} />{err}</span>
                ) : f.hint ? (
                  <span className="hint" id={`${id}-hint`}>{f.hint}</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="panel-foot">
        <button type="button" className="btn btn-quiet" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy && <Spinner />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
