import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  EmptyState,
  Skeleton,
} from '../../components/ui/index.js';
import { useAuth } from '../auth/index.js';
import ApplyDialog from './ApplyDialog.jsx';
import { companyName, formatDate, formatJobPrice, formatJobType, initials } from './jobUtils.js';
import { useJob } from './useJobs.js';

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { job, loading, error } = useJob(jobId);
  const [applyOpen, setApplyOpen] = useState(false);

  if (loading) return <JobDetailsSkeleton />;

  if (error || !job) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#f5f7f5] px-8 py-16">
        <div className="mx-auto max-w-3xl border border-[#d8dfda] bg-white">
          <EmptyState
            icon={BriefcaseBusiness}
            title="This opportunity is unavailable"
            description={error || 'The job may have been removed.'}
            action={
              <Link
                className="inline-flex min-h-10 items-center bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
                to="/jobs"
              >
                Back to jobs
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  const seeker = !user || user.role === 'JOB_SEEKER';

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f7f5]">
      <div className="mx-auto max-w-[1180px] px-8 py-10 lg:px-12">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-[#58645f] hover:text-[#176b52]" to="/jobs">
          <ArrowLeft size={16} />
          Back to all jobs
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="border border-[#d8dfda] bg-white">
            <header className="border-b border-[#e1e6e2] p-8">
              <div className="flex items-start gap-5">
                <span className="grid h-16 w-16 shrink-0 place-items-center border border-[#cad5cf] bg-[#edf4f0] text-lg font-bold text-[#176b52]">
                  {initials(companyName(job))}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#176b52]">{companyName(job)}</p>
                  <h1 className="mt-2 text-4xl font-semibold leading-tight text-[#17211e]">{job.title}</h1>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#68736e]">
                    <span className="inline-flex items-center gap-1.5"><MapPin size={16} />{job.location}</span>
                    <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={16} />{formatJobType(job.jobType)}</span>
                    <span className="inline-flex items-center gap-1.5"><CalendarDays size={16} />Posted {formatDate(job.createdAt)}</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="space-y-10 p-8">
              <JobSection title="About the role" content={job.description} />
              <JobSection title="What you will need" content={job.requirements || 'The employer has not listed specific requirements.'} />
              <section>
                <h2 className="text-lg font-bold text-[#17211e]">About the employer</h2>
                <div className="mt-4 flex items-start gap-4 border border-[#dce2de] bg-[#f7f9f7] p-5">
                  <ShieldCheck className="mt-0.5 shrink-0 text-[#176b52]" size={21} />
                  <div>
                    <p className="font-bold text-[#17211e]">{companyName(job)}</p>
                    <p className="mt-1 text-sm leading-6 text-[#68736e]">Employer account on CareerBridge.</p>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#405049]">
                      <Mail size={16} />
                      {job.companyEmail || 'Contact email not provided'}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </article>

          <aside>
            <div className="sticky top-24 border border-[#d8dfda] bg-white p-6">
              <p className="text-xs font-bold uppercase text-[#74807a]">Compensation</p>
              <p className="mt-2 text-xl font-bold text-[#17211e]">{formatJobPrice(job)}</p>
              <Badge className="mt-4 rounded-none bg-[#e7f3ed] text-[#12664f]">{formatJobType(job.jobType)}</Badge>

              <div className="mt-6 border-t border-[#e5e9e6] pt-6">
                {seeker ? (
                  <Button className="w-full" size="lg" onClick={() => setApplyOpen(true)}>
                    <Send size={17} />
                    {user ? 'Apply for this role' : 'Sign in to apply'}
                  </Button>
                ) : (
                  <div className="bg-[#f4f7f5] p-4 text-sm leading-6 text-[#68736e]">
                    Applications are available to job-seeker accounts.
                  </div>
                )}
                <p className="mt-4 text-center text-xs leading-5 text-[#7a8580]">
                  Applications are submitted directly to the employer through CareerBridge.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <ApplyDialog job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />
    </main>
  );
}

function JobSection({ title, content }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[#17211e]">{title}</h2>
      <p className="mt-4 whitespace-pre-line text-base leading-8 text-[#53615b]">{content}</p>
    </section>
  );
}

function JobDetailsSkeleton() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f7f5] px-12 py-10">
      <div className="mx-auto max-w-[1180px]">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border border-[#d8dfda] bg-white p-8">
            <Skeleton className="h-16 w-16 rounded-none" />
            <Skeleton className="mt-6 h-10 w-2/3" />
            <Skeleton className="mt-8 h-52 w-full" />
          </div>
          <div className="border border-[#d8dfda] bg-white p-6"><Skeleton className="h-48 w-full" /></div>
        </div>
      </div>
    </main>
  );
}
