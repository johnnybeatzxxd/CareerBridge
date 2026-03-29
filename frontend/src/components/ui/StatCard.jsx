import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from './Card.jsx';
import { cn } from './utils.js';

export function StatCard({
  className,
  description,
  icon: Icon,
  label,
  trend,
  trendLabel,
  value,
}) {
  const numericTrend = typeof trend === 'number' ? trend : null;
  const positive = numericTrend !== null && numericTrend >= 0;
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        {Icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
      {(description || trend !== undefined) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {numericTrend !== null && (
            <span className={cn('inline-flex items-center gap-1 font-semibold', positive ? 'text-emerald-700' : 'text-red-600')}>
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {Math.abs(numericTrend)}%
            </span>
          )}
          {typeof trend === 'string' && <span className="font-semibold text-slate-700">{trend}</span>}
          {(trendLabel || description) && <span className="text-slate-500">{trendLabel || description}</span>}
        </div>
      )}
    </Card>
  );
}

