import {
  AlertCircle,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, jsonRequest } from './api.js';

const emptyJob = {
  title: '',
  location: '',
  jobType: 'FULL_TIME',
  salary: '',
  description: '',
  requirements: '',
  status: 'OPEN',
};
const emptyCv = { headline: '', summary: '', skills: '', experience: '', education: '' };
const emptyAlert = { keyword: '', location: '', jobType: '', active: true };
const emptyUser = {
  name: '',
  email: '',
  password: '',
  role: 'JOB_SEEKER',
  companyName: '',
  companyEmail: '',
  approved: true,
  active: true,
};

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('jobsite_token');
    const savedUser = localStorage.getItem('jobsite_user');
    return token && savedUser ? { token, user: JSON.parse(savedUser) } : null;
  });
  const [view, setView] = useState('jobs');
  const [mobileNav, setMobileNav] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [landing, setLanding] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [applications, setApplications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [cv, setCv] = useState(emptyCv);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [filters, setFilters] = useState({ q: '', location: '', jobType: '' });
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const user = auth?.user;
  const isSeeker = user?.role === 'JOB_SEEKER';
  const isEmployer = user?.role === 'EMPLOYER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    Promise.all([loadLanding(), loadJobs()]);
  }, []);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
    if (isSeeker) Promise.all([loadApplications(), loadCv(), loadAlerts()]);
    if (isEmployer) loadApplications();
    if (isAdmin) loadAdmin();
  }, [auth?.token]);

  useEffect(() => {
    if (view === 'employer' && isEmployer) loadJobs({ scope: 'EMPLOYER' });
    if (view === 'jobs') loadJobs(filters);
  }, [view]);

  const navItems = useMemo(() => {
    if (!user) return [];
    const items = [['dashboard', 'Overview', LayoutDashboard]];
    if (isSeeker) {
      items.push(
        ['jobs', 'Find jobs', Search],
        ['applications', 'Applications', Send],
        ['cv', 'Resume', FileText],
        ['alerts', 'Job alerts', Bell],
      );
    }
    if (isEmployer) {
      items.push(['employer', 'Job posts', BriefcaseBusiness], ['applications', 'Candidates', Users]);
    }
    if (isAdmin) items.push(['admin', 'Administration', ShieldCheck]);
    items.push(['account', 'Account', Settings]);
    return items;
  }, [user?.role]);

  async function run(action, successMessage) {
    setNotice(null);
    setBusy(true);
    try {
      const result = await action();
      if (successMessage) setNotice({ type: 'success', text: successMessage });
      return result;
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Something went wrong' });
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function loadLanding() {
    const result = await run(() => apiRequest('/public/landing'));
    if (result) setLanding(result);
  }

  async function loadJobs(nextFilters = filters) {
    const params = new URLSearchParams();
    Object.entries(nextFilters || {}).forEach(([key, value]) => value && params.set(key, value));
    const result = await run(() => apiRequest(`/jobs${params.size ? `?${params}` : ''}`));
    if (result) {
      setJobs(result);
      setSelectedJob((current) => result.find((job) => job.id === current?.id) || result[0] || null);
    }
  }

  async function loadDashboard() {
    const result = await run(() => apiRequest('/dashboard'));
    if (result) setDashboard(result);
  }

  async function loadApplications() {
    const result = await run(() => apiRequest('/applications'));
    if (result) setApplications(result);
  }

  async function loadCv() {
    const [profile, cvTemplates] = await Promise.all([
      run(() => apiRequest('/cv')),
      run(() => apiRequest('/cv/templates')),
    ]);
    if (profile) setCv({ ...emptyCv, ...profile });
    if (cvTemplates) setTemplates(cvTemplates);
  }

  async function loadAlerts() {
    const result = await run(() => apiRequest('/job-alerts'));
    if (result) setAlerts(result);
  }

  async function loadAdmin() {
    const [stats, users, cvTemplates] = await Promise.all([
      run(() => apiRequest('/admin/stats')),
      run(() => apiRequest('/admin/users')),
      run(() => apiRequest('/admin/cv-templates')),
    ]);
    if (stats) setAdminStats(stats);
    if (users) setAdminUsers(users);
    if (cvTemplates) setTemplates(cvTemplates);
  }

  function saveAuth(payload) {
    localStorage.setItem('jobsite_token', payload.token);
    localStorage.setItem('jobsite_user', JSON.stringify(payload.user));
    setAuth(payload);
    setView('dashboard');
  }

  function clearAuth() {
    localStorage.removeItem('jobsite_token');
    localStorage.removeItem('jobsite_user');
    setAuth(null);
    setView('jobs');
  }

  async function logout() {
    await run(() => jsonRequest('/auth/logout', 'POST'));
    clearAuth();
  }

  function navigate(next) {
    setView(next);
    setMobileNav(false);
    setNotice(null);
  }

  const content = (
    <>
      {notice && <Notice notice={notice} onClose={() => setNotice(null)} />}
      {view === 'jobs' && (
        <JobsView
          jobs={jobs}
          selectedJob={selectedJob}
          setSelectedJob={setSelectedJob}
          filters={filters}
          setFilters={setFilters}
          loadJobs={loadJobs}
          user={user}
          isSeeker={isSeeker}
          run={run}
          reloadApplications={loadApplications}
          onSignIn={() => navigate('auth')}
          stats={landing?.stats}
        />
      )}
      {view === 'auth' && <AuthView onAuth={saveAuth} run={run} busy={busy} />}
      {view === 'dashboard' && (
        <DashboardView
          user={user}
          dashboard={dashboard}
          applications={applications}
          jobs={jobs}
          stats={adminStats}
          navigate={navigate}
        />
      )}
      {view === 'applications' && (
        <ApplicationsView applications={applications} isEmployer={isEmployer} run={run} reload={loadApplications} />
      )}
      {view === 'cv' && isSeeker && <CvView cv={cv} setCv={setCv} templates={templates} run={run} reload={loadCv} />}
      {view === 'alerts' && isSeeker && <AlertsView alerts={alerts} run={run} reload={loadAlerts} />}
      {view === 'employer' && isEmployer && <EmployerView jobs={jobs} user={user} run={run} reload={() => loadJobs({ scope: 'EMPLOYER' })} />}
      {view === 'admin' && isAdmin && (
        <AdminView users={adminUsers} stats={adminStats} templates={templates} run={run} reload={loadAdmin} />
      )}
      {view === 'account' && user && (
        <AccountView user={user} token={auth.token} run={run} onAuthUpdate={saveAuth} onDeleted={clearAuth} />
      )}
    </>
  );

  if (!user) {
    return <PublicShell view={view} navigate={navigate}>{content}</PublicShell>;
  }

  return (
    <div className="shell-grid">
      <WorkspaceSidebar
        user={user}
        items={navItems}
        view={view}
        navigate={navigate}
        logout={logout}
        open={mobileNav}
        close={() => setMobileNav(false)}
      />
      <div className="min-w-0">
        <WorkspaceHeader user={user} view={view} items={navItems} openNav={() => setMobileNav(true)} navigate={navigate} />
        <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-8">{content}</main>
      </div>
    </div>
  );
}

function PublicShell({ view, navigate, children }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 md:px-8">
          <Brand onClick={() => navigate('jobs')} />
          <div className="flex items-center gap-2">
            {view !== 'jobs' && <button className="btn-ghost hidden sm:inline-flex" onClick={() => navigate('jobs')}>Browse jobs</button>}
            <button className="btn-primary" onClick={() => navigate('auth')}><CircleUserRound size={17} />Sign in</button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

function WorkspaceSidebar({ user, items, view, navigate, logout, open, close }) {
  return (
    <>
      {open && <button className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={close} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:z-10 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Brand onClick={() => navigate('dashboard')} compact />
          <button className="icon-btn border-0 lg:hidden" onClick={close}><X size={19} /></button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-xs font-bold uppercase text-slate-400">Workspace</p>
          {items.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors ${view === id ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
              onClick={() => navigate(id)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <div className="mb-3 flex items-center gap-3 px-2">
            <Avatar name={user.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{formatRole(user.role)}</p>
            </div>
          </div>
          <button className="btn-ghost w-full justify-start" onClick={logout}><LogOut size={17} />Sign out</button>
        </div>
      </aside>
    </>
  );
}

function WorkspaceHeader({ user, view, items, openNav, navigate }) {
  const title = items.find(([id]) => id === view)?.[1] || 'CareerBridge';
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button className="icon-btn lg:hidden" onClick={openNav}><Menu size={19} /></button>
        <div>
          <p className="text-sm font-bold text-slate-950">{title}</p>
          <p className="hidden text-xs text-slate-500 sm:block">{user.companyName || user.email}</p>
        </div>
      </div>
      <button className="flex items-center gap-2 rounded-md p-1.5 hover:bg-slate-50" onClick={() => navigate('account')}>
        <Avatar name={user.name} small />
        <ChevronRight className="text-slate-400" size={16} />
      </button>
    </header>
  );
}

function JobsView({ jobs, selectedJob, setSelectedJob, filters, setFilters, loadJobs, user, isSeeker, run, reloadApplications, onSignIn, stats }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [applyOpen, setApplyOpen] = useState(false);

  async function apply() {
    const result = await run(
      () => jsonRequest('/applications', 'POST', { jobId: selectedJob.id, coverLetter }),
      'Application submitted successfully',
    );
    if (result) {
      setApplyOpen(false);
      setCoverLetter('');
      reloadApplications();
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    loadJobs(filters);
  }

  return (
    <div className={user ? '' : 'public-grid min-h-[calc(100vh-64px)]'}>
      <div className={`mx-auto max-w-[1500px] ${user ? '' : 'px-4 py-8 md:px-8 md:py-12'}`}>
        {!user && (
          <div className="mb-8 max-w-3xl">
            <p className="mb-2 text-sm font-bold text-emerald-700">CAREERBRIDGE JOB MARKETPLACE</p>
            <h1 className="text-4xl font-bold text-slate-950 md:text-5xl">Find work worth doing.</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600 md:text-lg">
              Search verified opportunities, apply directly, and manage your career from one focused workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-600">
              <MetricInline value={stats?.openJobs || 0} label="open roles" />
              <MetricInline value={stats?.employers || 0} label="approved employers" />
              <MetricInline value={stats?.applications || 0} label="applications tracked" />
            </div>
          </div>
        )}

        <form className="surface mb-5 grid gap-3 rounded-lg p-3 md:grid-cols-[minmax(220px,1fr)_minmax(180px,.7fr)_180px_auto]" onSubmit={submitSearch}>
          <SearchInput icon={Search} placeholder="Job title or keyword" value={filters.q} onChange={(q) => setFilters({ ...filters, q })} />
          <SearchInput icon={MapPin} placeholder="Location" value={filters.location} onChange={(location) => setFilters({ ...filters, location })} />
          <select className="field" value={filters.jobType} onChange={(event) => setFilters({ ...filters, jobType: event.target.value })}>
            <option value="">All job types</option>
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
            <option value="REMOTE">Remote</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
          <button className="btn-primary" type="submit"><SlidersHorizontal size={17} />Search</button>
        </form>

        <div className="grid min-h-[560px] overflow-hidden rounded-lg border border-slate-200 bg-white lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
              <p className="text-sm font-bold text-slate-900">{jobs.length} opportunities</p>
              <span className="text-xs text-slate-500">Newest first</span>
            </div>
            <div className="scrollbar-thin max-h-[680px] overflow-y-auto">
              {jobs.length ? jobs.map((job) => (
                <JobListItem key={job.id} job={job} active={selectedJob?.id === job.id} onClick={() => setSelectedJob(job)} />
              )) : <EmptyState icon={BriefcaseBusiness} title="No jobs found" text="Try a broader keyword or remove a filter." compact />}
            </div>
          </div>
          <div className="min-w-0">
            {selectedJob ? (
              <JobDetail
                job={selectedJob}
                user={user}
                isSeeker={isSeeker}
                onApply={() => isSeeker ? setApplyOpen(true) : onSignIn()}
              />
            ) : <EmptyState icon={Search} title="Choose an opportunity" text="Select a job to review the complete description." />}
          </div>
        </div>
      </div>
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={`Apply for ${selectedJob?.title || ''}`}>
        <p className="mb-4 text-sm text-slate-500">Your profile and CV will be connected to this application.</p>
        <TextArea label="Cover letter" value={coverLetter} onChange={setCoverLetter} placeholder="Why are you a strong fit for this role?" />
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setApplyOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={apply}><Send size={17} />Submit application</button>
        </div>
      </Modal>
    </div>
  );
}

function JobListItem({ job, active, onClick }) {
  return (
    <button className={`w-full border-b border-slate-100 p-4 text-left transition-colors ${active ? 'bg-emerald-50' : 'hover:bg-slate-50'}`} onClick={onClick}>
      <div className="flex items-start gap-3">
        <CompanyMark name={job.companyName || job.employerName} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-slate-950">{job.title}</h3>
          <p className="mt-1 truncate text-sm text-slate-600">{job.companyName || job.employerName}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span>{job.location}</span><span>·</span><span>{formatType(job.jobType)}</span>
          </div>
          {job.salary && <p className="mt-2 text-xs font-semibold text-emerald-700">{job.salary}</p>}
        </div>
        <ChevronRight className={active ? 'text-emerald-700' : 'text-slate-300'} size={18} />
      </div>
    </button>
  );
}

function JobDetail({ job, user, isSeeker, onApply }) {
  return (
    <article className="scrollbar-thin max-h-[735px] overflow-y-auto">
      <div className="border-b border-slate-200 p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 gap-4">
            <CompanyMark name={job.companyName || job.employerName} large />
            <div>
              <h2 className="text-2xl font-bold text-slate-950">{job.title}</h2>
              <p className="mt-1 font-semibold text-slate-600">{job.companyName || job.employerName}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin size={15} />{job.location}</span>
                <span className="flex items-center gap-1.5"><BriefcaseBusiness size={15} />{formatType(job.jobType)}</span>
                {job.salary && <span className="font-semibold text-emerald-700">{job.salary}</span>}
              </div>
            </div>
          </div>
          {(!user || isSeeker) && <button className="btn-primary" onClick={onApply}><Send size={17} />{user ? 'Apply now' : 'Sign in to apply'}</button>}
        </div>
      </div>
      <div className="space-y-7 p-5 md:p-7">
        <ContentSection title="About the role" content={job.description} />
        <ContentSection title="What you will need" content={job.requirements || 'The employer has not listed specific requirements.'} />
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase text-slate-500">Contact</h3>
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
            <Mail className="text-emerald-700" size={18} />
            <div>
              <p className="text-xs text-slate-500">Company email</p>
              <p className="text-sm font-semibold text-slate-900">{job.companyEmail || 'Not provided'}</p>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}

function AuthView({ onAuth, run, busy }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'JOB_SEEKER', companyName: '', companyEmail: '' });

  async function submit(event) {
    event.preventDefault();
    const payload = await run(() => jsonRequest(`/auth/${mode}`, 'POST', form), mode === 'login' ? 'Welcome back' : 'Account created');
    if (payload) onAuth(payload);
  }

  return (
    <div className="public-grid min-h-[calc(100vh-64px)] px-4 py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white md:grid-cols-[.85fr_1.15fr]">
        <aside className="bg-slate-950 p-7 text-white md:p-10">
          <Brand inverse />
          <h1 className="mt-12 text-3xl font-bold">Your career workspace, in one place.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">Apply for jobs, build your resume, track progress, publish roles, and manage candidates with focused tools.</p>
          <div className="mt-10 space-y-4">
            {['Verified employer accounts', 'Application tracking', 'Resume builder and downloads'].map((item) => (
              <div className="flex items-center gap-3 text-sm text-slate-200" key={item}>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-300"><Check size={14} /></span>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-slate-700 pt-5 text-xs text-slate-400">
            Demo admin: admin@example.com / admin123
          </div>
        </aside>
        <form className="p-6 md:p-10" onSubmit={submit}>
          <div className="mb-7 flex border-b border-slate-200">
            {['login', 'register'].map((item) => (
              <button
                type="button"
                key={item}
                className={`min-h-11 flex-1 border-b-2 text-sm font-bold capitalize ${mode === item ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'}`}
                onClick={() => setMode(item)}
              >{item}</button>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-slate-950">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">{mode === 'login' ? 'Enter your details to continue.' : 'Choose the workspace that fits your role.'}</p>
          <div className="space-y-4">
            {mode === 'register' && (
              <>
                <Field label="Full name" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
                <div>
                  <span className="label">I am joining as</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[['JOB_SEEKER', 'Job seeker', UserRound], ['EMPLOYER', 'Employer', Building2]].map(([value, label, Icon]) => (
                      <button
                        type="button"
                        key={value}
                        className={`flex min-h-20 items-center gap-3 rounded-md border p-3 text-left ${form.role === value ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        onClick={() => setForm({ ...form, role: value })}
                      ><Icon size={20} /><span className="text-sm font-bold">{label}</span></button>
                    ))}
                  </div>
                </div>
                {form.role === 'EMPLOYER' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company name" value={form.companyName} onChange={(companyName) => setForm({ ...form, companyName })} required />
                    <Field label="Company email" type="email" value={form.companyEmail} onChange={(companyEmail) => setForm({ ...form, companyEmail })} required />
                  </div>
                )}
              </>
            )}
            <Field label="Email address" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} required />
            <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} required />
            <button className="btn-primary w-full" type="submit" disabled={busy}>
              {mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={17} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DashboardView({ user, dashboard, applications, jobs, stats, navigate }) {
  if (!user) return null;
  const seeker = user.role === 'JOB_SEEKER';
  const employer = user.role === 'EMPLOYER';
  const values = employer
    ? [{ label: 'Active jobs', value: dashboard?.jobs || 0 }, { label: 'Applications', value: dashboard?.applications || 0 }]
    : seeker
      ? [{ label: 'Applications', value: dashboard?.applications || 0 }, { label: 'Job alerts', value: dashboard?.jobAlerts || 0 }]
      : Object.entries(stats || {}).slice(0, 4).map(([label, value]) => ({ label: splitCamel(label), value }));

  return (
    <div className="space-y-6">
      <PageHeader title={`Good day, ${firstName(user.name)}`} subtitle={dashboardSubtitle(user.role)} />
      {employer && !user.approved && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertCircle className="mt-0.5 shrink-0" size={19} />
          <div><p className="font-bold">Employer approval pending</p><p className="mt-1 text-sm">An administrator must approve your company before you can publish job posts.</p></div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {values.map((item) => <StatCard key={item.label} {...item} />)}
        {values.length < 4 && (
          <>
            <StatCard label={seeker ? 'Profile status' : 'Account status'} value={user.approved ? 'Ready' : 'Pending'} />
            <StatCard label="Account type" value={formatRole(user.role)} />
          </>
        )}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <section className="panel">
          <SectionHeader title={employer ? 'Recent candidates' : seeker ? 'Recent applications' : 'System snapshot'} />
          {(seeker || employer) && applications.length ? (
            <div className="divide-y divide-slate-100">
              {applications.slice(0, 5).map((application) => (
                <div className="flex items-center justify-between gap-4 py-4" key={application.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{application.jobTitle}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{employer ? application.seekerName : application.companyName}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              ))}
            </div>
          ) : <EmptyState icon={Send} title="Nothing here yet" text="Activity will appear as your workspace grows." compact />}
        </section>
        <section className="panel">
          <SectionHeader title="Quick actions" />
          <div className="space-y-2">
            {seeker && <QuickAction icon={Search} label="Explore open jobs" onClick={() => navigate('jobs')} />}
            {seeker && <QuickAction icon={FileText} label="Update your resume" onClick={() => navigate('cv')} />}
            {employer && <QuickAction icon={Plus} label="Publish a job" onClick={() => navigate('employer')} />}
            {employer && <QuickAction icon={Users} label="Review candidates" onClick={() => navigate('applications')} />}
            {user.role === 'ADMIN' && <QuickAction icon={ShieldCheck} label="Open administration" onClick={() => navigate('admin')} />}
            <QuickAction icon={Settings} label="Account settings" onClick={() => navigate('account')} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ApplicationsView({ applications, isEmployer, run, reload }) {
  async function updateStatus(id, status) {
    const result = await run(() => jsonRequest(`/applications/${id}`, 'PATCH', { status }), 'Application status updated');
    if (result) reload();
  }
  return (
    <div className="space-y-5">
      <PageHeader title={isEmployer ? 'Candidate pipeline' : 'My applications'} subtitle={isEmployer ? 'Review every applicant and move them through your hiring process.' : 'Track every role and its current status.'} />
      <div className="surface overflow-hidden rounded-lg">
        {applications.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Role</th><th className="px-4 py-3">{isEmployer ? 'Candidate' : 'Company'}</th><th className="px-4 py-3">Applied</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
              </thead>
              <tbody>{applications.map((application) => (
                <tr key={application.id}>
                  <td className="table-cell"><p className="font-bold text-slate-900">{application.jobTitle}</p>{application.coverLetter && <p className="mt-1 max-w-sm truncate text-xs text-slate-500">{application.coverLetter}</p>}</td>
                  <td className="table-cell">{isEmployer ? <><p className="font-semibold">{application.seekerName}</p><p className="text-xs">{application.seekerEmail}</p></> : application.companyName}</td>
                  <td className="table-cell">{formatDate(application.createdAt)}</td>
                  <td className="table-cell"><StatusBadge status={application.status} /></td>
                  <td className="table-cell">{isEmployer ? (
                    <select className="field min-h-9 w-40" value={application.status} onChange={(event) => updateStatus(application.id, event.target.value)}>
                      <option value="SUBMITTED">Submitted</option><option value="REVIEWING">Reviewing</option><option value="SHORTLISTED">Shortlisted</option><option value="REJECTED">Rejected</option>
                    </select>
                  ) : <span className="text-xs text-slate-400">No action needed</span>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <EmptyState icon={Send} title="No applications yet" text={isEmployer ? 'Applications will appear after candidates apply.' : 'Explore jobs and submit your first application.'} />}
      </div>
    </div>
  );
}

function CvView({ cv, setCv, templates, run, reload }) {
  async function save() {
    const result = await run(() => jsonRequest('/cv', 'PUT', cv), 'Resume saved');
    if (result) reload();
  }
  async function remove() {
    if (!confirm('Delete your resume profile?')) return;
    const result = await run(() => apiRequest('/cv', { method: 'DELETE' }), 'Resume deleted');
    if (result) reload();
  }
  async function upload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('cv', file);
    const result = await run(() => apiRequest('/cv/upload', { method: 'POST', body: form }), 'Resume file uploaded');
    if (result) reload();
  }
  async function download() {
    const text = await run(() => apiRequest('/cv/download'));
    if (!text) return;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'careerbridge-resume.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Resume builder" subtitle="Keep one polished profile ready for every application." actions={<div className="flex gap-2"><button className="btn-secondary" onClick={download}><Download size={17} />Download</button><button className="btn-primary" onClick={save}>Save changes</button></div>} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="panel space-y-5">
          <Field label="Professional headline" value={cv.headline || ''} onChange={(headline) => setCv({ ...cv, headline })} placeholder="Senior Java Developer" />
          <TextArea label="Professional summary" value={cv.summary || ''} onChange={(summary) => setCv({ ...cv, summary })} placeholder="Summarize your experience, strengths, and goals." />
          <TextArea label="Skills" value={cv.skills || ''} onChange={(skills) => setCv({ ...cv, skills })} placeholder="Java, JDBC, React, PostgreSQL..." />
          <TextArea label="Experience" value={cv.experience || ''} onChange={(experience) => setCv({ ...cv, experience })} placeholder="Company, role, dates, and achievements." />
          <TextArea label="Education" value={cv.education || ''} onChange={(education) => setCv({ ...cv, education })} placeholder="Institution, program, and graduation date." />
        </section>
        <aside className="space-y-4">
          <section className="panel">
            <SectionHeader title="Resume file" />
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <Upload className="mx-auto text-slate-400" size={24} />
              <p className="mt-2 text-sm font-bold text-slate-800">{cv.fileName || 'Upload an existing CV'}</p>
              <p className="mt-1 text-xs text-slate-500">PDF or document file</p>
              <label className="btn-secondary mt-4 cursor-pointer"><Upload size={16} />Choose file<input className="hidden" type="file" onChange={upload} /></label>
            </div>
          </section>
          <section className="panel">
            <SectionHeader title="Available templates" />
            <div className="space-y-2">{templates.map((template) => (
              <div className="rounded-md border border-slate-200 p-3" key={template.id}><p className="text-sm font-bold">{template.name}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{template.body}</p></div>
            ))}</div>
          </section>
          <button className="btn-ghost w-full text-red-600 hover:bg-red-50 hover:text-red-700" onClick={remove}><Trash2 size={17} />Delete resume profile</button>
        </aside>
      </div>
    </div>
  );
}

function AlertsView({ alerts, run, reload }) {
  const [modal, setModal] = useState(null);
  async function save(alert) {
    const editing = Boolean(alert.id);
    const result = await run(() => jsonRequest(`/job-alerts${editing ? `/${alert.id}` : ''}`, editing ? 'PUT' : 'POST', alert), editing ? 'Alert updated' : 'Alert created');
    if (result) { setModal(null); reload(); }
  }
  async function remove(id) {
    if (!confirm('Delete this job alert?')) return;
    const result = await run(() => apiRequest(`/job-alerts/${id}`, { method: 'DELETE' }), 'Alert deleted');
    if (result) reload();
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Job alerts" subtitle="Save focused searches and revisit matching roles." actions={<button className="btn-primary" onClick={() => setModal(emptyAlert)}><Plus size={17} />New alert</button>} />
      {alerts.length ? <div className="grid gap-4 lg:grid-cols-2">{alerts.map((alert) => (
        <article className="panel" key={alert.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-700"><Bell size={18} /></span><div><h3 className="font-bold text-slate-950">{alert.keyword || 'All roles'}</h3><p className="mt-1 text-sm text-slate-500">{alert.location || 'Any location'} · {formatType(alert.jobType) || 'Any type'}</p></div></div>
            <div className="flex gap-1"><button className="icon-btn" onClick={() => setModal(alert)} title="Edit alert"><Pencil size={16} /></button><button className="icon-btn text-red-600" onClick={() => remove(alert.id)} title="Delete alert"><Trash2 size={16} /></button></div>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4"><p className="mb-3 text-xs font-bold uppercase text-slate-400">{alert.matchingJobs?.length || 0} current matches</p>{(alert.matchingJobs || []).slice(0, 3).map((job) => <div className="flex items-center justify-between py-2 text-sm" key={job.id}><span className="font-semibold">{job.title}</span><span className="text-slate-500">{job.location}</span></div>)}</div>
        </article>
      ))}</div> : <div className="panel"><EmptyState icon={Bell} title="No job alerts" text="Create an alert to keep your favorite searches organized." /></div>}
      <AlertFormModal alert={modal} onClose={() => setModal(null)} onSave={save} />
    </div>
  );
}

function EmployerView({ jobs, user, run, reload }) {
  const [editing, setEditing] = useState(null);
  async function save(job) {
    const exists = Boolean(job.id);
    const result = await run(() => jsonRequest(`/jobs${exists ? `/${job.id}` : ''}`, exists ? 'PUT' : 'POST', job), exists ? 'Job updated' : 'Job published');
    if (result) { setEditing(null); reload(); }
  }
  async function remove(id) {
    if (!confirm('Delete this job post and its applications?')) return;
    const result = await run(() => apiRequest(`/jobs/${id}`, { method: 'DELETE' }), 'Job deleted');
    if (result) reload();
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Job posts" subtitle="Publish opportunities and manage every active listing." actions={<button className="btn-primary" disabled={!user.approved} onClick={() => setEditing(emptyJob)}><Plus size={17} />Post a job</button>} />
      {!user.approved && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Your company must be approved before publishing jobs.</div>}
      <div className="surface overflow-hidden rounded-lg">
        {jobs.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Position</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody>{jobs.map((job) => <tr key={job.id}><td className="table-cell"><p className="font-bold text-slate-900">{job.title}</p><p className="mt-1 text-xs">{job.salary || 'Salary not listed'}</p></td><td className="table-cell">{job.location}</td><td className="table-cell">{formatType(job.jobType)}</td><td className="table-cell"><StatusBadge status={job.status} /></td><td className="table-cell"><div className="flex justify-end gap-1"><button className="icon-btn" onClick={() => setEditing(job)} title="Edit job"><Pencil size={16} /></button><button className="icon-btn text-red-600" onClick={() => remove(job.id)} title="Delete job"><Trash2 size={16} /></button></div></td></tr>)}</tbody>
        </table></div> : <EmptyState icon={BriefcaseBusiness} title="No job posts" text="Publish your first opportunity to start receiving applications." />}
      </div>
      <JobFormModal job={editing} onClose={() => setEditing(null)} onSave={save} />
    </div>
  );
}

function AdminView({ users, stats, templates, run, reload }) {
  const [userModal, setUserModal] = useState(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  async function approve(id) {
    const result = await run(() => jsonRequest(`/admin/users/${id}/approve`, 'PATCH', {}), 'Employer approved');
    if (result) reload();
  }
  async function toggle(item) {
    const result = await run(() => jsonRequest(`/admin/users/${item.id}/active`, 'PATCH', { active: !item.active }), `User ${item.active ? 'disabled' : 'enabled'}`);
    if (result) reload();
  }
  async function saveUser(item) {
    const exists = Boolean(item.id);
    const result = await run(() => jsonRequest(`/admin/users${exists ? `/${item.id}` : ''}`, exists ? 'PUT' : 'POST', item), exists ? 'User updated' : 'User created');
    if (result) { setUserModal(null); reload(); }
  }
  async function deleteUser(id) {
    if (!confirm('Disable and remove access for this user?')) return;
    const result = await run(() => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }), 'User deleted');
    if (result) reload();
  }
  async function addTemplate(template) {
    const result = await run(() => jsonRequest('/admin/cv-templates', 'POST', template), 'Template created');
    if (result) { setTemplateOpen(false); reload(); }
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Administration" subtitle="Monitor the platform, approve employers, and manage access." actions={<button className="btn-primary" onClick={() => setUserModal(emptyUser)}><Plus size={17} />Add user</button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(stats || {}).slice(0, 8).map(([label, value]) => <StatCard key={label} label={splitCamel(label)} value={value} />)}
      </div>
      <section className="surface overflow-hidden rounded-lg">
        <div className="flex items-center justify-between border-b border-slate-200 p-4"><div><h2 className="font-bold text-slate-950">User management</h2><p className="mt-1 text-xs text-slate-500">{users.length} total accounts</p></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Approval</th><th className="px-4 py-3">Access</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody>{users.map((item) => <tr key={item.id}><td className="table-cell"><div className="flex items-center gap-3"><Avatar name={item.name} small /><div><p className="font-bold text-slate-900">{item.name}</p><p className="text-xs">{item.email}</p></div></div></td><td className="table-cell">{formatRole(item.role)}</td><td className="table-cell">{item.companyName || '—'}</td><td className="table-cell">{item.role === 'EMPLOYER' && !item.approved ? <button className="btn-secondary min-h-8 px-3 text-xs" onClick={() => approve(item.id)}>Approve</button> : <span className="text-emerald-700">Approved</span>}</td><td className="table-cell"><StatusBadge status={item.active ? 'ACTIVE' : 'DISABLED'} /></td><td className="table-cell"><div className="flex justify-end gap-1"><button className="icon-btn" onClick={() => setUserModal(item)} title="Edit user"><Pencil size={16} /></button><button className="icon-btn" onClick={() => toggle(item)} title={item.active ? 'Disable user' : 'Enable user'}><MoreHorizontal size={17} /></button><button className="icon-btn text-red-600" onClick={() => deleteUser(item.id)} title="Delete user"><Trash2 size={16} /></button></div></td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="panel">
        <SectionHeader title="Resume templates" action={<button className="btn-secondary" onClick={() => setTemplateOpen(true)}><Plus size={16} />New template</button>} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{templates.map((template) => <div className="rounded-md border border-slate-200 p-4" key={template.id}><FileText className="text-emerald-700" size={20} /><p className="mt-3 font-bold">{template.name}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{template.body}</p></div>)}</div>
      </section>
      <UserFormModal user={userModal} onClose={() => setUserModal(null)} onSave={saveUser} />
      <TemplateModal open={templateOpen} onClose={() => setTemplateOpen(false)} onSave={addTemplate} />
    </div>
  );
}

function AccountView({ user, token, run, onAuthUpdate, onDeleted }) {
  const [form, setForm] = useState(user);
  async function save(event) {
    event.preventDefault();
    const updated = await run(() => jsonRequest('/account', 'PUT', form), 'Account updated');
    if (updated) onAuthUpdate({ token, user: updated });
  }
  async function remove() {
    if (!confirm('Delete your account? You will lose access immediately.')) return;
    const result = await run(() => apiRequest('/account', { method: 'DELETE' }), 'Account deleted');
    if (result) onDeleted();
  }
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Account settings" subtitle="Manage your profile and organization details." />
      <form className="panel space-y-5" onSubmit={save}>
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5"><Avatar name={form.name} /><div><p className="font-bold text-slate-950">{form.name}</p><p className="text-sm text-slate-500">{formatRole(form.role)}</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={form.name || ''} onChange={(name) => setForm({ ...form, name })} />
          <Field label="Email address" type="email" value={form.email || ''} onChange={(email) => setForm({ ...form, email })} />
          {user.role === 'EMPLOYER' && <><Field label="Company name" value={form.companyName || ''} onChange={(companyName) => setForm({ ...form, companyName })} /><Field label="Company email" type="email" value={form.companyEmail || ''} onChange={(companyEmail) => setForm({ ...form, companyEmail })} /></>}
        </div>
        <div className="flex justify-end"><button className="btn-primary" type="submit">Save changes</button></div>
      </form>
      <section className="rounded-lg border border-red-200 bg-white p-5"><h2 className="font-bold text-red-700">Delete account</h2><p className="mt-1 text-sm text-slate-500">This disables your profile and signs you out.</p><button className="btn-danger mt-4" onClick={remove}><Trash2 size={17} />Delete account</button></section>
    </div>
  );
}

function JobFormModal({ job, onClose, onSave }) {
  const [form, setForm] = useState(job || emptyJob);
  useEffect(() => setForm(job || emptyJob), [job]);
  return <Modal open={Boolean(job)} onClose={onClose} title={job?.id ? 'Edit job post' : 'Create job post'} wide>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Job title" value={form.title} onChange={(title) => setForm({ ...form, title })} required />
      <Field label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} required />
      <Select label="Job type" value={form.jobType} onChange={(jobType) => setForm({ ...form, jobType })} options={jobTypeOptions} />
      <Field label="Salary range" value={form.salary || ''} onChange={(salary) => setForm({ ...form, salary })} placeholder="$60,000 - $80,000" />
      <div className="sm:col-span-2"><TextArea label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} required /></div>
      <div className="sm:col-span-2"><TextArea label="Requirements" value={form.requirements || ''} onChange={(requirements) => setForm({ ...form, requirements })} /></div>
      {job?.id && <Select label="Status" value={form.status} onChange={(status) => setForm({ ...form, status })} options={[['OPEN', 'Open'], ['CLOSED', 'Closed']]} />}
    </div>
    <ModalActions onClose={onClose} onSave={() => onSave(form)} saveLabel={job?.id ? 'Save changes' : 'Publish job'} />
  </Modal>;
}

function AlertFormModal({ alert, onClose, onSave }) {
  const [form, setForm] = useState(alert || emptyAlert);
  useEffect(() => setForm(alert || emptyAlert), [alert]);
  return <Modal open={Boolean(alert)} onClose={onClose} title={alert?.id ? 'Edit job alert' : 'Create job alert'}>
    <div className="space-y-4">
      <Field label="Keyword" value={form.keyword || ''} onChange={(keyword) => setForm({ ...form, keyword })} placeholder="Java developer" />
      <Field label="Location" value={form.location || ''} onChange={(location) => setForm({ ...form, location })} placeholder="Addis Ababa" />
      <Select label="Job type" value={form.jobType || ''} onChange={(jobType) => setForm({ ...form, jobType })} options={[['', 'Any type'], ...jobTypeOptions]} />
      <Toggle label="Alert active" checked={form.active !== false} onChange={(active) => setForm({ ...form, active })} />
    </div>
    <ModalActions onClose={onClose} onSave={() => onSave(form)} saveLabel={alert?.id ? 'Save alert' : 'Create alert'} />
  </Modal>;
}

function UserFormModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user || emptyUser);
  useEffect(() => setForm(user || emptyUser), [user]);
  return <Modal open={Boolean(user)} onClose={onClose} title={user?.id ? 'Edit user' : 'Create user'} wide>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" value={form.name || ''} onChange={(name) => setForm({ ...form, name })} required />
      <Field label="Email" type="email" value={form.email || ''} onChange={(email) => setForm({ ...form, email })} required />
      {!user?.id && <Field label="Temporary password" type="password" value={form.password || ''} onChange={(password) => setForm({ ...form, password })} required />}
      <Select label="Role" value={form.role} onChange={(role) => setForm({ ...form, role })} options={[['JOB_SEEKER', 'Job seeker'], ['EMPLOYER', 'Employer'], ['ADMIN', 'Admin']]} />
      {form.role === 'EMPLOYER' && <><Field label="Company name" value={form.companyName || ''} onChange={(companyName) => setForm({ ...form, companyName })} /><Field label="Company email" value={form.companyEmail || ''} onChange={(companyEmail) => setForm({ ...form, companyEmail })} /></>}
      <Toggle label="Account active" checked={form.active !== false} onChange={(active) => setForm({ ...form, active })} />
      {form.role === 'EMPLOYER' && <Toggle label="Employer approved" checked={form.approved === true} onChange={(approved) => setForm({ ...form, approved })} />}
    </div>
    <ModalActions onClose={onClose} onSave={() => onSave(form)} saveLabel={user?.id ? 'Save user' : 'Create user'} />
  </Modal>;
}

function TemplateModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', body: '' });
  useEffect(() => { if (open) setForm({ name: '', body: '' }); }, [open]);
  return <Modal open={open} onClose={onClose} title="Create resume template">
    <div className="space-y-4"><Field label="Template name" value={form.name} onChange={(name) => setForm({ ...form, name })} /><TextArea label="Template body" value={form.body} onChange={(body) => setForm({ ...form, body })} placeholder="Use {{name}}, {{headline}}, {{summary}}..." /></div>
    <ModalActions onClose={onClose} onSave={() => onSave(form)} saveLabel="Create template" />
  </Modal>;
}

function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4"><h2 className="text-lg font-bold text-slate-950">{title}</h2><button className="icon-btn border-0" onClick={onClose}><X size={19} /></button></div>
      <div className="p-5">{children}</div>
    </div>
  </div>;
}

function ModalActions({ onClose, onSave, saveLabel }) {
  return <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={onSave}>{saveLabel}</button></div>;
}

function Notice({ notice, onClose }) {
  return <div className={`fixed right-4 top-20 z-[90] flex max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-xl ${notice.type === 'error' ? 'border-red-200' : 'border-emerald-200'}`}>
    {notice.type === 'error' ? <AlertCircle className="shrink-0 text-red-600" size={19} /> : <CheckCircle2 className="shrink-0 text-emerald-600" size={19} />}
    <p className="flex-1 text-sm font-semibold text-slate-800">{notice.text}</p><button onClick={onClose}><X size={17} /></button>
  </div>;
}

function Brand({ onClick, compact = false, inverse = false }) {
  return <button className="flex items-center gap-2.5 text-left" onClick={onClick}>
    <span className={`grid h-9 w-9 place-items-center rounded-md ${inverse ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white'}`}><BriefcaseBusiness size={19} /></span>
    {!compact && <span className={`text-base font-bold ${inverse ? 'text-white' : 'text-slate-950'}`}>CareerBridge</span>}
  </button>;
}

function Avatar({ name = 'User', small = false }) {
  return <span className={`grid shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800 ${small ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'}`}>{initials(name)}</span>;
}

function CompanyMark({ name = 'Company', large = false }) {
  return <span className={`grid shrink-0 place-items-center rounded-md border border-slate-200 bg-slate-50 font-bold text-slate-700 ${large ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm'}`}>{initials(name)}</span>;
}

function PageHeader({ title, subtitle, actions }) {
  return <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="page-title">{title}</h1>{subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}</div>{actions}</div>;
}

function SectionHeader({ title, action }) {
  return <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-base font-bold text-slate-950">{title}</h2>{action}</div>;
}

function Field({ label, value, onChange, type = 'text', placeholder, required = false }) {
  return <label className="block"><span className="label">{label}</span><input className="field" type={type} value={value} placeholder={placeholder} required={required} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, onChange, placeholder, required = false }) {
  return <label className="block"><span className="label">{label}</span><textarea className="textarea" value={value} placeholder={placeholder} required={required} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, onChange, options }) {
  return <label className="block"><span className="label">{label}</span><select className="field" value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>;
}

function Toggle({ label, checked, onChange }) {
  return <label className="flex min-h-11 items-center justify-between rounded-md border border-slate-200 px-3"><span className="text-sm font-semibold text-slate-700">{label}</span><input className="h-4 w-4 accent-emerald-600" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}

function SearchInput({ icon: Icon, value, onChange, placeholder }) {
  return <label className="relative block"><Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input className="field pl-10" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function StatCard({ label, value }) {
  return <div className="panel"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-3 text-3xl font-bold text-slate-950">{value}</p></div>;
}

function MetricInline({ value, label }) {
  return <span><strong className="text-slate-950">{value}</strong> {label}</span>;
}

function StatusBadge({ status }) {
  const normalized = status || 'UNKNOWN';
  const good = ['ACTIVE', 'OPEN', 'SHORTLISTED', 'APPROVED'].includes(normalized);
  const bad = ['REJECTED', 'DISABLED', 'CLOSED'].includes(normalized);
  return <span className={`badge ${good ? 'bg-emerald-50 text-emerald-700' : bad ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{formatType(normalized)}</span>;
}

function QuickAction({ icon: Icon, label, onClick }) {
  return <button className="flex min-h-12 w-full items-center gap-3 rounded-md border border-slate-200 px-3 text-left text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800" onClick={onClick}><Icon size={18} /><span className="flex-1">{label}</span><ChevronRight size={16} /></button>;
}

function EmptyState({ icon: Icon, title, text, compact = false }) {
  return <div className={`grid place-items-center text-center ${compact ? 'min-h-52 p-5' : 'min-h-80 p-8'}`}><div><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500"><Icon size={20} /></span><h3 className="mt-3 font-bold text-slate-900">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p></div></div>;
}

function ContentSection({ title, content }) {
  return <section><h3 className="mb-3 text-sm font-bold uppercase text-slate-500">{title}</h3><p className="whitespace-pre-line text-sm leading-7 text-slate-700">{content}</p></section>;
}

const jobTypeOptions = [['FULL_TIME', 'Full time'], ['PART_TIME', 'Part time'], ['REMOTE', 'Remote'], ['INTERNSHIP', 'Internship']];
const formatType = (value = '') => value ? value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : '';
const formatRole = (value = '') => formatType(value);
const splitCamel = (value) => value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'CB';
const firstName = (name = '') => name.split(' ')[0] || 'there';
const formatDate = (value) => value ? new Date(value.replace(' ', 'T')).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const dashboardSubtitle = (role) => role === 'JOB_SEEKER' ? 'Track your search and keep your profile ready.' : role === 'EMPLOYER' ? 'Manage open roles and candidate activity.' : 'Monitor platform activity and user access.';

export default App;
