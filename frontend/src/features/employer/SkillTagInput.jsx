import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function SkillTagInput({ skills = [], onChange }) {
  const [value, setValue] = useState('');

  function addSkill(rawValue = value) {
    const next = rawValue.trim().replace(/,$/, '');
    if (!next) return;
    if (!skills.some((skill) => skill.toLowerCase() === next.toLowerCase()) && skills.length < 20) {
      onChange([...skills, next]);
    }
    setValue('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill();
    }
    if (event.key === 'Backspace' && !value && skills.length) {
      onChange(skills.slice(0, -1));
    }
  }

  return (
    <div className="border border-slate-300 bg-white p-2 focus-within:border-emerald-700 focus-within:ring-1 focus-within:ring-emerald-700">
      <div className="flex min-h-10 flex-wrap items-center gap-2">
        {skills.map((skill) => (
          <span className="inline-flex items-center gap-1.5 bg-[#e7f3ed] px-2.5 py-1.5 text-xs font-bold text-[#12664f]" key={skill}>
            {skill}
            <button aria-label={`Remove ${skill}`} className="text-[#4b7568] hover:text-red-600" type="button" onClick={() => onChange(skills.filter((item) => item !== skill))}>
              <X size={13} />
            </button>
          </span>
        ))}
        <input
          className="min-w-44 flex-1 border-0 px-1 py-2 text-sm outline-none placeholder:text-slate-400"
          value={value}
          placeholder={skills.length ? 'Add another skill' : 'Java, React, JDBC'}
          onBlur={() => addSkill()}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button aria-label="Add skill" className="grid h-8 w-8 place-items-center text-[#176b52] hover:bg-[#edf4f0]" type="button" onClick={() => addSkill()}>
          <Plus size={16} />
        </button>
      </div>
      <p className="px-1 pt-1 text-xs text-slate-400">{skills.length}/20 skills · press Enter or comma to add</p>
    </div>
  );
}
