export const emptyJobForm = {
  title: '',
  location: '',
  jobType: 'FULL_TIME',
  price: '',
  description: '',
  requirements: '',
  status: 'OPEN',
};

export const jobTypeOptions = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

export const jobStatusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
];

export function formatJobType(value = '') {
  return value.toLowerCase().split('_').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}
