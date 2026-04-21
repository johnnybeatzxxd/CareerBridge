import { BriefcaseBusiness } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Dialog, FormField, Input, Select, Textarea } from '../../components/ui/index.js';
import { emptyJobForm, jobStatusOptions, jobTypeOptions } from './jobForm.js';

export default function JobFormDialog({ job, open, saving, onClose, onSave }) {
  const [form, setForm] = useState(emptyJobForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(job ? { ...emptyJobForm, ...job } : emptyJobForm);
      setErrors({});
    }
  }, [job, open]);

  function submit() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Job title is required';
    if (!form.location.trim()) nextErrors.location = 'Location is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) onSave(form);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={job?.id ? 'Edit job post' : 'Create job post'}
      description="Publish a clear opportunity with enough detail for candidates to make an informed decision."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={saving} onClick={submit}><BriefcaseBusiness size={16} />{job?.id ? 'Save changes' : 'Publish job'}</Button></>}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Job title" required error={errors.title}>
          <Input value={form.title} placeholder="Senior Java Engineer" onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </FormField>
        <FormField label="Location" required error={errors.location}>
          <Input value={form.location} placeholder="Addis Ababa or Remote" onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </FormField>
        <FormField label="Job type">
          <Select options={jobTypeOptions} value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} />
        </FormField>
        <FormField label="Salary" optional>
          <Input value={form.salary || ''} placeholder="ETB 70,000 - 100,000" onChange={(e) => setForm({ ...form, salary: e.target.value })} />
        </FormField>
        {job?.id && <FormField label="Status"><Select options={jobStatusOptions} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} /></FormField>}
        <FormField className="sm:col-span-2" label="Description" required error={errors.description}>
          <Textarea className="min-h-40" value={form.description} placeholder="Describe the role, responsibilities, and impact." onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </FormField>
        <FormField className="sm:col-span-2" label="Requirements" optional>
          <Textarea className="min-h-36" value={form.requirements || ''} placeholder="List skills, experience, and qualifications." onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
        </FormField>
      </div>
    </Dialog>
  );
}
