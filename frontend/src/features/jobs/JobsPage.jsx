import { BriefcaseBusiness, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  EmptyState,
  FormField,
  Input,
  Select,
  Skeleton,
} from '../../components/ui/index.js';
import JobCard from './JobCard.jsx';
import { jobTypeOptions } from './jobUtils.js';
import { useJobs } from './useJobs.js';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeFilters = useMemo(
    () => ({
      q: searchParams.get('q') || '',
      location: searchParams.get('location') || '',
      jobType: searchParams.get('jobType') || '',
    }),
    [searchParams],
  );
  const [form, setForm] = useState(routeFilters);
  const { jobs, loading, error } = useJobs(routeFilters);

  useEffect(() => {
    setForm(routeFilters);
  }, [routeFilters]);

  function search(event) {
    event.preventDefault();
    const next = new URLSearchParams();
    Object.entries(form).forEach(([key, value]) => value.trim() && next.set(key, value.trim()));
    setSearchParams(next);
  }

  function clearFilters() {
    setForm({ q: '', location: '', jobType: '' });
    setSearchParams({});
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f7f5]">
      <section className="border-b border-[#dfe4e0] bg-[#172a23] text-white">
        <div className="mx-auto max-w-[1280px] px-8 py-14 lg:px-12">
          <p className="text-xs font-bold uppercase text-[#8fd2b9]">CareerBridge marketplace</p>
          <h1 className="mt-3 text-4xl font-semibold">Find your next opportunity.</h1>
          <p className="mt-3 max-w-2xl text-base text-[#c7d4ce]">
            Explore approved employers and review every role on its own dedicated page.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1280px] gap-8 px-8 py-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-12">
        <aside>
          <form className="sticky top-24 border border-[#d8dfda] bg-white p-5" onSubmit={search}>
            <div className="mb-5 flex items-center gap-2 border-b border-[#e5e9e6] pb-4">
              <SlidersHorizontal className="text-[#176b52]" size={18} />
              <h2 className="font-bold text-[#17211e]">Search filters</h2>
            </div>
            <div className="space-y-5">
              <FormField label="Keyword">
                <Input
                  startIcon={Search}
                  value={form.q}
                  placeholder="Title or skill"
                  onChange={(event) => setForm({ ...form, q: event.target.value })}
                />
              </FormField>
              <FormField label="Location">
                <Input
                  startIcon={MapPin}
                  value={form.location}
                  placeholder="City or remote"
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </FormField>
              <FormField label="Job type">
                <Select
                  options={jobTypeOptions}
                  value={form.jobType}
                  onChange={(event) => setForm({ ...form, jobType: event.target.value })}
                />
              </FormField>
              <Button className="w-full" type="submit">Apply filters</Button>
              <Button className="w-full" variant="ghost" onClick={clearFilters}>Clear all</Button>
            </div>
          </form>
        </aside>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-[#17211e]">
                {loading ? 'Loading opportunities...' : `${jobs.length} ${jobs.length === 1 ? 'opportunity' : 'opportunities'}`}
              </p>
              <p className="mt-1 text-xs text-[#74807a]">Approved employers · newest first</p>
            </div>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
          )}

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => <JobCardSkeleton key={index} />)}
            </div>
          ) : jobs.length ? (
            <div className="space-y-4">{jobs.map((job) => <JobCard job={job} key={job.id} />)}</div>
          ) : (
            <div className="border border-[#d8dfda] bg-white">
              <EmptyState
                icon={BriefcaseBusiness}
                title="No opportunities match these filters"
                description="Try a broader keyword, another location, or clear your filters."
                action={<Button onClick={clearFilters}>Clear filters</Button>}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function JobCardSkeleton() {
  return (
    <div className="border border-[#d8dfda] bg-white p-6">
      <div className="flex gap-5">
        <Skeleton className="h-14 w-14 rounded-none" />
        <div className="flex-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-6 w-72" />
          <Skeleton className="mt-5 h-4 w-96" />
          <Skeleton className="mt-6 h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
