import { cn, humanize } from './utils.js';

const variants = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
};

export function Badge({ children, className, dot = false, variant = 'neutral', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ring-1 ring-inset',
        variants[variant] || variants.neutral,
        className,
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

const successStatuses = ['active', 'approved', 'hired', 'open', 'published', 'shortlisted'];
const dangerStatuses = ['cancelled', 'closed', 'disabled', 'expired', 'rejected', 'suspended'];
const infoStatuses = ['interview', 'new', 'reviewing', 'screening'];

export function StatusBadge({ className, label, status = 'unknown', ...props }) {
  const normalized = String(status).toLowerCase();
  const variant = successStatuses.includes(normalized)
    ? 'success'
    : dangerStatuses.includes(normalized)
      ? 'danger'
      : infoStatuses.includes(normalized)
        ? 'info'
        : normalized === 'unknown'
          ? 'neutral'
          : 'warning';

  return (
    <Badge className={className} variant={variant} dot {...props}>
      {label || humanize(status)}
    </Badge>
  );
}
