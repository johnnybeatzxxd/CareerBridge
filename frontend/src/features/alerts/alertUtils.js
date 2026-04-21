export const emptyAlert = {
  keyword: '',
  location: '',
  jobType: '',
  active: true,
};

export const alertJobTypes = [
  { value: '', label: 'Any job type' },
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

export function formatJobType(value) {
  if (!value) return 'Any job type';
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function alertTitle(alert) {
  return alert.keyword?.trim() || 'All opportunities';
}
