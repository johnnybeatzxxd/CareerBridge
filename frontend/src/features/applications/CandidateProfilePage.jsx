import { ArrowLeft, BriefcaseBusiness, CalendarDays, Download, FileText, Mail, UserRound } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Badge, Button, EmptyState, PageHeader, Skeleton } from '../../components/ui/index.js';
import { useAuth } from '../auth/index.js';
import { formatApplicationDate, statusLabel, statusVariant } from './applicationUtils.js';
import { useCandidateProfile } from './useCandidateProfile.js';

export default function CandidateProfilePage() {
  const { user } = useAuth();
  const { applicationId } = useParams();
  const { profile, loading, error, downloadResume } = useCandidateProfile(applicationId);

  if (user.role !== 'EMPLOYER') return <Navigate to="/dashboard" replace />;
  if (loading) return <ProfileSkeleton />;
  if (error || !profile) {
    return (
      <div className="border border-[#d8dfda] bg-white">
        <EmptyState title="Candidate profile unavailable" description={error || 'This application could not be found.'} />
      </div>
    );
  }

  const skills = splitSkills(profile.skills);
  const hasBuiltResume = Boolean(profile.headline || profile.summary || profile.skills || profile.experience || profile.education);

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-[#58645f] hover:text-[#176b52]" to="/employer/candidates">
        <ArrowLeft size={16} />
        Back to candidates
      </Link>

      <PageHeader
        eyebrow="Candidate profile"
        title={profile.name}
        subtitle={profile.headline || `Applied for ${profile.jobTitle}`}
        actions={profile.resumeFileName ? (
          <Button variant="secondary" onClick={downloadResume}>
            <Download size={16} />
            Download uploaded resume
          </Button>
        ) : null}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <article className="border border-[#d8dfda] bg-white">
          <header className="border-b-2 border-[#172a23] p-8">
            <div className="flex items-start gap-5">
              <span className="grid h-16 w-16 shrink-0 place-items-center bg-[#e7f3ed] text-xl font-bold text-[#176b52]">
                {initials(profile.name)}
              </span>
              <div>
                <h2 className="text-3xl font-semibold text-[#17211e]">{profile.name}</h2>
                <p className="mt-2 text-lg font-semibold text-[#176b52]">{profile.headline || 'Job candidate'}</p>
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-[#68736e]"><Mail size={15} />{profile.email}</p>
              </div>
            </div>
          </header>

          {hasBuiltResume ? (
            <div className="space-y-9 p-8">
              <ResumeSection title="Professional summary" content={profile.summary} />
              <section>
                <h3 className="text-xs font-bold uppercase text-[#176b52]">Skills</h3>
                {skills.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => <span className="border border-[#cdd7d1] bg-[#f1f6f3] px-3 py-1.5 text-xs font-semibold text-[#405049]" key={skill}>{skill}</span>)}
                  </div>
                ) : <p className="mt-4 text-sm text-[#7a8580]">No skills listed.</p>}
              </section>
              <ResumeSection title="Experience" content={profile.experience} />
              <ResumeSection title="Education" content={profile.education} />
            </div>
          ) : (
            <EmptyState icon={FileText} title="No built resume yet" description="This candidate has not completed their CareerBridge resume profile." />
          )}
        </article>

        <aside className="space-y-5">
          <section className="border border-[#d8dfda] bg-white p-6">
            <h2 className="font-bold text-[#17211e]">Application</h2>
            <div className="mt-5 space-y-5">
              <ProfileDetail icon={BriefcaseBusiness} label="Position" value={profile.jobTitle} />
              <ProfileDetail icon={CalendarDays} label="Applied" value={formatApplicationDate(profile.appliedAt)} />
              <ProfileDetail icon={UserRound} label="Status" value={<Badge variant={statusVariant(profile.applicationStatus)} dot>{statusLabel(profile.applicationStatus)}</Badge>} />
            </div>
          </section>

          <section className="border border-[#d8dfda] bg-white p-6">
            <h2 className="font-bold text-[#17211e]">Cover letter</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#58645f]">{profile.coverLetter || 'No cover letter was included.'}</p>
          </section>

          {profile.resumeFileName && (
            <section className="border border-[#b9d8cb] bg-[#edf7f2] p-5">
              <p className="text-xs font-bold uppercase text-[#176b52]">Uploaded resume</p>
              <p className="mt-2 break-all text-sm font-bold text-[#17211e]">{profile.resumeFileName}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function ResumeSection({ title, content }) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase text-[#176b52]">{title}</h3>
      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#53615b]">{content || 'Not provided.'}</p>
    </section>
  );
}

function ProfileDetail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 shrink-0 text-[#176b52]" size={17} />
      <div>
        <p className="text-xs text-[#7a8580]">{label}</p>
        <div className="mt-1 text-sm font-bold text-[#17211e]">{value}</div>
      </div>
    </div>
  );
}

function splitSkills(value = '') {
  return value.split(/,|\n/).map((skill) => skill.trim()).filter(Boolean);
}

function initials(value = '') {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-[720px]" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
