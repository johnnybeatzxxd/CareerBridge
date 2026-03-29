import { Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, FormField, Input } from '../../components/ui/index.js';
import AuthLayout from './AuthLayout.jsx';
import PasswordInput from './PasswordInput.jsx';
import { useAuth } from './AuthContext.jsx';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    setServerError('');
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (error) {
      setServerError(error.message || 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your workspace."
      description="Continue your job search, hiring process, or platform management."
    >
      <form className="space-y-5" onSubmit={submit} noValidate>
        {serverError && <AuthError message={serverError} />}
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
        <FormField label="Password" required error={errors.password}>
          <PasswordInput
            autoComplete="current-password"
            value={form.password}
            placeholder="Enter your password"
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </FormField>
        <Button className="w-full" size="lg" type="submit" loading={submitting} loadingText="Signing in...">
          Sign in
        </Button>
      </form>

      <p className="mt-7 border-t border-[#e4e8e5] pt-6 text-center text-sm text-[#68736e]">
        New to CareerBridge?{' '}
        <Link className="font-bold text-[#176b52] hover:text-[#104f3d]" to="/register">
          Create an account
        </Link>
      </p>

      <div className="mt-5 bg-[#f4f7f5] p-4 text-xs leading-5 text-[#68736e]">
        <strong className="text-[#33403b]">Admin demo:</strong> admin@example.com / admin123
      </div>
    </AuthLayout>
  );
}

function validateLogin(form) {
  const errors = {};
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!form.password) errors.password = 'Password is required';
  return errors;
}

function AuthError({ message }) {
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
      {message}
    </div>
  );
}
