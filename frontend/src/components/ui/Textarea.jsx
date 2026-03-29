import { forwardRef } from 'react';
import { cn } from './utils.js';

export const Textarea = forwardRef(function Textarea(
  { className, invalid = false, resize = 'vertical', ...props },
  ref,
) {
  const resizeClass = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  }[resize];

  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm',
        'placeholder:text-slate-400 outline-none transition-colors',
        'hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20',
        'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
        invalid && 'border-red-500 focus:border-red-600 focus:ring-red-600/20',
        resizeClass,
        className,
      )}
      {...props}
    />
  );
});

