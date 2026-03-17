import {
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Send,
  Settings,
  Trash2,
  Upload,
  UserRound,
  Users,
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

const emptyCv = {
  headline: '',
  summary: '',
  skills: '',
  experience: '',
  education: '',
};

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('jobsite_token');
    const user = localStorage.getItem('jobsite_user');
    return token && user ? { token, user: JSON.parse(user) } : null;
  });
  const [view, setView] = useState('home');
  const [jobs, setJobs] = useState([]);
  const [landing, setLanding] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [applications, setApplications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [cv, setCv] = useState(emptyCv);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [filters, setFilters] = useState({ q: '', location: '', jobType: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const user = auth?.user;
  const isSeeker = user?.role === 'JOB_SEEKER';
  const isEmployer = user?.role === 'EMPLOYER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadLanding();
    loadJobs();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
    if (isSeeker) {
      loadApplications();
      loadCv();
      loadAlerts();
    }
    if (isEmployer) {
      loadApplications();
    }
    if (isAdmin) {
      loadAdmin();
    }
  }, [auth?.token]);

  useEffect(() => {
    if (view === 'employer' && isEmployer) {
      loadJobs({ scope: 'EMPLOYER' });
    }
  }, [view, user?.role]);

  const navigation = useMemo(() => {
    const items = [
      ['home', 'Home', BriefcaseBusiness],
      ['jobs', 'Jobs', Search],
    ];
    if (user) items.push(['dashboard', 'Dashboard', LayoutDashboard]);
    if (isSeeker) {
      items.push(['applications', 'Applications', Send], ['cv', 'CV', FileText], ['alerts', 'Alerts', Bell]);
    }
    if (isEmployer) {
      items.push(['employer', 'Employer', Building2], ['applications', 'Applications', Users]);
    }
    if (isAdmin) {
      items.push(['admin', 'Admin', Settings]);
    }
    return items;
  }, [user?.role]);

  async function run(action, success) {
    setError('');
    setMessage('');
    try {
      const result = await action();
      if (success) setMessage(success);
      return result;
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong');
      return null;
    }
  }

  async function loadLanding() {
    const result = await run(() => apiRequest('/public/landing'));
    if (result) setLanding(result);
  }

  async function loadJobs(nextFilters = filters) {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const result = await run(() => apiRequest(`/jobs${params.toString() ? `?${params}` : ''}`));
    if (result) setJobs(result);
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

  async function logout() {
    await run(() => jsonRequest('/auth/logout', 'POST'), 'Signed out');
    localStorage.removeItem('jobsite_token');
    localStorage.removeItem('jobsite_user');
    setAuth(null);
    setView('home');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <button className="flex items-center gap-3 text-left" onClick={() => setView('home')}>
            <span className="grid h-10 w-10 place-items-center rounded-md bg-moss text-white">
              <BriefcaseBusiness size={22} />
            </span>
            <span>
              <span className="block text-lg font-bold text-ink">CareerBridge</span>
              <span className="block text-xs text-slate-500">Professional job marketplace</span>
            </span>
          </button>
          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map(([id, label, Icon]) => (
              <button
                key={id}
                className={`btn px-3 py-2 ${view === id ? 'bg-white text-moss shadow-sm' : 'text-slate-600 hover:bg-white'}`}
                onClick={() => setView(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button className="btn-secondary hidden sm:inline-flex" onClick={() => setView('account')}>
                  <UserRound size={16} />
                  {user.name}
                </button>
                <button className="btn-secondary px-3" onClick={logout} title="Log out">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => setView('auth')}>
                <UserRound size={16} />
                Sign in
              </button>
            )}
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 md:hidden">
          {navigation.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`btn shrink-0 px-3 py-2 ${view === id ? 'bg-white text-moss shadow-sm' : 'text-slate-600'}`}
              onClick={() => setView(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Status message={message} error={error} />
        {view === 'home' && <Home landing={landing} jobs={jobs.slice(0, 4)} onViewJobs={() => setView('jobs')} />}
        {view === 'auth' && <AuthView onAuth={saveAuth} run={run} />}
        {view === 'jobs' && (
          <JobsView
            jobs={jobs}
            filters={filters}
            setFilters={setFilters}
            loadJobs={loadJobs}
            isSeeker={isSeeker}
            run={run}
            reloadApplications={loadApplications}
          />
        )}
        {view === 'dashboard' && <DashboardView user={user} dashboard={dashboard} setView={setView} />}
        {view === 'applications' && (
          <ApplicationsView applications={applications} isEmployer={isEmployer} run={run} reload={loadApplications} />
        )}
        {view === 'cv' && isSeeker && <CvView cv={cv} setCv={setCv} templates={templates} run={run} reload={loadCv} />}
        {view === 'alerts' && isSeeker && <AlertsView alerts={alerts} run={run} reload={loadAlerts} />}
        {view === 'employer' && isEmployer && (
          <EmployerView jobs={jobs} run={run} reload={() => loadJobs({ scope: 'EMPLOYER' })} />
        )}
        {view === 'admin' && isAdmin && (
          <AdminView users={adminUsers} stats={adminStats} templates={templates} run={run} reload={loadAdmin} />
        )}
        {view === 'account' && user && <AccountView user={user} run={run} onAuthUpdate={saveAuth} />}
      </main>
    </div>
  );
}

function Status({ message, error }) {
  if (!message && !error) return null;
  return (
    <div className={`mb-4 flex items-center gap-2 rounded-md border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
      {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      {error || message}
    </div>
  );
}

function Home({ landing, jobs, onViewJobs }) {
  const stats = landing?.stats || {};
  return (
    <div className="space-y-8">
      <section className="grid min-h-[560px] items-center gap-8 rounded-lg bg-[linear-gradient(rgba(31,41,51,0.66),rgba(31,41,51,0.45)),url('https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center px-6 py-10 text-white md:grid-cols-[1.05fr_0.95fr] md:px-10">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-100">Interactive Job Site</p>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">CareerBridge</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-100">
            A polished job marketplace for seekers, employers, and admins with applications, CV tools, approvals, and searchable listings.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn-primary bg-white text-ink hover:bg-emerald-50" onClick={onViewJobs}>
              <Search size={18} />
              Browse jobs
            </button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Open jobs" value={stats.openJobs || 0} />
          <Stat label="Employers" value={stats.employers || 0} />
          <Stat label="Applications" value={stats.applications || 0} />
          <Stat label="CV profiles" value={stats.cvProfiles || 0} />
        </div>
      </section>
      <section>
        <SectionTitle title="Featured roles" action={<button className="btn-secondary" onClick={onViewJobs}>View all</button>} />
        <JobGrid jobs={jobs} />
      </section>
    </div>
  );
}

function AuthView({ onAuth, run }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'JOB_SEEKER', companyName: '', companyEmail: '' });

  async function submit(event) {
    event.preventDefault();
    const payload = await run(() => jsonRequest(`/auth/${mode}`, 'POST', form), mode === 'login' ? 'Welcome back' : 'Account created');
    if (payload) onAuth(payload);
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[0.9fr_1.1fr]">
      <div className="panel bg-marine text-white">
        <h2 className="text-3xl font-bold">Access your workspace</h2>
        <p className="mt-3 text-slate-100">Use one account type per workflow: job seeker, employer, or admin. Employers can post jobs after admin approval.</p>
        <div className="mt-6 rounded-md bg-white/10 p-4 text-sm">
          Admin demo: <span className="font-semibold">admin@example.com</span> / <span className="font-semibold">admin123</span>
        </div>
      </div>
      <form className="panel space-y-4" onSubmit={submit}>
        <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
          {['login', 'register'].map((item) => (
            <button
              type="button"
              key={item}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold capitalize ${mode === item ? 'bg-white text-moss shadow-sm' : 'text-slate-500'}`}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </div>
        {mode === 'register' && (
          <>
            <Field label="Full name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
            <label className="block space-y-1">
              <span className="label">Role</span>
              <select className="field" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="JOB_SEEKER">Job seeker</option>
                <option value="EMPLOYER">Employer</option>
              </select>
            </label>
            {form.role === 'EMPLOYER' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company name" value={form.companyName} onChange={(companyName) => setForm({ ...form, companyName })} />
                <Field label="Company email" value={form.companyEmail} onChange={(companyEmail) => setForm({ ...form, companyEmail })} />
              </div>
            )}
          </>
        )}
        <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        <button className="btn-primary w-full" type="submit">
          <UserRound size={18} />
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </section>
  );
}

function JobsView({ jobs, filters, setFilters, loadJobs, isSeeker, run, reloadApplications }) {
  const [coverLetters, setCoverLetters] = useState({});

  async function apply(jobId) {
    const result = await run(
      () => jsonRequest('/applications', 'POST', { jobId, coverLetter: coverLetters[jobId] || '' }),
      'Application submitted',
    );
    if (result) reloadApplications();
  }

  return (
    <section className="space-y-5">
      <SectionTitle title="Find jobs" subtitle="Search by title, description, location, and job type." />
      <div className="panel grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
        <Field label="Keyword" value={filters.q} onChange={(q) => setFilters({ ...filters, q })} />
        <Field label="Location" value={filters.location} onChange={(location) => setFilters({ ...filters, location })} />
        <label className="block space-y-1">
          <span className="label">Type</span>
          <select className="field" value={filters.jobType} onChange={(event) => setFilters({ ...filters, jobType: event.target.value })}>
            <option value="">Any</option>
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
            <option value="REMOTE">Remote</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </label>
        <button className="btn-primary self-end" onClick={() => loadJobs(filters)}>
          <Search size={18} />
          Search
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {jobs.map((job) => (
          <article className="panel" key={job.id}>
            <JobHeader job={job} />
            <p className="mt-3 line-clamp-3 text-sm text-slate-600">{job.description}</p>
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              Company email: <span className="font-semibold text-ink">{job.companyEmail || 'Not provided'}</span>
            </div>
            {isSeeker && (
              <div className="mt-4 space-y-3">
                <textarea
                  className="field min-h-24"
                  placeholder="Cover letter"
                  value={coverLetters[job.id] || ''}
                  onChange={(event) => setCoverLetters({ ...coverLetters, [job.id]: event.target.value })}
                />
                <button className="btn-primary" onClick={() => apply(job.id)}>
                  <Send size={16} />
                  Apply
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function DashboardView({ user, dashboard, setView }) {
  if (!user) return <AuthNotice setView={setView} />;
  const entries = Object.entries(dashboard || {});
  return (
    <section className="space-y-5">
      <SectionTitle title={`${user.role.replace('_', ' ')} dashboard`} subtitle={`Welcome, ${user.name}.`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map(([key, value]) => <Stat key={key} label={key.replace(/([A-Z])/g, ' $1')} value={value} />)}
      </div>
      {user.role === 'EMPLOYER' && !user.approved && (
        <div className="rounded-md border border-gold bg-yellow-50 p-4 text-sm text-amber-800">
          Your employer account is waiting for admin approval before you can post jobs.
        </div>
      )}
    </section>
  );
}

function ApplicationsView({ applications, isEmployer, run, reload }) {
  async function updateStatus(id, status) {
    const result = await run(() => jsonRequest(`/applications/${id}`, 'PATCH', { status }), 'Application updated');
    if (result) reload();
  }

  return (
    <section className="space-y-5">
      <SectionTitle title="Applications" subtitle={isEmployer ? 'Review candidates and update status.' : 'Track the roles you applied for.'} />
      <div className="grid gap-4">
        {applications.map((application) => (
          <article className="panel" key={application.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{application.jobTitle}</h3>
                <p className="text-sm text-slate-500">{application.companyName}</p>
                {isEmployer && <p className="mt-1 text-sm text-slate-600">{application.seekerName} · {application.seekerEmail}</p>}
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-moss">{application.status}</span>
            </div>
            {application.coverLetter && <p className="mt-3 text-sm text-slate-600">{application.coverLetter}</p>}
            {isEmployer && (
              <div className="mt-4 flex flex-wrap gap-2">
                {['REVIEWING', 'SHORTLISTED', 'REJECTED'].map((status) => (
                  <button key={status} className="btn-secondary" onClick={() => updateStatus(application.id, status)}>
                    {status}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function CvView({ cv, setCv, templates, run, reload }) {
  async function save() {
    const result = await run(() => jsonRequest('/cv', 'PUT', cv), 'CV saved');
    if (result) reload();
  }

  async function remove() {
    const result = await run(() => apiRequest('/cv', { method: 'DELETE' }), 'CV deleted');
    if (result) reload();
  }

  async function upload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('cv', file);
    const result = await run(() => apiRequest('/cv/upload', { method: 'POST', body: form }), 'CV uploaded');
    if (result) reload();
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="panel space-y-4">
        <SectionTitle title="CV builder" subtitle="Create a downloadable text CV and optionally upload an existing file." />
        <Field label="Headline" value={cv.headline || ''} onChange={(headline) => setCv({ ...cv, headline })} />
        <TextArea label="Summary" value={cv.summary || ''} onChange={(summary) => setCv({ ...cv, summary })} />
        <TextArea label="Skills" value={cv.skills || ''} onChange={(skills) => setCv({ ...cv, skills })} />
        <TextArea label="Experience" value={cv.experience || ''} onChange={(experience) => setCv({ ...cv, experience })} />
        <TextArea label="Education" value={cv.education || ''} onChange={(education) => setCv({ ...cv, education })} />
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={save}><FileText size={16} />Save CV</button>
          <a className="btn-secondary" href="http://localhost:8080/api/cv/download" onClick={(event) => {
            event.preventDefault();
            apiRequest('/cv/download').then((text) => {
              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'cv.txt';
              link.click();
              URL.revokeObjectURL(url);
            });
          }}>
            <Download size={16} />Download
          </a>
          <button className="btn-danger" onClick={remove}><Trash2 size={16} />Delete</button>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="panel">
          <h3 className="font-bold">Upload CV</h3>
          <label className="btn-secondary mt-4 w-full cursor-pointer">
            <Upload size={16} />
            Choose file
            <input className="hidden" type="file" onChange={upload} />
          </label>
          {cv.fileName && <p className="mt-3 text-sm text-slate-600">Uploaded: {cv.fileName}</p>}
        </div>
        <div className="panel">
          <h3 className="font-bold">Templates</h3>
          <div className="mt-3 space-y-3">
            {templates.map((template) => (
              <div className="rounded-md border border-slate-200 p-3 text-sm" key={template.id}>
                <p className="font-semibold">{template.name}</p>
                <p className="mt-1 line-clamp-4 text-slate-500">{template.body}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

function AlertsView({ alerts, run, reload }) {
  const [form, setForm] = useState({ keyword: '', location: '', jobType: '', active: true });

  async function create(event) {
    event.preventDefault();
    const result = await run(() => jsonRequest('/job-alerts', 'POST', form), 'Job alert created');
    if (result) {
      setForm({ keyword: '', location: '', jobType: '', active: true });
      reload();
    }
  }

  async function remove(id) {
    const result = await run(() => apiRequest(`/job-alerts/${id}`, { method: 'DELETE' }), 'Job alert deleted');
    if (result) reload();
  }

  return (
    <section className="space-y-5">
      <SectionTitle title="Job alerts" subtitle="Save searches and see matching open jobs." />
      <form className="panel grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]" onSubmit={create}>
        <Field label="Keyword" value={form.keyword} onChange={(keyword) => setForm({ ...form, keyword })} />
        <Field label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} />
        <label className="block space-y-1">
          <span className="label">Type</span>
          <select className="field" value={form.jobType} onChange={(event) => setForm({ ...form, jobType: event.target.value })}>
            <option value="">Any</option>
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
            <option value="REMOTE">Remote</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </label>
        <button className="btn-primary self-end" type="submit"><Bell size={16} />Create</button>
      </form>
      <div className="grid gap-4">
        {alerts.map((alert) => (
          <article className="panel" key={alert.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{alert.keyword || 'Any keyword'} · {alert.location || 'Any location'}</h3>
                <p className="text-sm text-slate-500">{alert.matchingJobs?.length || 0} matching jobs</p>
              </div>
              <button className="btn-danger px-3" onClick={() => remove(alert.id)}><Trash2 size={16} /></button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(alert.matchingJobs || []).slice(0, 4).map((job) => <MiniJob key={job.id} job={job} />)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmployerView({ jobs, run, reload }) {
  const [form, setForm] = useState(emptyJob);

  async function submit(event) {
    event.preventDefault();
    const result = await run(() => jsonRequest('/jobs', 'POST', form), 'Job posted');
    if (result) {
      setForm(emptyJob);
      reload();
    }
  }

  async function remove(id) {
    const result = await run(() => apiRequest(`/jobs/${id}`, { method: 'DELETE' }), 'Job deleted');
    if (result) reload();
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <form className="panel space-y-4" onSubmit={submit}>
        <SectionTitle title="Post a job" />
        <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <Field label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="label">Type</span>
            <select className="field" value={form.jobType} onChange={(event) => setForm({ ...form, jobType: event.target.value })}>
              <option value="FULL_TIME">Full time</option>
              <option value="PART_TIME">Part time</option>
              <option value="REMOTE">Remote</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </label>
          <Field label="Salary" value={form.salary} onChange={(salary) => setForm({ ...form, salary })} />
        </div>
        <TextArea label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        <TextArea label="Requirements" value={form.requirements} onChange={(requirements) => setForm({ ...form, requirements })} />
        <button className="btn-primary w-full" type="submit"><Plus size={16} />Post job</button>
      </form>
      <div className="space-y-4">
        <SectionTitle title="Manage jobs" />
        {jobs.map((job) => (
          <article className="panel" key={job.id}>
            <div className="flex items-start justify-between gap-3">
              <JobHeader job={job} />
              <button className="btn-danger px-3" onClick={() => remove(job.id)}><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AdminView({ users, stats, templates, run, reload }) {
  const [template, setTemplate] = useState({ name: '', body: '' });

  async function approve(id) {
    const result = await run(() => jsonRequest(`/admin/users/${id}/approve`, 'PATCH', {}), 'Employer approved');
    if (result) reload();
  }

  async function toggle(id, active) {
    const result = await run(() => jsonRequest(`/admin/users/${id}/active`, 'PATCH', { active }), 'User updated');
    if (result) reload();
  }

  async function addTemplate(event) {
    event.preventDefault();
    const result = await run(() => jsonRequest('/admin/cv-templates', 'POST', template), 'Template created');
    if (result) {
      setTemplate({ name: '', body: '' });
      reload();
    }
  }

  return (
    <section className="space-y-5">
      <SectionTitle title="Admin console" subtitle="Manage users, employer approvals, templates, and system health." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(stats || {}).map(([key, value]) => <Stat key={key} label={key.replace(/([A-Z])/g, ' $1')} value={value} />)}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <div className="panel overflow-x-auto">
          <h3 className="mb-4 text-lg font-bold">Users</h3>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Approved</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr className="border-b border-slate-100" key={item.id}>
                  <td className="py-3 font-semibold">{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.role}</td>
                  <td>{item.approved ? 'Yes' : 'No'}</td>
                  <td>{item.active ? 'Yes' : 'No'}</td>
                  <td className="flex gap-2 py-2">
                    {item.role === 'EMPLOYER' && !item.approved && <button className="btn-secondary" onClick={() => approve(item.id)}>Approve</button>}
                    <button className="btn-secondary" onClick={() => toggle(item.id, !item.active)}>{item.active ? 'Disable' : 'Enable'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <form className="panel space-y-3" onSubmit={addTemplate}>
            <h3 className="text-lg font-bold">CV template</h3>
            <Field label="Name" value={template.name} onChange={(name) => setTemplate({ ...template, name })} />
            <TextArea label="Body" value={template.body} onChange={(body) => setTemplate({ ...template, body })} />
            <button className="btn-primary w-full" type="submit"><Plus size={16} />Add template</button>
          </form>
          <div className="panel">
            <h3 className="text-lg font-bold">Templates</h3>
            <div className="mt-3 space-y-2">
              {templates.map((item) => <div className="rounded-md border border-slate-200 p-3 text-sm" key={item.id}>{item.name}</div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AccountView({ user, run, onAuthUpdate }) {
  const [form, setForm] = useState(user);

  async function save(event) {
    event.preventDefault();
    const updated = await run(() => jsonRequest('/account', 'PUT', form), 'Account updated');
    if (updated) onAuthUpdate({ token: localStorage.getItem('jobsite_token'), user: updated });
  }

  return (
    <form className="panel mx-auto max-w-2xl space-y-4" onSubmit={save}>
      <SectionTitle title="Account settings" />
      <Field label="Name" value={form.name || ''} onChange={(name) => setForm({ ...form, name })} />
      <Field label="Email" value={form.email || ''} onChange={(email) => setForm({ ...form, email })} />
      {user.role === 'EMPLOYER' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" value={form.companyName || ''} onChange={(companyName) => setForm({ ...form, companyName })} />
          <Field label="Company email" value={form.companyEmail || ''} onChange={(companyEmail) => setForm({ ...form, companyEmail })} />
        </div>
      )}
      <button className="btn-primary" type="submit">Save account</button>
    </form>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      <input className="field" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      <textarea className="field min-h-28" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}

function JobGrid({ jobs }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {jobs.map((job) => <MiniJob key={job.id} job={job} />)}
    </div>
  );
}

function MiniJob({ job }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-bold">{job.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{job.companyName}</p>
      <p className="mt-3 text-sm text-slate-600">{job.location} · {job.jobType}</p>
    </article>
  );
}

function JobHeader({ job }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-ink">{job.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{job.companyName || job.employerName} · {job.location}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-moss">{job.jobType}</span>
        {job.salary && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{job.salary}</span>}
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-marine">{job.status}</span>
      </div>
    </div>
  );
}

function AuthNotice({ setView }) {
  return (
    <div className="panel mx-auto max-w-xl text-center">
      <h2 className="text-2xl font-bold">Sign in required</h2>
      <p className="mt-2 text-slate-600">Create an account or sign in to open your dashboard.</p>
      <button className="btn-primary mt-5" onClick={() => setView('auth')}>Sign in</button>
    </div>
  );
}

export default App;
