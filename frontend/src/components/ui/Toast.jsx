import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { IconButton } from './IconButton.jsx';
import { cn } from './utils.js';

const variants = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
    borderClass: 'border-emerald-200',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-red-600',
    borderClass: 'border-red-200',
  },
  warning: {
    icon: TriangleAlert,
    iconClass: 'text-amber-600',
    borderClass: 'border-amber-200',
  },
  info: {
    icon: Info,
    iconClass: 'text-sky-600',
    borderClass: 'border-sky-200',
  },
};

export function Toast({
  action,
  children,
  className,
  description,
  onClose,
  title,
  variant = 'info',
}) {
  const config = variants[variant] || variants.info;
  const Icon = config.icon;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-xl',
        config.borderClass,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconClass)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-bold text-slate-900">{title}</p>}
        {description && <p className={cn('text-sm leading-5 text-slate-600', title && 'mt-1')}>{description}</p>}
        {children}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onClose && (
        <IconButton className="-mr-2 -mt-2" variant="ghost" size="sm" label="Dismiss notification" onClick={onClose}>
          <X className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      )}
    </div>
  );
}

export function ToastViewport({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-4 top-4 z-[120] flex flex-col items-end gap-3 sm:left-auto sm:w-full sm:max-w-sm',
        className,
      )}
      aria-live="polite"
      aria-label="Notifications"
      {...props}
    >
      {children}
    </div>
  );
}

