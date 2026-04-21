import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  FormField,
  Input,
  Select,
} from '../../components/ui/index.js';
import { alertJobTypes, emptyAlert } from './alertUtils.js';

export default function AlertFormDialog({ alert, open, saving, onClose, onSave }) {
  const [form, setForm] = useState(emptyAlert);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(alert ? { ...emptyAlert, ...alert } : emptyAlert);
      setValidationError('');
    }
  }, [alert, open]);

  function submit() {
    if (!form.keyword.trim() && !form.location.trim() && !form.jobType) {
      setValidationError('Add at least one keyword, location, or job type.');
      return;
    }
    onSave(form);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={alert?.id ? 'Edit job alert' : 'Create job alert'}
      description="Save a focused search and review its latest matching roles."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={saving} loadingText="Saving..." onClick={submit}>
            <Bell size={16} />
            {alert?.id ? 'Save changes' : 'Create alert'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {validationError && (
          <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{validationError}</div>
        )}
        <FormField label="Keyword" optional description="Job title, skill, or phrase.">
          <Input
            value={form.keyword}
            placeholder="Java developer"
            onChange={(event) => setForm({ ...form, keyword: event.target.value })}
          />
        </FormField>
        <FormField label="Location" optional>
          <Input
            value={form.location}
            placeholder="Addis Ababa or Remote"
            onChange={(event) => setForm({ ...form, location: event.target.value })}
          />
        </FormField>
        <FormField label="Job type" optional>
          <Select
            options={alertJobTypes}
            value={form.jobType}
            onChange={(event) => setForm({ ...form, jobType: event.target.value })}
          />
        </FormField>
        <label className="flex min-h-14 items-center justify-between border border-[#d8dfda] bg-[#f7f9f7] px-4">
          <span>
            <span className="block text-sm font-bold text-[#17211e]">Alert active</span>
            <span className="mt-1 block text-xs text-[#74807a]">Keep this saved search enabled.</span>
          </span>
          <input
            className="h-4 w-4 accent-emerald-700"
            type="checkbox"
            checked={form.active !== false}
            onChange={(event) => setForm({ ...form, active: event.target.checked })}
          />
        </label>
      </div>
    </Dialog>
  );
}
