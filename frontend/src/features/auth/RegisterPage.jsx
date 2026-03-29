import { Building2, Mail, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, FormField, Input } from '../../components/ui/index.js';
import AuthLayout from './AuthLayout.jsx';
import PasswordInput from './PasswordInput.jsx';
import { useAuth } from './AuthContext.jsx';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'JOB_SEEKER',
  companyName: '',
  companyEmail: '',
};

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (searchParams.get('role') === 'employer') {
      setForm((current) => ({ ...current, role: 'EMPLOYER' }));
    }
  }, [searchParams]);

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateRegistration(form);
    setErrors(nextErrors);
    setServerError('');
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(error.message || 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Join CareerBridge"
      title="Create the workspace you need."
      description="Choose your account type and start with a profile built for your goals."
    >
      <form className="space-y-5" onSubmit={submit} noValidate>
        {serverError && <AuthError message={serverError} />}

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">I am joining as</p>
          <div className="grid grid-cols-2 gap-3">
            <RoleOption
              active={form.role === 'JOB_SEEKER'}
              icon={UserRound}
              label="Job seeker"
              description="Find roles and manage applications"
              onClick={() => setForm({ ...form, role: 'JOB_SEEKER' })}
            />
            <RoleOption
              active={form.role === 'EMPLOYER'}
              icon={Building2}
              label="Employer"
              description="Publish jobs and review talent"
              onClick={() => setForm({ ...form, role: 'EMPLOYER' })}
            />
          </div>
        </div>

        <FormField label="Full name" required error={errors.name}>
          <Input
            autoComplete="name"
            startIcon={UserRound}
            value={form.name}
            placeholder="Your full name"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </FormField>

        <FormField label="Email address" required error={errors.email}>
          <Input
            autoComplete="email"
            startIcon={Mail}
            type="email"
            value={form.email}
            placeholder="you@example.com"
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </FormField>

        {form.role === 'EMPLOYER' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Company name" required error={errors.companyName}>
              <Input
                startIcon={Building2}
                value={form.companyName}
                placeholder="Company name"
                onChange={(event) => setForm({ ...form, companyName: event.target.value })}
              />
            </FormField>
            <FormField label="Company email" required error={errors.companyEmail}>
              <Input
                startIcon={Mail}
                type="email"
                value={form.companyEmail}
                placeholder="careers@company.com"
                onChange={(event) => setForm({ ...form, companyEmail: event.target.value })}
              />
            </FormField>
          </div>
        )}

        <FormField
          label="Password"
          required
          error={errors.password}
          description="Use at least 8 characters."
        >
          <PasswordInput
            autoComplete="new-password"
            value={form.password}
            placeholder="Create a password"
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </FormField>

        {form.role === 'EMPLOYER' && (
          <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            Employer accounts require administrator approval before publishing jobs.
          </div>
        )}

        <Button className="w-full" size="lg" type="submit" loading={submitting} loadingText="Creating account...">
          Create account
        </Button>
      </form>

      <p className="mt-7 border-t border-[#e4e8e5] pt-6 text-center text-sm text-[#68736e]">
        Already have an account?{' '}
        <Link className="font-bold text-[#176b52] hover:text-[#104f3d]" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

function RoleOption({ active, icon: Icon, label, description, onClick }) {
  return (
    <button
      className={`min-h-28 border p-4 text-left transition-colors ${
        active
          ? 'border-[#176b52] bg-[#e9f5ef] text-[#104f3d]'
          : 'border-[#d8dfda] bg-white text-[#4f5d57] hover:border-[#aebbb4]'
      }`}
      type="button"
      onClick={onClick}
    >
      <Icon size={20} />
      <span className="mt-3 block text-sm font-bold">{label}</span>
      <span className="mt-1 block text-xs leading-5 opacity-80">{description}</span>
    </button>
  );
}

function validateRegistration(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Full name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (form.role === 'EMPLOYER') {
    if (!form.companyName.trim()) errors.companyName = 'Company name is required';
    if (!form.companyEmail.trim()) errors.companyEmail = 'Company email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.companyEmail)) errors.companyEmail = 'Enter a valid company email';
  }
  return errors;
}

function AuthError({ message }) {
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
      {message}
    </div>
  );
}
