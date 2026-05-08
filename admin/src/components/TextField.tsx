import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({ id, label, error, className, ...props }: Props) {
  const inputId = id ?? label.replace(/\s+/g, '-').toLowerCase();
  return (
    <div className={clsx('flex flex-col gap-1 text-left', className)}>
      <label htmlFor={inputId} className="text-sm text-slate-300">
        {label}
      </label>
      <input
        id={inputId}
        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
        {...props}
      />
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
