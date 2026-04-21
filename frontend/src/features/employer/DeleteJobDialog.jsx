import { Button, Dialog } from '../../components/ui/index.js';

export default function DeleteJobDialog({ job, deleting, onClose, onConfirm }) {
  return <Dialog open={Boolean(job)} onClose={onClose} title="Delete job post?" description={job ? `Delete “${job.title}” and its associated applications.` : ''} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" loading={deleting} onClick={onConfirm}>Delete job</Button></>}>
    <div className="border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">This action cannot be undone. Closing a job is safer if you want to preserve its applications.</div>
  </Dialog>;
}
