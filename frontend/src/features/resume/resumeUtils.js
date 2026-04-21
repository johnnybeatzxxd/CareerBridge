export const emptyResume = {
  headline: '',
  summary: '',
  skills: '',
  experience: '',
  education: '',
  fileName: '',
  filePath: '',
  updatedAt: '',
};

export function formatUpdatedAt(value) {
  if (!value || value === 'null') return 'Not saved yet';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return 'Recently updated';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function splitSkills(value = '') {
  return value
    .split(/,|\n/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function renderTemplate(template, user, resume) {
  if (!template?.body) return '';
  return template.body
    .replaceAll('\\n', '\n')
    .replaceAll('{{name}}', user?.name || '')
    .replaceAll('{{headline}}', resume.headline || '')
    .replaceAll('{{summary}}', resume.summary || '')
    .replaceAll('{{skills}}', resume.skills || '')
    .replaceAll('{{experience}}', resume.experience || '')
    .replaceAll('{{education}}', resume.education || '');
}
