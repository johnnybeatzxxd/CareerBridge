import { MailCheck, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/index.js';
import AuthLayout from './AuthLayout.jsx';
import { useAuth } from './AuthContext.jsx';

export default function VerifyEmailPage() {
  const { resendOtp, user, verifyEmail } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || sessionStorage.getItem('jobsite_pending_email') || '';
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    if (email) sessionStorage.setItem('jobsite_pending_email', email);
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  if (user) return <Navigate to="/dashboard" replace />;
  if (!email) return <Navigate to="/register" replace />;

  function updateDigit(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
  }

  function handlePaste(event) {
    const value = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (value.length !== 6) return;
    event.preventDefault();
    setDigits(value.split(''));
    inputs.current[5]?.focus();
  }

  async function submit(event) {
    event.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Enter the complete six-digit code');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await verifyEmail({ email, code });
      sessionStorage.removeItem('jobsite_pending_email');
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to verify email');
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    setResending(true);
    setError('');
    setNotice('');
    try {
      await resendOtp(email);
      setDigits(Array(6).fill(''));
      setCooldown(60);
      setNotice('A new verification code was sent.');
      inputs.current[0]?.focus();
    } catch (requestError) {
      setError(requestError.message || 'Unable to resend code');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Verify your email"
      title="Enter the code we sent."
      description={`A six-digit verification code was sent to ${email}. It expires in 10 minutes.`}
    >
      <form className="space-y-6" onSubmit={submit}>
        <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              ref={(element) => { inputs.current[index] = element; }}
              aria-label={`Verification digit ${index + 1}`}
              autoFocus={index === 0}
              className="h-14 min-w-0 border border-slate-300 bg-white text-center text-xl font-bold text-slate-950 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              inputMode="numeric"
              key={index}
              maxLength={1}
              value={digit}
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
            />
          ))}
        </div>

        {error && <div className="border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
        {notice && <div className="border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{notice}</div>}

        <Button className="w-full" size="lg" loading={submitting} type="submit">
          <MailCheck size={17} />
          Verify email
        </Button>
        <Button className="w-full" disabled={cooldown > 0} loading={resending} variant="secondary" onClick={resend}>
          <RefreshCw size={16} />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </Button>
      </form>

      <p className="mt-7 border-t border-[#e4e8e5] pt-6 text-center text-sm text-[#68736e]">
        Wrong email? <Link className="font-bold text-[#176b52] hover:underline" to="/register">Start again</Link>
      </p>
    </AuthLayout>
  );
}
