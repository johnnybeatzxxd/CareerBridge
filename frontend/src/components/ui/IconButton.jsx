import { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from './utils.js';

const variants = {
  default: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950',
  ghost: 'border-transparent bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-950',
  danger: 'border-transparent bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700',
};

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
};

export const IconButton = forwardRef(function IconButton(
  {
    children,
    className,
    label,
    title,
    variant = 'default',
    size = 'md',
    loading = false,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  const accessibleLabel = label || title;

  return (
    <button
      ref={ref}
      type={type}
      aria-label={accessibleLabel}
      title={title || label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-md border transition-colors',
        'outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : children}
    </button>
  );
});

