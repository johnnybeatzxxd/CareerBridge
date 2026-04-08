import { ArrowUpRight, BriefcaseBusiness, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Badge,
  Button,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  EmptyState,
  IconButton,
  PageHeader,
  Skeleton,
} from '../../components/ui/index.js';
import { useAuth } from '../auth/index.js';
import ApplicationDetailsDialog from './ApplicationDetailsDialog.jsx';
import {
  formatApplicationDate,
  statusLabel,
  statusVariant,
} from './applicationUtils.js';
import { useApplications } from './useApplications.js';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { applications, loading, error } = useApplications();
  const [selected, setSelected] = useState(null);

  if (user.role !== 'JOB_SEEKER') return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Job seeker workspace"
        title="My applications"
        subtitle="Track every submitted application and return to the original job details."
        actions={
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
            to="/jobs"
          >
            Browse more jobs
            <ArrowUpRight size={16} />
          </Link>
        }
      />

      {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <ApplicationsSkeleton />
      ) : applications.length ? (
        <DataTable className="min-w-[860px]" containerClassName="rounded-none border-[#d8dfda]">
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Opportunity</DataTableHead>
              <DataTableHead>Company</DataTableHead>
              <DataTableHead>Applied</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead align="right">Actions</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {applications.map((application) => (
              <DataTableRow interactive key={application.id}>
                <DataTableCell>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center bg-[#edf4f0] text-[#176b52]">
                      <BriefcaseBusiness size={18} />
                    </span>
                    <div>
                      <p className="font-bold text-[#17211e]">{application.jobTitle}</p>
                      <Link className="mt-1 inline-block text-xs font-semibold text-[#176b52]" to={`/jobs/${application.jobId}`}>
                        View job details
                      </Link>
                    </div>
                  </div>
                </DataTableCell>
                <DataTableCell className="font-semibold text-[#405049]">{application.companyName}</DataTableCell>
                <DataTableCell>{formatApplicationDate(application.createdAt)}</DataTableCell>
                <DataTableCell>
                  <Badge variant={statusVariant(application.status)} dot>
                    {statusLabel(application.status)}
                  </Badge>
                </DataTableCell>
                <DataTableCell align="right">
                  <IconButton label="View application details" onClick={() => setSelected(application)}>
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
            icon={BriefcaseBusiness}
            title="No applications yet"
            description="Explore open opportunities and submit your first application."
            action={
              <Link
                className="inline-flex min-h-10 items-center bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
                to="/jobs"
              >
                Find jobs
              </Link>
            }
          />
        </div>
      )}

      <ApplicationDetailsDialog application={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ApplicationsSkeleton() {
  return (
    <div className="border border-[#d8dfda] bg-white p-5">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton className="mt-3 h-16 w-full" key={index} />
      ))}
    </div>
  );
}
