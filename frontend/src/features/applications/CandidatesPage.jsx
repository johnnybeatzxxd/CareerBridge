import { Eye, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
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
import ApplicationDetailsDialog from './ApplicationDetailsDialog.jsx';
import {
  applicationStatuses,
  formatApplicationDate,
  statusLabel,
  statusVariant,
} from './applicationUtils.js';
import { useApplications } from './useApplications.js';

export default function CandidatesPage() {
  const { user } = useAuth();
  const { applications, loading, error, updateStatus } = useApplications();
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
      return matchesQuery && matchesStatus;
    });
  }, [applications, query, statusFilter]);

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
                  <IconButton label={`View ${application.seekerName}'s application`} onClick={() => setSelected(application)}>
                    <Eye size={16} />
                  </IconButton>
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

      <ApplicationDetailsDialog
        application={selected}
        employerView
        onClose={() => setSelected(null)}
      />
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
