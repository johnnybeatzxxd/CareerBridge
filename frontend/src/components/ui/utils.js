export function cn(...values) {
  return values.flat(Infinity).filter(Boolean).join(' ');
}

export function humanize(value = '') {
  return String(value)
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

