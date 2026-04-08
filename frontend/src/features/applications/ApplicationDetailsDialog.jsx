import { BriefcaseBusiness, CalendarDays, Mail, UserRound } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
} from '../../components/ui/index.js';
import {
  formatApplicationDate,
  statusLabel,
  statusVariant,
} from './applicationUtils.js';

export default function ApplicationDetailsDialog({
  application,
  employerView = false,
  onClose,
}) {
  return (
    <Dialog
      open={Boolean(application)}
      onClose={onClose}
      size="lg"
      title={employerView ? 'Candidate application' : 'Application details'}
      description={application ? `${application.jobTitle} at ${application.companyName}` : ''}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {application && (
        <div className="space-y-6">
          <div className="grid gap-4 border border-[#dfe4e0] bg-[#f7f9f7] p-5 sm:grid-cols-2">
            <Detail icon={BriefcaseBusiness} label="Role" value={application.jobTitle} />
            <Detail icon={CalendarDays} label="Applied" value={formatApplicationDate(application.createdAt)} />
            {employerView && (
              <>
                <Detail icon={UserRound} label="Candidate" value={application.seekerName} />
                <Detail icon={Mail} label="Email" value={application.seekerEmail} />
              </>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-[#7a8580]">Current status</p>
            <Badge className="mt-2" variant={statusVariant(application.status)} dot>
              {statusLabel(application.status)}
            </Badge>
          </div>

          <section>
            <h3 className="text-sm font-bold text-[#17211e]">Cover letter</h3>
            <div className="mt-3 min-h-32 whitespace-pre-line border border-[#dfe4e0] bg-white p-5 text-sm leading-7 text-[#58645f]">
              {application.coverLetter || 'No cover letter was included with this application.'}
            </div>
          </section>
        </div>
      )}
    </Dialog>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 shrink-0 text-[#176b52]" size={17} />
      <div>
        <p className="text-xs text-[#7a8580]">{label}</p>
        <p className="mt-1 text-sm font-bold text-[#17211e]">{value || '—'}</p>
      </div>
    </div>
  );
}
