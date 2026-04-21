import { Mail, MapPin } from 'lucide-react';
import { useAuth } from '../auth/index.js';
import { renderTemplate, splitSkills } from './resumeUtils.js';

export default function ResumePreview({ resume, template }) {
  const { user } = useAuth();
  const skills = splitSkills(resume.skills);

  if (template?.body) {
    return (
      <div className="min-h-[760px] bg-white p-10 shadow-[0_18px_50px_rgba(24,43,35,0.10)]">
        <p className="whitespace-pre-line text-sm leading-7 text-[#405049]">
          {renderTemplate(template, user, resume)}
        </p>
      </div>
    );
  }

  return (
    <article className="min-h-[760px] bg-white p-10 shadow-[0_18px_50px_rgba(24,43,35,0.10)]">
      <header className="border-b-2 border-[#172a23] pb-7">
        <h2 className="text-4xl font-semibold text-[#17211e]">{user.name}</h2>
        <p className="mt-2 text-lg font-semibold text-[#176b52]">
          {resume.headline || 'Professional headline'}
        </p>
        <div className="mt-5 flex flex-wrap gap-5 text-xs text-[#68736e]">
          <span className="inline-flex items-center gap-1.5"><Mail size={14} />{user.email}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin size={14} />Available for opportunities</span>
        </div>
      </header>

      <div className="mt-8 space-y-8">
        <PreviewSection title="Profile">
          <p>{resume.summary || 'Write a concise summary of your experience and professional direction.'}</p>
        </PreviewSection>

        <PreviewSection title="Skills">
          {skills.length ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span className="border border-[#cdd7d1] bg-[#f1f6f3] px-3 py-1.5 text-xs font-semibold text-[#405049]" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p>Add skills separated by commas.</p>
          )}
        </PreviewSection>

        <PreviewSection title="Experience">
          <p className="whitespace-pre-line">{resume.experience || 'Add your professional experience and measurable achievements.'}</p>
        </PreviewSection>

        <PreviewSection title="Education">
          <p className="whitespace-pre-line">{resume.education || 'Add your education, training, and certifications.'}</p>
        </PreviewSection>
      </div>
    </article>
  );
}

function PreviewSection({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase text-[#176b52]">{title}</h3>
      <div className="text-sm leading-7 text-[#53615b]">{children}</div>
    </section>
  );
}
