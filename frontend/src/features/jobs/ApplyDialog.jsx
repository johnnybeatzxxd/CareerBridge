import { Send } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  FormField,
  Textarea,
} from '../../components/ui/index.js';
import { jsonRequest } from '../../api.js';
import { useAuth } from '../auth/index.js';

export default function ApplyDialog({ job, open, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  async function submit() {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (user.role !== 'JOB_SEEKER') return;

    setSubmitting(true);
    setError('');
    try {
      await jsonRequest('/applications', 'POST', { jobId: job.id, coverLetter });
      setComplete(true);
    } catch (requestError) {
      setError(requestError.message || 'Unable to submit application');
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    setCoverLetter('');
    setError('');
    setComplete(false);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title={complete ? 'Application submitted' : `Apply for ${job?.title || ''}`}
      description={complete ? 'Your application is now in the employer’s candidate pipeline.' : 'Add a focused note for the hiring team.'}
      footer={
        complete ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button loading={submitting} onClick={submit}>
              <Send size={16} />
              Submit application
            </Button>
          </>
        )
      }
    >
      {complete ? (
        <div className="bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
          You can track this application from your dashboard once that checkpoint is built.
        </div>
      ) : (
        <>
          {error && <div className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <FormField label="Cover letter" optional description="A short, relevant message is usually strongest.">
            <Textarea
              rows={7}
              value={coverLetter}
              placeholder="Introduce yourself and explain why this role fits your experience."
              onChange={(event) => setCoverLetter(event.target.value)}
            />
          </FormField>
        </>
      )}
    </Dialog>
  );
}
