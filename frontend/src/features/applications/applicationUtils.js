export const applicationStatuses = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'REVIEWING', label: 'Reviewing' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function formatApplicationDate(value) {
  if (!value) return 'Recently';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function statusVariant(status) {
  if (status === 'SHORTLISTED') return 'success';
  if (status === 'REJECTED') return 'danger';
  if (status === 'REVIEWING') return 'info';
  return 'warning';
}

export function statusLabel(status = '') {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
