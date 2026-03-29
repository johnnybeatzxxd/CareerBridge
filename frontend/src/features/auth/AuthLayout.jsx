import { ArrowLeft, BriefcaseBusiness, Check, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  { icon: ShieldCheck, text: 'Verified employer accounts' },
  { icon: Sparkles, text: 'Focused job discovery and tracking' },
  { icon: Users, text: 'One workspace for talent and teams' },
];

export default function AuthLayout({ children, eyebrow, title, description }) {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#eef2ef]">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1440px] lg:grid-cols-[minmax(380px,.8fr)_minmax(520px,1.2fr)]">
        <aside className="relative hidden overflow-hidden bg-[#172a23] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
          <div className="relative">
            <Link className="inline-flex items-center gap-3" to="/">
              <span className="grid h-10 w-10 place-items-center bg-[#8fd2b9] text-[#172a23]">
                <BriefcaseBusiness size={19} />
              </span>
              <span className="text-lg font-bold">CareerBridge</span>
            </Link>
            <p className="mt-20 text-xs font-bold uppercase text-[#8fd2b9]">A better way to connect</p>
            <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight">
              Build a career or a team with less noise.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[#c7d4ce]">
              Practical tools, credible opportunities, and a clear path from first introduction to the right match.
            </p>
          </div>

          <div className="relative space-y-4 border-t border-white/15 pt-7">
            {benefits.map(({ icon: Icon, text }) => (
              <div className="flex items-center gap-3 text-sm text-[#e7efeb]" key={text}>
                <span className="grid h-7 w-7 place-items-center bg-white/10 text-[#8fd2b9]">
                  <Icon size={15} />
                </span>
                {text}
              </div>
            ))}
          </div>
        </aside>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl">
            <Link className="mb-8 flex items-center gap-3 lg:hidden" to="/">
              <span className="grid h-9 w-9 place-items-center bg-[#172a23] text-white">
                <BriefcaseBusiness size={17} />
              </span>
              <span className="font-bold text-[#17211e]">CareerBridge</span>
            </Link>
            <Link
              className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#58645f] hover:text-[#176b52] lg:mb-8"
              to="/"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>
            <div className="border border-[#d8dfda] bg-white p-6 shadow-[0_20px_55px_rgba(24,43,35,0.08)] sm:p-9">
              <p className="text-xs font-bold uppercase text-[#176b52]">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold text-[#17211e] sm:text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-[#68736e]">{description}</p>
              <div className="mt-8">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
