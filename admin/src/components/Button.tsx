import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

export function Button({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50',
        variant === 'primary' &&
          'bg-violet-600 text-white hover:bg-violet-500 focus-visible:outline-violet-500',
        variant === 'ghost' &&
          'border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900 focus-visible:outline-slate-500',
        variant === 'danger' &&
          'bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-500',
        className,
      )}
      {...props}
    />
  );
}
