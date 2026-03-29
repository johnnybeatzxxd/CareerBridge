import { forwardRef } from 'react';
import { cn } from './utils.js';

export const Card = forwardRef(function Card({ as: Component = 'section', className, ...props }, ref) {
  return (
    <Component
      ref={ref}
      className={cn('rounded-lg border border-slate-200 bg-white shadow-sm', className)}
      {...props}
    />
  );
});

export const Panel = forwardRef(function Panel({ className, ...props }, ref) {
  return <Card ref={ref} className={cn('p-5', className)} {...props} />;
});

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex items-start justify-between gap-4 border-b border-slate-100 p-5', className)} {...props} />;
}

export function CardTitle({ as: Component = 'h2', className, ...props }) {
  return <Component className={cn('text-base font-bold text-slate-950', className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('mt-1 text-sm text-slate-500', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center justify-end gap-2 border-t border-slate-100 p-5', className)} {...props} />;
}

