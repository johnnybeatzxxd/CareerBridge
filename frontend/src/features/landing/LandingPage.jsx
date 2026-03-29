import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Compass,
  FileCheck2,
  LineChart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const roleTracks = [
  {
    label: 'For talent',
    title: 'Make your next move with clarity.',
    description:
      'Discover relevant roles, understand the opportunity, and keep every application moving from one focused place.',
    icon: Compass,
    accent: 'bg-[#dff3ea] text-[#12664f]',
    points: ['Curated role discovery', 'Clear application tracking', 'A profile that works harder'],
    cta: 'Explore open roles',
    to: '/jobs',
  },
  {
    label: 'For hiring teams',
    title: 'Meet people who fit the work.',
    description:
      'Publish credible opportunities and move from active search to qualified conversations without the usual noise.',
    icon: Users,
    accent: 'bg-[#e7eef8] text-[#295a8a]',
    points: ['Structured job publishing', 'Focused candidate review', 'A trusted employer presence'],
    cta: 'Start hiring',
    to: '/register?role=employer',
  },
];

const proofPoints = [
  { icon: ShieldCheck, title: 'Verified employers', copy: 'A more trustworthy place to make a career decision.' },
  { icon: FileCheck2, title: 'Direct applications', copy: 'Apply with context and track what happens next.' },
  { icon: Sparkles, title: 'Relevant discovery', copy: 'Less scrolling. More roles aligned with your direction.' },
];

function LandingPage({
  featuredJobs,
  jobs,
  stats = {},
  isLoading = false,
  className = '',
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const opportunities = (featuredJobs || jobs || []).slice(0, 6);

  function submitSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs${params.size ? `?${params.toString()}` : ''}`);
  }

  return (
    <div className={`min-h-screen bg-[#f7f8f6] text-[#17211e] ${className}`}>
      <main>
        <section className="relative overflow-hidden border-b border-[#dfe4e0] bg-[#f7f8f6]">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] border-l border-[#dfe4e0] bg-[#eef2ef] lg:block" />
          <div className="relative mx-auto grid max-w-[1440px] gap-12 px-5 pb-16 pt-14 sm:px-8 md:pb-20 md:pt-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,.72fr)] lg:items-center lg:gap-20 lg:px-12 lg:pb-24 lg:pt-24">
            <div className="max-w-3xl">
              <div className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#12664f]">
                <span className="h-2 w-2 rounded-full bg-[#e5654f]" />
                The marketplace for meaningful work
              </div>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[.98] tracking-[0] text-[#12201b] sm:text-6xl md:text-7xl xl:text-8xl">
                Better work starts with a better connection.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#58645f] md:text-xl">
                CareerBridge brings ambitious people and thoughtful employers together around roles worth pursuing.
              </p>

              <form
                className="mt-9 grid gap-2 border border-[#cad2cd] bg-white p-2 shadow-[0_18px_45px_rgba(24,43,35,0.10)] sm:grid-cols-[1fr_1fr_auto]"
                onSubmit={submitSearch}
              >
                <SearchField
                  icon={Search}
                  label="Role or keyword"
                  value={query}
                  onChange={setQuery}
                  placeholder="Product designer"
                />
                <SearchField
                  icon={MapPin}
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  placeholder="City or remote"
                  divided
                />
                <button
                  type="submit"
                  className="inline-flex min-h-14 items-center justify-center gap-2 bg-[#176b52] px-6 text-sm font-bold text-white transition-colors hover:bg-[#115740] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#176b52] focus-visible:ring-offset-2"
                >
                  Search jobs
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#68736e]">
                <span className="font-semibold text-[#28342f]">Popular:</span>
                {['Engineering', 'Design', 'Marketing', 'Remote'].map((term) => (
                  <Link
                    key={term}
                    to={`/jobs?q=${encodeURIComponent(term)}`}
                    className="border-b border-[#b7c0bb] pb-0.5 transition-colors hover:border-[#176b52] hover:text-[#176b52]"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            <OpportunityPreview jobs={opportunities} isLoading={isLoading} />
          </div>
        </section>

        <MetricsBand stats={stats} />

        <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
          <SectionHeading
            eyebrow="Built around better decisions"
            title="A marketplace that respects both sides."
            copy="Useful signals, credible opportunities, and a calmer path from first look to final conversation."
          />
          <div className="mt-12 grid border border-[#d8dfda] bg-white md:grid-cols-3">
            {proofPoints.map((item, index) => (
              <article
                key={item.title}
                className={`p-7 md:p-9 ${index > 0 ? 'border-t border-[#d8dfda] md:border-l md:border-t-0' : ''}`}
              >
                <item.icon className="text-[#176b52]" size={24} strokeWidth={1.8} aria-hidden="true" />
                <h3 className="mt-8 text-lg font-bold text-[#17211e]">{item.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-[#68736e]">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <FeaturedJobs jobs={opportunities} isLoading={isLoading} />

        <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
          <SectionHeading
            eyebrow="One bridge, two directions"
            title="Designed for the people doing the work."
            copy="Whether you are building a career or a team, every step stays practical, transparent, and human."
          />
          <div className="mt-12 grid gap-px overflow-hidden border border-[#d8dfda] bg-[#d8dfda] lg:grid-cols-2">
            {roleTracks.map((track) => (
              <RolePanel key={track.label} {...track} />
            ))}
          </div>
        </section>

        <section className="bg-[#172a23] text-white">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between md:py-20 lg:px-12">
            <div>
              <p className="text-sm font-bold text-[#8fd2b9]">YOUR NEXT CHAPTER</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
                The right opportunity can change everything.
              </h2>
            </div>
            <Link
              to="/jobs"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start bg-white px-6 text-sm font-bold text-[#172a23] transition-colors hover:bg-[#dff3ea] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#172a23] md:self-auto"
            >
              Find your next role
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function SearchField({ icon: Icon, label, value, onChange, placeholder, divided = false }) {
  return (
    <label className={`flex min-h-14 items-center gap-3 px-3 ${divided ? 'sm:border-l sm:border-[#e0e5e1]' : ''}`}>
      <Icon className="shrink-0 text-[#78837e]" size={19} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="sr-only">{label}</span>
        <input
          className="h-10 w-full border-0 bg-transparent text-sm font-medium text-[#17211e] outline-none placeholder:font-normal placeholder:text-[#8b9691]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
        />
      </span>
    </label>
  );
}

function OpportunityPreview({ jobs, isLoading }) {
  const previewJobs = jobs.slice(0, 3);

  return (
    <div className="relative mx-auto w-full max-w-lg lg:mx-0">
      <div className="border border-[#cbd3ce] bg-white shadow-[0_24px_70px_rgba(24,43,35,0.12)]">
        <div className="flex items-center justify-between border-b border-[#e1e6e2] px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#7a8580]">Fresh opportunities</p>
            <p className="mt-1 text-sm font-semibold">Picked for momentum</p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-[#dff3ea] px-2.5 py-1.5 text-xs font-bold text-[#12664f]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1b8a67]" />
            Live
          </span>
        </div>
        <div className="divide-y divide-[#e1e6e2]">
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => <JobPreviewSkeleton key={index} />)}
          {!isLoading &&
            previewJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="group flex items-center gap-4 px-5 py-5 transition-colors hover:bg-[#f6f8f6]"
              >
                <CompanyMark name={companyName(job)} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-[#17211e] group-hover:text-[#176b52]">
                    {job.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-[#6d7873]">
                    {companyName(job)} · {job.location || 'Flexible location'}
                  </p>
                </div>
                <ChevronRight className="shrink-0 text-[#a0aaa5] group-hover:text-[#176b52]" size={18} />
              </Link>
            ))}
          {!isLoading && previewJobs.length === 0 && (
            <div className="px-6 py-12 text-center">
              <BriefcaseBusiness className="mx-auto text-[#176b52]" size={27} strokeWidth={1.7} />
              <p className="mt-4 text-sm font-bold">New opportunities are on the way.</p>
              <p className="mt-1 text-xs leading-5 text-[#75807b]">Browse the full marketplace for current roles.</p>
            </div>
          )}
        </div>
        <Link
          to="/jobs"
          className="flex items-center justify-between border-t border-[#e1e6e2] px-5 py-4 text-sm font-bold text-[#176b52] hover:bg-[#f6f8f6]"
        >
          View the marketplace
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 border border-[#d9dedb] bg-[#fff8ea] px-4 py-3 shadow-[0_12px_30px_rgba(24,43,35,0.10)] sm:flex">
        <span className="grid h-9 w-9 place-items-center bg-[#f4d998] text-[#725312]">
          <LineChart size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold text-[#17211e]">Growing every week</p>
          <p className="mt-0.5 text-[11px] text-[#68736e]">New roles. New possibilities.</p>
        </div>
      </div>
    </div>
  );
}

function MetricsBand({ stats }) {
  const metrics = [
    {
      value: metricValue(stats, ['openJobs', 'jobs', 'activeJobs']),
      fallback: '500+',
      label: 'open opportunities',
    },
    {
      value: metricValue(stats, ['employers', 'approvedEmployers', 'companies']),
      fallback: '120+',
      label: 'trusted employers',
    },
    {
      value: metricValue(stats, ['applications', 'totalApplications']),
      fallback: '10k+',
      label: 'career connections',
    },
  ];

  return (
    <section className="border-b border-[#dfe4e0] bg-white" aria-label="CareerBridge marketplace statistics">
      <div className="mx-auto grid max-w-[1440px] sm:grid-cols-3">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`px-5 py-7 sm:px-8 md:py-9 lg:px-12 ${
              index > 0 ? 'border-t border-[#dfe4e0] sm:border-l sm:border-t-0' : ''
            }`}
          >
            <p className="text-2xl font-semibold text-[#17211e] md:text-3xl">{metric.value ?? metric.fallback}</p>
            <p className="mt-1 text-sm text-[#707b76]">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedJobs({ jobs, isLoading }) {
  return (
    <section className="border-y border-[#dfe4e0] bg-[#eef2ef]">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 md:py-24 lg:px-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Featured opportunities"
            title="Work with room to grow."
            copy="A selection of current roles from teams investing in what comes next."
          />
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 self-start text-sm font-bold text-[#176b52] hover:text-[#104f3d]"
          >
            Browse all jobs
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => <FeaturedJobSkeleton key={index} />)}
          {!isLoading && jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>

        {!isLoading && jobs.length === 0 && (
          <div className="mt-10 flex flex-col items-start justify-between gap-6 border border-[#d4dcd6] bg-white p-7 sm:flex-row sm:items-center md:p-9">
            <div>
              <h3 className="text-lg font-bold">The next great role may already be open.</h3>
              <p className="mt-2 text-sm text-[#69746f]">Explore every live opportunity in the CareerBridge marketplace.</p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 bg-[#176b52] px-5 text-sm font-bold text-white hover:bg-[#115740]"
            >
              Explore jobs
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function JobCard({ job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group flex min-h-[280px] flex-col border border-[#d6ddd8] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#aebcb4] hover:shadow-[0_18px_45px_rgba(24,43,35,0.09)]"
    >
      <div className="flex items-start justify-between gap-4">
        <CompanyMark name={companyName(job)} large />
        <span className="bg-[#edf2ef] px-2.5 py-1.5 text-xs font-bold text-[#506059]">{formatType(job.jobType)}</span>
      </div>
      <div className="mt-8 flex-1">
        <p className="text-xs font-bold uppercase text-[#77827d]">{companyName(job)}</p>
        <h3 className="mt-2 text-xl font-bold leading-snug text-[#17211e] transition-colors group-hover:text-[#176b52]">
          {job.title}
        </h3>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#68736e]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={15} aria-hidden="true" />
            {job.location || 'Flexible location'}
          </span>
          {job.salary && (
            <span className="inline-flex items-center gap-1.5">
              <CircleDollarSign size={15} aria-hidden="true" />
              {job.salary}
            </span>
          )}
        </div>
      </div>
      <div className="mt-7 flex items-center justify-between border-t border-[#e4e8e5] pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-[#77827d]">
          <Clock3 size={14} aria-hidden="true" />
          {relativeDate(job.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-[#176b52]">
          View role
          <ChevronRight size={16} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function RolePanel({ label, title, description, icon: Icon, accent, points, cta, to }) {
  return (
    <article className="bg-white p-7 md:p-10 lg:p-12">
      <div className={`grid h-12 w-12 place-items-center ${accent}`}>
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <p className="mt-8 text-xs font-bold uppercase text-[#176b52]">{label}</p>
      <h3 className="mt-3 max-w-md text-2xl font-semibold leading-tight text-[#17211e] md:text-3xl">{title}</h3>
      <p className="mt-4 max-w-lg text-sm leading-7 text-[#68736e]">{description}</p>
      <ul className="mt-7 space-y-3">
        {points.map((point) => (
          <li key={point} className="flex items-center gap-3 text-sm font-semibold text-[#33403b]">
            <span className="grid h-5 w-5 shrink-0 place-items-center bg-[#e7f3ed] text-[#176b52]">
              <Check size={13} strokeWidth={2.5} aria-hidden="true" />
            </span>
            {point}
          </li>
        ))}
      </ul>
      <Link
        to={to}
        className="mt-9 inline-flex items-center gap-2 text-sm font-bold text-[#176b52] hover:text-[#104f3d]"
      >
        {cta}
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </article>
  );
}

function SectionHeading({ eyebrow, title, copy }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase text-[#176b52]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#17211e] md:text-4xl">{title}</h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-[#68736e]">{copy}</p>
    </div>
  );
}

function CompanyMark({ name, large = false }) {
  const initials = (name || 'CareerBridge')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <span
      className={`grid shrink-0 place-items-center border border-[#cad5cf] bg-[#edf4f0] font-bold text-[#176b52] ${
        large ? 'h-12 w-12 text-sm' : 'h-10 w-10 text-xs'
      }`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function JobPreviewSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 px-5 py-5">
      <div className="h-10 w-10 bg-[#e8ede9]" />
      <div className="flex-1">
        <div className="h-3 w-2/3 bg-[#e8ede9]" />
        <div className="mt-2 h-2.5 w-1/2 bg-[#eef1ef]" />
      </div>
    </div>
  );
}

function FeaturedJobSkeleton() {
  return (
    <div className="min-h-[280px] animate-pulse border border-[#d6ddd8] bg-white p-6">
      <div className="h-12 w-12 bg-[#e8ede9]" />
      <div className="mt-8 h-3 w-1/3 bg-[#e8ede9]" />
      <div className="mt-3 h-6 w-4/5 bg-[#e8ede9]" />
      <div className="mt-5 h-3 w-3/5 bg-[#eef1ef]" />
    </div>
  );
}

function companyName(job) {
  return job.companyName || job.employerName || 'CareerBridge partner';
}

function formatType(value) {
  if (!value) return 'Full time';
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function relativeDate(value) {
  if (!value) return 'Recently added';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently added';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  if (days === 0) return 'Added today';
  if (days === 1) return 'Added yesterday';
  if (days < 7) return `Added ${days} days ago`;
  return `Added ${Math.floor(days / 7)}w ago`;
}

function metricValue(stats, keys) {
  const value = keys.map((key) => stats?.[key]).find((item) => item !== undefined && item !== null);
  return typeof value === 'number' ? new Intl.NumberFormat('en-US').format(value) : value;
}

export {
  FeaturedJobs,
  JobCard,
  MetricsBand,
  OpportunityPreview,
  RolePanel,
};

export default LandingPage;
