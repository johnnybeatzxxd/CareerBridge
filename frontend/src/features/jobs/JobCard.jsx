import { ArrowUpRight, BriefcaseBusiness, Clock3, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/index.js';
import { companyName, formatDate, formatJobType, initials } from './jobUtils.js';

export default function JobCard({ job }) {
  return (
    <article className="group border border-[#d8dfda] bg-white transition-all hover:border-[#aebbb4] hover:shadow-[0_16px_40px_rgba(24,43,35,0.08)]">
      <Link className="block p-6" to={`/jobs/${job.id}`}>
        <div className="flex items-start gap-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center border border-[#cad5cf] bg-[#edf4f0] text-sm font-bold text-[#176b52]">
            {initials(companyName(job))}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-[#66736d]">{companyName(job)}</p>
                <h2 className="mt-1 text-xl font-bold text-[#17211e] transition-colors group-hover:text-[#176b52]">
                  {job.title}
                </h2>
              </div>
              <ArrowUpRight className="shrink-0 text-[#9aa59f] group-hover:text-[#176b52]" size={20} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#68736e]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BriefcaseBusiness size={15} />
                {formatJobType(job.jobType)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={15} />
                {formatDate(job.createdAt)}
              </span>
            </div>

            <p className="mt-5 line-clamp-2 max-w-4xl text-sm leading-6 text-[#5f6c66]">{job.description}</p>

            <div className="mt-5 flex items-center justify-between border-t border-[#e5e9e6] pt-4">
              <div className="flex items-center gap-2">
                <Badge className="rounded-none bg-[#e7f3ed] text-[#12664f]">{formatJobType(job.jobType)}</Badge>
                {job.salary && <span className="text-sm font-bold text-[#176b52]">{job.salary}</span>}
              </div>
              <span className="text-sm font-bold text-[#176b52]">View opportunity</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
