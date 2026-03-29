import { useState } from 'react';
import { cn } from './utils.js';

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

function getInitials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';
}

export function Avatar({
  alt,
  className,
  fallback,
  name = '',
  size = 'md',
  src,
  status,
}) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800',
        sizes[size] || sizes.md,
        className,
      )}
      title={name || alt}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? name}
          className="h-full w-full rounded-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden={Boolean(name)}>{fallback || getInitials(name)}</span>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white',
            status === 'online' ? 'bg-emerald-500' : status === 'busy' ? 'bg-red-500' : 'bg-slate-400',
          )}
          title={status}
        />
      )}
    </span>
  );
}

