import { Banknote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { jsonRequest } from '../../api.js';
import { Button, Dialog, FormField, Input, Textarea } from '../../components/ui/index.js';
import { formatMoney } from '../wallet/walletUtils.js';

export default function PayCandidateDialog({ application, onClose, onPaid }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (application) {
      setAmount('');
      setNote('');
      setError('');
    }
  }, [application]);

  async function submit() {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter an amount greater than zero');
      return;
    }

    setPaying(true);
    setError('');
    try {
      await jsonRequest('/payments', 'POST', {
        applicationId: application.id,
        amount: numericAmount,
        note,
      });
      await onPaid();
      onClose();
    } catch (requestError) {
      setError(requestError.message || 'Unable to send payment');
    } finally {
      setPaying(false);
    }
  }

  return (
    <Dialog
      open={Boolean(application)}
      onClose={onClose}
      title="Pay hired candidate"
      description={application ? `${application.seekerName} · ${application.jobTitle}` : ''}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={paying} onClick={submit}>
            <Banknote size={16} />
            Send payment
          </Button>
        </>
      )}
    >
      {application && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 border border-[#dfe4e0] bg-[#f7f9f7] p-4 text-sm">
            <div>
              <p className="text-xs text-[#7a8580]">Candidate</p>
              <p className="mt-1 font-bold text-[#17211e]">{application.seekerName}</p>
            </div>
            <div>
              <p className="text-xs text-[#7a8580]">Paid so far</p>
              <p className="mt-1 font-bold text-[#17211e]">{formatMoney(application.totalPaid)}</p>
            </div>
          </div>
          {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <FormField label="Payment amount" required description="Funds are credited to the candidate wallet immediately.">
            <Input
              min="0.01"
              step="0.01"
              type="number"
              value={amount}
              placeholder="0.00"
              onChange={(event) => setAmount(event.target.value)}
            />
          </FormField>
          <FormField label="Payment note" optional>
            <Textarea
              className="min-h-24"
              value={note}
              placeholder="Milestone, completed work, or payment details"
              onChange={(event) => setNote(event.target.value)}
            />
          </FormField>
        </div>
      )}
    </Dialog>
  );
}
