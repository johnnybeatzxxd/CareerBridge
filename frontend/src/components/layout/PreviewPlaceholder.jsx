import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PreviewPlaceholder({ title }) {
  return (
    <main className="grid min-h-[calc(100vh-64px)] place-items-center bg-[#f7f8f6] px-5">
      <div className="max-w-lg border border-[#d8dfda] bg-white p-8 text-center">
        <p className="text-xs font-bold uppercase text-[#176b52]">Next checkpoint</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#17211e]">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-[#68736e]">
          This page has intentionally not been designed yet. Review the landing page first, then we will build this page from your feedback.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#172a23] px-5 text-sm font-bold text-white hover:bg-[#263c33]"
          to="/"
        >
          <ArrowLeft size={16} />
          Back to landing page
        </Link>
      </div>
    </main>
  );
}
