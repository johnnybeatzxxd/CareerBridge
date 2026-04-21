import { ArrowRight, BriefcaseBusiness, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Badge,
  EmptyState,
  PageHeader,
  Skeleton,
  StatCard,
} from '../../components/ui/index.js';
import { useAuth } from '../auth/index.js';
import { dashboardConfig } from './dashboardConfig.js';
import { useDashboard } from './useDashboard.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, activity, loading, error } = useDashboard(user.role);
  const config = dashboardConfig[user.role];
  const stats = config.stats(data, user);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={config.eyebrow}
        title={`Welcome back, ${firstName(user.name)}.`}
        subtitle={config.subtitle}
        actions={
          user.role === 'JOB_SEEKER' ? (
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
              to="/jobs"
            >
              Find jobs
              <ArrowRight size={16} />
            </Link>
          ) : null
        }
      />

      {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className={`grid gap-4 ${stats.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
        {loading
          ? stats.map((item) => <Skeleton className="h-36" key={item.label} />)
          : stats.map((item) => <StatCard key={item.label} {...item} />)}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <ActivityPanel activity={activity} loading={loading} role={user.role} />
        <QuickActions actions={config.actions} />
      </div>
    </div>
  );
}

function ActivityPanel({ activity, loading, role }) {
  const title = role === 'EMPLOYER' ? 'Recent candidates' : role === 'JOB_SEEKER' ? 'Recent applications' : 'Platform summary';

  return (
    <section className="border border-[#d8dfda] bg-white">
      <div className="border-b border-[#e5e9e6] px-6 py-5">
        <h2 className="font-bold text-[#17211e]">{title}</h2>
        <p className="mt-1 text-xs text-[#7a8580]">
          {role === 'ADMIN' ? 'Current marketplace activity from the system statistics.' : 'The latest activity connected to your account.'}
        </p>
      </div>
      {loading ? (
        <div className="space-y-4 p-6">
          {Array.from({ length: 3 }).map((_, index) => <Skeleton className="h-16" key={index} />)}
        </div>
      ) : activity.length ? (
        <div className="divide-y divide-[#edf0ee]">
          {activity.slice(0, 5).map((item) => (
            <div className="flex items-center justify-between gap-4 px-6 py-5" key={item.id}>
              <div className="flex min-w-0 items-center gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center bg-[#edf4f0] text-[#176b52]">
                  <BriefcaseBusiness size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#17211e]">{item.jobTitle}</p>
                  <p className="mt-1 truncate text-xs text-[#74807a]">{role === 'EMPLOYER' ? item.seekerName : item.companyName}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#7a8580]">
                  <Clock3 size={14} />
                  {formatDate(item.createdAt)}
                </span>
                <Badge variant={statusVariant(item.status)}>{formatStatus(item.status)}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : role === 'ADMIN' ? (
        <div className="p-6 text-sm leading-6 text-[#68736e]">
          Use the Administration workspace to manage users, employer approvals, and resume templates.
        </div>
      ) : (
        <EmptyState
          compact
          icon={BriefcaseBusiness}
          title="No activity yet"
          description={role === 'EMPLOYER' ? 'Candidate applications will appear here.' : 'Your submitted applications will appear here.'}
        />
      )}
    </section>
  );
}

function QuickActions({ actions }) {
  return (
    <section className="border border-[#d8dfda] bg-white p-6">
      <h2 className="font-bold text-[#17211e]">Quick actions</h2>
      <p className="mt-1 text-xs text-[#7a8580]">Continue with the most common workspace tasks.</p>
      <div className="mt-5 space-y-3">
        {actions.map(({ label, description, to, icon: Icon }) => (
          <Link
            className="group flex items-center gap-4 border border-[#dfe4e0] p-4 transition-colors hover:border-[#aebbb4] hover:bg-[#f7f9f7]"
            key={to}
            to={to}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center bg-[#e7f3ed] text-[#176b52]">
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#17211e]">{label}</span>
              <span className="mt-1 block text-xs leading-5 text-[#74807a]">{description}</span>
            </span>
            <ArrowRight className="text-[#9aa59f] group-hover:text-[#176b52]" size={17} />
          </Link>
        ))}
      </div>
    </section>
  );
}

function firstName(name) {
  return name?.split(' ')[0] || 'there';
}

function formatDate(value) {
  if (!value) return 'Recently';
  const date = new Date(value.replace(' ', 'T'));
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function formatStatus(status = '') {
  return status.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusVariant(status) {
  if (['SHORTLISTED'].includes(status)) return 'success';
  if (['REJECTED'].includes(status)) return 'danger';
  if (['REVIEWING'].includes(status)) return 'info';
  return 'warning';
}
