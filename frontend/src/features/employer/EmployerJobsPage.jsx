import { Eye, Pencil, Plus, Power, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Badge, Button, DataTable, DataTableBody, DataTableCell, DataTableHead, DataTableHeader, DataTableRow, EmptyState, IconButton, PageHeader, Skeleton } from '../../components/ui/index.js';
import { useAuth } from '../auth/index.js';
import { formatJobPrice } from '../jobs/jobUtils.js';
import DeleteJobDialog from './DeleteJobDialog.jsx';
import JobFormDialog from './JobFormDialog.jsx';
import { formatJobType } from './jobForm.js';
import { useEmployerJobs } from './useEmployerJobs.js';

export default function EmployerJobsPage() {
  const { user } = useAuth();
  const { jobs, loading, error, create, update, remove, applicationCount } = useEmployerJobs();
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');

  if (user.role !== 'EMPLOYER') return <Navigate to="/dashboard" replace />;

  function openCreate() { setEditing(null); setFormOpen(true); setNotice(''); setActionError(''); }
  function openEdit(job) { setEditing(job); setFormOpen(true); setNotice(''); setActionError(''); }

  async function saveJob(form) {
    setBusy(true); setActionError('');
    try {
      if (editing?.id) { await update({ ...editing, ...form }); setNotice('Job post updated.'); }
      else { await create(form); setNotice('Job post published.'); }
      setFormOpen(false); setEditing(null);
    } catch (err) { setActionError(err.message || 'Unable to save job'); }
    finally { setBusy(false); }
  }

  async function toggle(job) {
    setBusy(true); setActionError('');
    try { await update({ ...job, status: job.status === 'OPEN' ? 'CLOSED' : 'OPEN' }); setNotice(job.status === 'OPEN' ? 'Job closed.' : 'Job reopened.'); }
    catch (err) { setActionError(err.message || 'Unable to update job'); }
    finally { setBusy(false); }
  }

  async function deleteJob() {
    setBusy(true); setActionError('');
    try { await remove(deleting.id); setDeleting(null); setNotice('Job post deleted.'); }
    catch (err) { setActionError(err.message || 'Unable to delete job'); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="Employer workspace" title="Job posts" subtitle="Create opportunities, control publishing status, and open each role’s candidate pipeline." actions={<Button onClick={openCreate}><Plus size={16} />Create job</Button>} />
    {(error || actionError) && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || actionError}</div>}
    {notice && <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}
    {loading ? <div className="border bg-white p-5">{[1,2,3].map(i=><Skeleton className="mb-3 h-16" key={i}/>)}</div> : jobs.length ? (
      <DataTable className="min-w-[1000px]" containerClassName="rounded-none border-[#d8dfda]">
        <DataTableHeader><DataTableRow><DataTableHead>Position</DataTableHead><DataTableHead>Location / Type</DataTableHead><DataTableHead>Applications</DataTableHead><DataTableHead>Status</DataTableHead><DataTableHead align="right">Actions</DataTableHead></DataTableRow></DataTableHeader>
        <DataTableBody>{jobs.map(job=><DataTableRow interactive key={job.id}>
          <DataTableCell><p className="font-bold text-[#17211e]">{job.title}</p><p className="mt-1 text-xs text-[#74807a]">{formatJobPrice(job)}</p>{job.skills?.length > 0 && <p className="mt-2 max-w-sm truncate text-xs text-[#176b52]">{job.skills.join(' · ')}</p>}</DataTableCell>
          <DataTableCell><p className="font-semibold">{job.location}</p><p className="mt-1 text-xs">{formatJobType(job.jobType)}</p></DataTableCell>
          <DataTableCell><Link className="inline-flex items-center gap-2 font-bold text-[#176b52] hover:underline" to={`/employer/candidates?jobId=${job.id}`}><Users size={16}/>{applicationCount(job.id)} candidates</Link></DataTableCell>
          <DataTableCell><Badge variant={job.filled ? 'success' : job.status === 'OPEN' ? 'success' : 'neutral'} dot>{job.filled ? 'Filled' : job.status === 'OPEN' ? 'Open' : 'Closed'}</Badge></DataTableCell>
          <DataTableCell align="right"><div className="flex justify-end gap-1">{!job.filled && <Link className="inline-grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50" title="View public job" to={`/jobs/${job.id}`}><Eye size={16}/></Link>}{!job.filled && <IconButton label={`Edit ${job.title}`} onClick={()=>openEdit(job)}><Pencil size={16}/></IconButton>}{!job.filled && <IconButton label={`${job.status === 'OPEN' ? 'Close' : 'Reopen'} ${job.title}`} loading={busy} onClick={()=>toggle(job)}><Power size={16}/></IconButton>}<IconButton label={`Delete ${job.title}`} variant="danger" onClick={()=>setDeleting(job)}><Trash2 size={16}/></IconButton></div></DataTableCell>
        </DataTableRow>)}</DataTableBody>
      </DataTable>
    ) : <div className="border border-[#d8dfda] bg-white"><EmptyState title="No job posts yet" description="Create your first opportunity to begin receiving applications." action={<Button onClick={openCreate}><Plus size={16}/>Create job</Button>}/></div>}
    <JobFormDialog job={editing} open={formOpen} saving={busy} onClose={()=>setFormOpen(false)} onSave={saveJob}/>
    <DeleteJobDialog job={deleting} deleting={busy} onClose={()=>setDeleting(null)} onConfirm={deleteJob}/>
  </div>;
}
