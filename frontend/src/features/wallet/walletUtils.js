export function formatMoney(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatTransactionDate(value) {
  if (!value) return 'Recently';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
