import { SearchX } from 'lucide-react';
import { cn } from './utils.js';

export function EmptyState({
  action,
  children,
  className,
  compact = false,
  description,
  icon: Icon = SearchX,
  title = 'Nothing here yet',
}) {
  return (
    <div
      className={cn(
        'grid place-items-center px-5 text-center',
        compact ? 'min-h-48 py-8' : 'min-h-72 py-12',
        className,
      )}
    >
      <div className="max-w-md">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-base font-bold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
        {children}
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

