import { forwardRef } from 'react';
import { cn } from './utils.js';

export const Input = forwardRef(function Input(
  { className, inputClassName, startIcon: StartIcon, endAdornment, invalid = false, ...props },
  ref,
) {
  if (!StartIcon && !endAdornment) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm',
          'placeholder:text-slate-400 outline-none transition-colors',
          'hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          invalid && 'border-red-500 focus:border-red-600 focus:ring-red-600/20',
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <div className={cn('relative', className)}>
      {StartIcon && (
        <StartIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm',
          'placeholder:text-slate-400 outline-none transition-colors',
          'hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          StartIcon && 'pl-10',
          endAdornment && 'pr-10',
          invalid && 'border-red-500 focus:border-red-600 focus:ring-red-600/20',
          inputClassName,
        )}
        {...props}
      />
      {endAdornment && (
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">{endAdornment}</div>
      )}
    </div>
  );
});

