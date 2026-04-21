import {
  CheckCircle2,
  Download,
  FileText,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Button,
  FormField,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Textarea,
} from '../../components/ui/index.js';
import { useAuth } from '../auth/index.js';
import DeleteResumeDialog from './DeleteResumeDialog.jsx';
import ResumePreview from './ResumePreview.jsx';
import { formatUpdatedAt } from './resumeUtils.js';
import { useResume } from './useResume.js';

export default function ResumePage() {
  const { user } = useAuth();
  const {
    resume,
    setResume,
    templates,
    loading,
    error,
    save,
    upload,
    remove,
    download,
  } = useResume();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (templates.length && !selectedTemplateId) {
      setSelectedTemplateId(String(templates[0].id));
    }
  }, [templates, selectedTemplateId]);

  if (user.role !== 'JOB_SEEKER') return <Navigate to="/dashboard" replace />;

  const selectedTemplate = templates.find((template) => String(template.id) === selectedTemplateId);

  function update(field, value) {
    setResume((current) => ({ ...current, [field]: value }));
    setNotice('');
  }

  async function saveResume() {
    setSaving(true);
    setActionError('');
    try {
      await save(resume);
      setNotice('Resume saved successfully.');
    } catch (requestError) {
      setActionError(requestError.message || 'Unable to save resume');
    } finally {
      setSaving(false);
    }
  }

  async function uploadResume(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setActionError('');
    try {
      await upload(file);
      setNotice(`${file.name} uploaded successfully.`);
    } catch (requestError) {
      setActionError(requestError.message || 'Unable to upload file');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function downloadResume() {
    setActionError('');
    try {
      const content = await download();
      const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.name.toLowerCase().replaceAll(' ', '-')}-resume.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setActionError(requestError.message || 'Unable to download resume');
    }
  }

  async function deleteResume() {
    setDeleting(true);
    setActionError('');
    try {
      await remove();
      setDeleteOpen(false);
      setNotice('Resume profile deleted.');
    } catch (requestError) {
      setActionError(requestError.message || 'Unable to delete resume');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <ResumeSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Job seeker workspace"
        title="Resume builder"
        subtitle="Create one focused resume profile and keep it ready for every application."
        actions={
          <>
            <Button variant="secondary" onClick={downloadResume}>
              <Download size={16} />
              Download
            </Button>
            <Button loading={saving} loadingText="Saving..." onClick={saveResume}>
              <Save size={16} />
              Save resume
            </Button>
          </>
        }
      />

      {(error || actionError) && (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || actionError}</div>
      )}
      {notice && (
        <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_520px]">
        <section className="border border-[#d8dfda] bg-white">
          <div className="border-b border-[#e5e9e6] px-6 py-5">
            <h2 className="font-bold text-[#17211e]">Resume content</h2>
            <p className="mt-1 text-xs text-[#7a8580]">Last updated: {formatUpdatedAt(resume.updatedAt)}</p>
          </div>
          <div className="space-y-6 p-6">
            <FormField label="Professional headline" required>
              <Input
                value={resume.headline || ''}
                placeholder="Senior Java Developer"
                onChange={(event) => update('headline', event.target.value)}
              />
            </FormField>
            <FormField label="Professional summary" description="Aim for three to five clear sentences.">
              <Textarea
                className="min-h-36"
                value={resume.summary || ''}
                placeholder="Summarize your experience, strengths, and professional goals."
                onChange={(event) => update('summary', event.target.value)}
              />
            </FormField>
            <FormField label="Skills" description="Separate skills with commas or new lines.">
              <Textarea
                className="min-h-24"
                value={resume.skills || ''}
                placeholder="Java, JDBC, React, PostgreSQL, REST APIs"
                onChange={(event) => update('skills', event.target.value)}
              />
            </FormField>
            <FormField label="Experience">
              <Textarea
                className="min-h-44"
                value={resume.experience || ''}
                placeholder="Role, company, dates, responsibilities, and achievements."
                onChange={(event) => update('experience', event.target.value)}
              />
            </FormField>
            <FormField label="Education">
              <Textarea
                className="min-h-32"
                value={resume.education || ''}
                placeholder="Institution, program, graduation date, and certifications."
                onChange={(event) => update('education', event.target.value)}
              />
            </FormField>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="border border-[#d8dfda] bg-white p-5">
            <FormField label="Preview template">
              <Select
                options={[
                  { value: '', label: 'CareerBridge clean layout' },
                  ...templates.map((template) => ({ value: String(template.id), label: template.name })),
                ]}
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
              />
            </FormField>
          </section>
          <div className="bg-[#e9eeeb] p-5">
            <ResumePreview resume={resume} template={selectedTemplate} />
          </div>
        </aside>
      </div>

      <section className="grid gap-5 border border-[#d8dfda] bg-white p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center bg-[#edf4f0] text-[#176b52]">
            <FileText size={20} />
          </span>
          <div>
            <h2 className="font-bold text-[#17211e]">Uploaded resume file</h2>
            <p className="mt-1 text-sm text-[#68736e]">
              {resume.fileName || 'No external resume has been uploaded.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={uploadResume}
          />
          <Button variant="secondary" loading={uploading} loadingText="Uploading..." onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} />
            {resume.fileName ? 'Replace file' : 'Upload file'}
          </Button>
          <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={16} />
            Delete profile
          </Button>
        </div>
      </section>

      <DeleteResumeDialog
        open={deleteOpen}
        deleting={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteResume}
      />
    </div>
  );
}

function ResumeSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_520px]">
        <Skeleton className="h-[800px] w-full" />
        <Skeleton className="h-[800px] w-full" />
      </div>
    </div>
  );
}
