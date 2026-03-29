import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './IconButton.jsx';
import { cn } from './utils.js';

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)]',
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Dialog({
  children,
  className,
  closeLabel = 'Close dialog',
  closeOnOverlay = true,
  description,
  footer,
  initialFocusRef,
  onClose,
  open,
  size = 'md',
  title,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef(null);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = requestAnimationFrame(() => {
      const target = initialFocusRef?.current || dialogRef.current?.querySelector(focusableSelector) || dialogRef.current;
      target?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll(focusableSelector)];
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [initialFocusRef, open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (closeOnOverlay && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'max-h-[min(90vh,800px)] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl outline-none',
          sizes[size] || sizes.md,
          className,
        )}
      >
        {(title || description || onClose) && (
          <DialogHeader>
            <div className="min-w-0">
              {title && <DialogTitle id={titleId}>{title}</DialogTitle>}
              {description && <DialogDescription id={descriptionId}>{description}</DialogDescription>}
            </div>
            {onClose && (
              <IconButton
                className="-mr-2 -mt-1"
                variant="ghost"
                size="sm"
                label={closeLabel}
                onClick={onClose}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </IconButton>
            )}
          </DialogHeader>
        )}
        <DialogBody>{children}</DialogBody>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </div>
    </div>,
    document.body,
  );
}

export const Modal = Dialog;

export function DialogHeader({ className, ...props }) {
  return <div className={cn('flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4', className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-bold text-slate-950', className)} {...props} />;
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn('mt-1 text-sm leading-5 text-slate-500', className)} {...props} />;
}

export function DialogBody({ className, ...props }) {
  return <div className={cn('max-h-[calc(min(90vh,800px)-8rem)] overflow-y-auto p-5', className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-5 py-4', className)} {...props} />;
}
