import { Children, cloneElement, isValidElement, useId } from 'react';
import { cn } from './utils.js';

export function FormField({
  children,
  className,
  description,
  error,
  id,
  label,
  optional = false,
  required = false,
}) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  const control = Children.count(children) === 1 && isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || controlId,
        required: children.props.required ?? required,
        invalid: children.props.invalid ?? Boolean(error),
        'aria-describedby': [children.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
      })
    : children;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={controlId} className="block text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}
          {optional && <span className="ml-1 font-normal text-slate-400">(optional)</span>}
        </label>
      )}
      {control}
      {description && !error && (
        <p id={descriptionId} className="text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium leading-5 text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

