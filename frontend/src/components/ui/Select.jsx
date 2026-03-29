import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './utils.js';

export const Select = forwardRef(function Select(
  { children, className, invalid = false, placeholder, options, ...props },
  ref,
) {
  return (
    <div className={cn('relative', className)}>
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'min-h-11 w-full appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10',
          'text-sm text-slate-900 shadow-sm outline-none transition-colors',
          'hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
          invalid && 'border-red-500 focus:border-red-600 focus:ring-red-600/20',
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options
          ? options.map((option) => {
              const normalized = Array.isArray(option)
                ? { value: option[0], label: option[1] }
                : option;
              return (
                <option key={normalized.value} value={normalized.value} disabled={normalized.disabled}>
                  {normalized.label}
                </option>
              );
            })
          : children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </div>
  );
});

