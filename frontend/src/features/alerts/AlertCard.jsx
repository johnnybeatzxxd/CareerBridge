import {
  Bell,
  BellOff,
  BriefcaseBusiness,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  IconButton,
} from '../../components/ui/index.js';
import { alertTitle, formatJobType } from './alertUtils.js';

export default function AlertCard({ alert, toggling, onEdit, onDelete, onToggle }) {
  const matches = alert.matchingJobs || [];

  return (
    <article className="border border-[#d8dfda] bg-white">
      <header className="flex items-start justify-between gap-5 border-b border-[#e5e9e6] p-5">
        <div className="flex min-w-0 items-start gap-4">
          <span className={`grid h-11 w-11 shrink-0 place-items-center ${alert.active ? 'bg-[#e7f3ed] text-[#176b52]' : 'bg-slate-100 text-slate-500'}`}>
            {alert.active ? <Bell size={19} /> : <BellOff size={19} />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-[#17211e]">{alertTitle(alert)}</h2>
              <Badge variant={alert.active ? 'success' : 'neutral'} dot>{alert.active ? 'Active' : 'Paused'}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#68736e]">
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{alert.location || 'Any location'}</span>
              <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={14} />{formatJobType(alert.jobType)}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <IconButton label={`Edit ${alertTitle(alert)} alert`} onClick={() => onEdit(alert)}>
            <Pencil size={16} />
          </IconButton>
          <IconButton label={`Delete ${alertTitle(alert)} alert`} variant="danger" onClick={() => onDelete(alert)}>
            <Trash2 size={16} />
          </IconButton>
        </div>
      </header>

      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-bold uppercase text-[#7a8580]">
            {matches.length} {matches.length === 1 ? 'matching job' : 'matching jobs'}
          </p>
          <Button
            size="sm"
            variant="ghost"
            loading={toggling}
            onClick={() => onToggle(alert)}
          >
            {alert.active ? 'Pause alert' : 'Enable alert'}
          </Button>
        </div>

        {matches.length ? (
          <div className="divide-y divide-[#edf0ee] border-y border-[#edf0ee]">
            {matches.slice(0, 3).map((job) => (
              <Link
                className="flex items-center justify-between gap-4 py-3 text-sm hover:text-[#176b52]"
                key={job.id}
                to={`/jobs/${job.id}`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-bold text-[#17211e]">{job.title}</span>
                  <span className="mt-1 block truncate text-xs text-[#74807a]">{job.companyName} · {job.location}</span>
                </span>
                <span className="shrink-0 text-xs font-bold text-[#176b52]">View role</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[#cfd8d2] bg-[#f8faf8] p-5 text-center text-sm text-[#74807a]">
            No current jobs match this alert.
          </div>
        )}
      </div>
    </article>
  );
}
