import { forwardRef } from 'react';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { cn } from './utils.js';

export const DataTable = forwardRef(function DataTable({ className, containerClassName, ...props }, ref) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-slate-200 bg-white', containerClassName)}>
      <table ref={ref} className={cn('w-full border-collapse text-left', className)} {...props} />
    </div>
  );
});

export function DataTableHeader({ className, ...props }) {
  return <thead className={cn('bg-slate-50 text-xs uppercase text-slate-500', className)} {...props} />;
}

export function DataTableBody({ className, ...props }) {
  return <tbody className={cn('divide-y divide-slate-100', className)} {...props} />;
}

export function DataTableFooter({ className, ...props }) {
  return <tfoot className={cn('border-t border-slate-200 bg-slate-50 font-semibold text-slate-700', className)} {...props} />;
}

export function DataTableRow({ className, interactive = false, ...props }) {
  return (
    <tr
      className={cn(
        'transition-colors',
        interactive && 'hover:bg-slate-50 focus-within:bg-slate-50',
        className,
      )}
      {...props}
    />
  );
}

export function DataTableHead({ align = 'left', className, ...props }) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-4 py-3 font-bold',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...props}
    />
  );
}

export function DataTableCell({ align = 'left', className, ...props }) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-sm text-slate-700',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...props}
    />
  );
}

export function DataTableCaption({ className, ...props }) {
  return <caption className={cn('px-4 py-3 text-left text-sm text-slate-500', className)} {...props} />;
}

export function DataTableSortButton({
  children,
  className,
  direction,
  ...props
}) {
  const Icon = direction === 'asc' ? ChevronUp : direction === 'desc' ? ChevronDown : ChevronsUpDown;

  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-h-8 items-center gap-1 rounded px-1 text-left font-bold',
        'outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600',
        className,
      )}
      {...props}
    >
      {children}
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

export const Table = DataTable;
export const TableHeader = DataTableHeader;
export const TableBody = DataTableBody;
export const TableFooter = DataTableFooter;
export const TableRow = DataTableRow;
export const TableHead = DataTableHead;
export const TableCell = DataTableCell;
export const TableCaption = DataTableCaption;

