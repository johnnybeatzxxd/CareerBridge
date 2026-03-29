import { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from './utils.js';

const variants = {
  primary: 'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
  outline: 'border border-emerald-700 bg-transparent text-emerald-800 hover:bg-emerald-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  link: 'min-h-0 bg-transparent p-0 text-emerald-700 underline-offset-4 hover:underline',
};

const sizes = {
  sm: 'min-h-8 px-3 text-xs',
  md: 'min-h-10 px-4 text-sm',
  lg: 'min-h-11 px-5 text-sm',
};

export const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition-colors',
        'outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant] || variants.primary,
        variant !== 'link' && (sizes[size] || sizes.md),
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
});

