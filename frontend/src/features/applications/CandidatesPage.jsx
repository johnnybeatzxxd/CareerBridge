import { Banknote, Eye, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  Avatar,
  Badge,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  EmptyState,
  FormField,
  IconButton,
  Input,
  PageHeader,
  Select,
  Skeleton,
} from '../../components/ui/index.js';
import { useAuth } from '../auth/index.js';
import { PayCandidateDialog } from '../payments/index.js';
import { formatMoney } from '../wallet/walletUtils.js';
import {
  applicationStatuses,
  formatApplicationDate,
  statusLabel,
  statusVariant,
} from './applicationUtils.js';
import { useApplications } from './useApplications.js';

export default function CandidatesPage() {
  const { user } = useAuth();
  const { applications, loading, error, reload, updateStatus } = useApplications();
  const [paying, setPaying] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const jobFilter = searchParams.get('jobId') || '';
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return applications.filter((application) => {
      const matchesQuery = !normalized
        || application.seekerName.toLowerCase().includes(normalized)
        || application.seekerEmail.toLowerCase().includes(normalized)
        || application.jobTitle.toLowerCase().includes(normalized);
      const matchesStatus = !statusFilter || application.status === statusFilter;
      const matchesJob = !jobFilter || String(application.jobId) === jobFilter;
      return matchesQuery && matchesStatus && matchesJob;
    });
  }, [applications, query, statusFilter, jobFilter]);

  if (user.role !== 'EMPLOYER') return <Navigate to="/dashboard" replace />;

  async function changeStatus(application, status) {
    setUpdatingId(application.id);
    setUpdateError('');
    try {
      await updateStatus(application.id, status);
    } catch (requestError) {
      setUpdateError(requestError.message || 'Unable to update application status');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employer workspace"
        title="Candidate pipeline"
        subtitle="Review applicants, read their cover letters, and update each hiring status."
      />

      <section className="grid gap-4 border border-[#d8dfda] bg-white p-5 lg:grid-cols-[minmax(280px,1fr)_240px]">
        <FormField label="Search candidates">
          <Input
            startIcon={Search}
            value={query}
            placeholder="Name, email, or job title"
            onChange={(event) => setQuery(event.target.value)}
          />
        </FormField>
        <FormField label="Pipeline status">
          <Select
            options={[{ value: '', label: 'All statuses' }, ...applicationStatuses]}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          />
        </FormField>
      </section>

      {jobFilter && (
        <div className="flex items-center justify-between border border-[#b9d8cb] bg-[#edf7f2] px-4 py-3 text-sm text-[#12664f]">
          <span>Showing candidates for one selected job post.</span>
          <button className="font-bold hover:underline" onClick={() => setSearchParams({})}>Show all candidates</button>
        </div>
      )}

      {(error || updateError) && (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || updateError}</div>
      )}

      {loading ? (
        <CandidatesSkeleton />
      ) : filtered.length ? (
        <DataTable className="min-w-[1040px]" containerClassName="rounded-none border-[#d8dfda]">
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Candidate</DataTableHead>
              <DataTableHead>Position</DataTableHead>
              <DataTableHead>Applied</DataTableHead>
              <DataTableHead>Paid</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead align="right">Details</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {filtered.map((application) => (
              <DataTableRow interactive key={application.id}>
                <DataTableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={application.seekerName} size="sm" />
                    <div>
                      <p className="font-bold text-[#17211e]">{application.seekerName}</p>
                      <p className="mt-1 text-xs text-[#74807a]">{application.seekerEmail}</p>
                    </div>
                  </div>
                </DataTableCell>
                <DataTableCell>
                  <p className="font-semibold text-[#405049]">{application.jobTitle}</p>
                  {application.coverLetter && <p className="mt-1 max-w-xs truncate text-xs text-[#7a8580]">{application.coverLetter}</p>}
                </DataTableCell>
                <DataTableCell>{formatApplicationDate(application.createdAt)}</DataTableCell>
                <DataTableCell className="font-bold text-[#176b52]">{formatMoney(application.totalPaid)}</DataTableCell>
                <DataTableCell>
                  <Select
                    aria-label={`Status for ${application.seekerName}`}
                    className="w-40"
                    disabled={updatingId === application.id}
                    options={applicationStatuses}
                    value={application.status}
                    onChange={(event) => changeStatus(application, event.target.value)}
                  />
                </DataTableCell>
                <DataTableCell align="right">
                  <div className="flex justify-end gap-1">
                    {application.status === 'HIRED' && Number(application.totalPaid) === 0 && (
                      <IconButton label={`Pay ${application.seekerName}`} onClick={() => setPaying(application)}>
                        <Banknote size={16} />
                      </IconButton>
                    )}
                    <Link
                      className="inline-grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      title={`View ${application.seekerName}'s profile`}
                      to={`/employer/candidates/${application.id}`}
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      ) : (
        <div className="border border-[#d8dfda] bg-white">
          <EmptyState
            icon={Users}
            title={applications.length ? 'No candidates match these filters' : 'No candidates yet'}
            description={applications.length ? 'Try another name, role, or pipeline status.' : 'Applications will appear here after job seekers apply.'}
          />
        </div>
      )}

      <PayCandidateDialog application={paying} onClose={() => setPaying(null)} onPaid={reload} />
    </div>
  );
}

function CandidatesSkeleton() {
  return (
    <div className="border border-[#d8dfda] bg-white p-5">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton className="mt-3 h-16 w-full" key={index} />
      ))}
    </div>
  );
}
