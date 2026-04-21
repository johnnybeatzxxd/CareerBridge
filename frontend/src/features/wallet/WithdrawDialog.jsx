import { Landmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Dialog, FormField, Input, Select } from '../../components/ui/index.js';
import { formatMoney } from './walletUtils.js';

const payoutMethods = [
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'TELEBIRR', label: 'Telebirr' },
  { value: 'MOBILE_MONEY', label: 'Mobile money' },
];

export default function WithdrawDialog({ balance, open, onClose, onWithdraw }) {
  const [form, setForm] = useState({ amount: '', payoutMethod: 'BANK_TRANSFER', payoutAccount: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ amount: '', payoutMethod: 'BANK_TRANSFER', payoutAccount: '' });
      setError('');
    }
  }, [open]);

  async function submit() {
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter an amount greater than zero');
      return;
    }
    if (amount > Number(balance)) {
      setError('Withdrawal exceeds your available balance');
      return;
    }
    if (!form.payoutAccount.trim()) {
      setError('Enter the destination account');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onWithdraw({ ...form, amount });
      onClose();
    } catch (requestError) {
      setError(requestError.message || 'Unable to withdraw funds');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Withdraw funds"
      description={`Available balance: ${formatMoney(balance)}`}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={submitting} onClick={submit}>
            <Landmark size={16} />
            Confirm withdrawal
          </Button>
        </>
      )}
    >
      <div className="space-y-5">
        {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <FormField label="Amount" required>
          <Input
            max={balance}
            min="0.01"
            step="0.01"
            type="number"
            value={form.amount}
            placeholder="0.00"
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
          />
        </FormField>
        <FormField label="Payout method" required>
          <Select
            options={payoutMethods}
            value={form.payoutMethod}
            onChange={(event) => setForm({ ...form, payoutMethod: event.target.value })}
          />
        </FormField>
        <FormField label="Destination account" required>
          <Input
            value={form.payoutAccount}
            placeholder="Account number or phone number"
            onChange={(event) => setForm({ ...form, payoutAccount: event.target.value })}
          />
        </FormField>
      </div>
    </Dialog>
  );
}
