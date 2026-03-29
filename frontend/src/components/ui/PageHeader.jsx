import { cn } from './utils.js';

export function PageHeader({ actions, children, className, eyebrow, subtitle, title }) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase text-emerald-700">{eyebrow}</p>}
        {title && <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">{title}</h1>}
        {subtitle && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

