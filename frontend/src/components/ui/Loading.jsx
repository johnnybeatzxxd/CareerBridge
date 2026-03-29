import { LoaderCircle } from 'lucide-react';
import { cn } from './utils.js';

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ className, label = 'Loading', size = 'md' }) {
  return (
    <span role="status" className={cn('inline-flex items-center justify-center text-emerald-700', className)}>
      <LoaderCircle className={cn('animate-spin', spinnerSizes[size] || spinnerSizes.md)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function LoadingBlock({ className, label = 'Loading content' }) {
  return (
    <div className={cn('grid min-h-48 place-items-center', className)}>
      <Spinner label={label} />
    </div>
  );
}

