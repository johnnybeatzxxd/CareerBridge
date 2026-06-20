import { Building2, CheckCircle2, Mail, Save, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, FormField, Input, PageHeader, Skeleton } from '../../components/ui/index.js';
import { useAuth } from '../auth/index.js';
import DeleteAccountDialog from './DeleteAccountDialog.jsx';
import { useAccount } from './useAccount.js';

export default function AccountPage() {
  const { user, updateUser, logout } = useAuth();
  const { account, setAccount, loading, error, save, remove } = useAccount();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    setNotice('');
  }, [account?.email]);

  if (loading) return <AccountSkeleton />;
  const employer = user.role === 'EMPLOYER';

  function update(field, value) {
    setAccount((current) => ({ ...current, [field]: value }));
    setNotice('');
  }

  async function saveAccount(event) {
    event.preventDefault();
    const nextErrors = validate(account, employer);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    setActionError('');
    try {
      const updated = await save(account);
      updateUser(updated);
      setNotice('Account details updated.');
    } catch (requestError) {
      setActionError(requestError.message || 'Unable to update account');
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    setActionError('');
    try {
      await remove();
      await logout();
      navigate('/', { replace: true });
    } catch (requestError) {
      setActionError(requestError.message || 'Unable to delete account');
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Settings" title="Account" subtitle="Manage your identity and the contact details shown across CareerBridge." />

      {(error || actionError) && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || actionError}</div>}
      {notice && (
        <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border border-[#d8dfda] bg-white p-6">
          <Avatar className="rounded-none" name={account.name} size="xl" />
          <h2 className="mt-5 text-xl font-bold text-[#17211e]">{account.name}</h2>
          <p className="mt-1 text-sm text-[#68736e]">{formatRole(account.role)}</p>
          <div className="mt-6 space-y-4 border-t border-[#e5e9e6] pt-5">
            <AccountFact icon={Mail} label="Login email" value={account.email} />
            {employer && <AccountFact icon={Building2} label="Company" value={account.companyName} />}
            <AccountFact icon={ShieldCheck} label="Account status" value={account.active ? 'Active' : 'Disabled'} />
          </div>
        </aside>

        <form className="border border-[#d8dfda] bg-white" onSubmit={saveAccount} noValidate>
          <div className="border-b border-[#e5e9e6] px-6 py-5">
            <h2 className="font-bold text-[#17211e]">Profile details</h2>
            <p className="mt-1 text-xs text-[#7a8580]">These details are used in your workspace and platform communication.</p>
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <FormField label="Full name" required error={errors.name}>
              <Input startIcon={UserRound} value={account.name || ''} onChange={(event) => update('name', event.target.value)} />
            </FormField>
            <FormField label="Email address" required error={errors.email}>
              <Input startIcon={Mail} type="email" value={account.email || ''} onChange={(event) => update('email', event.target.value)} />
            </FormField>
            {employer && (
              <>
                <FormField label="Company name" required error={errors.companyName}>
                  <Input startIcon={Building2} value={account.companyName || ''} onChange={(event) => update('companyName', event.target.value)} />
                </FormField>
                <FormField label="Company email" required error={errors.companyEmail}>
                  <Input startIcon={Mail} type="email" value={account.companyEmail || ''} onChange={(event) => update('companyEmail', event.target.value)} />
                </FormField>
              </>
            )}
          </div>
          <div className="flex justify-end border-t border-[#e5e9e6] px-6 py-4">
            <Button loading={saving} type="submit">
              <Save size={16} />
              Save changes
            </Button>
          </div>
        </form>
      </div>

      <section className="flex items-center justify-between gap-6 border border-red-200 bg-white p-6">
        <div>
          <h2 className="font-bold text-[#17211e]">Delete account</h2>
          <p className="mt-1 text-sm text-[#68736e]">Disable this account and permanently end access to the workspace.</p>
        </div>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 size={16} />
          Delete account
        </Button>
      </section>

      <DeleteAccountDialog deleting={deleting} open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={deleteAccount} />
    </div>
  );
}

function AccountFact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 text-[#176b52]" size={16} />
      <div className="min-w-0">
        <p className="text-xs text-[#7a8580]">{label}</p>
        <p className="mt-1 break-words text-sm font-bold text-[#405049]">{value || 'Not provided'}</p>
      </div>
    </div>
  );
}

function validate(account, employer) {
  const errors = {};
  if (!account.name?.trim()) errors.name = 'Full name is required';
  if (!/^\S+@\S+\.\S+$/.test(account.email || '')) errors.email = 'Enter a valid email address';
  if (employer) {
    if (!account.companyName?.trim()) errors.companyName = 'Company name is required';
    if (!/^\S+@\S+\.\S+$/.test(account.companyEmail || '')) errors.companyEmail = 'Enter a valid company email';
  }
  return errors;
}

function formatRole(role = '') {
  return role.toLowerCase().split('_').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}

function AccountSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20" />
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Skeleton className="h-80" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
