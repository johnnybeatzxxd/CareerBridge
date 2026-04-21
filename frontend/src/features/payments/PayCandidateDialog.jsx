import { Banknote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { jsonRequest } from '../../api.js';
import { Button, Dialog, FormField, Textarea } from '../../components/ui/index.js';
import { formatMoney } from '../wallet/walletUtils.js';

export default function PayCandidateDialog({ application, onClose, onPaid }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (application) {
      setNote('');
      setError('');
    }
  }, [application]);

  async function submit() {
    setPaying(true);
    setError('');
    try {
      await jsonRequest('/payments', 'POST', {
        applicationId: application.id,
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
            Pay {formatMoney(application?.jobPrice)}
          </Button>
        </>
      )}
    >
      {application && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4 border border-[#dfe4e0] bg-[#f7f9f7] p-4 text-sm">
            <div>
              <p className="text-xs text-[#7a8580]">Candidate</p>
              <p className="mt-1 font-bold text-[#17211e]">{application.seekerName}</p>
            </div>
            <div>
              <p className="text-xs text-[#7a8580]">Job price</p>
              <p className="mt-1 font-bold text-[#176b52]">{formatMoney(application.jobPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-[#7a8580]">Paid so far</p>
              <p className="mt-1 font-bold text-[#17211e]">{formatMoney(application.totalPaid)}</p>
            </div>
          </div>
          {error && <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <p className="text-sm leading-6 text-[#58645f]">
            CareerBridge will transfer the job's fixed price to this candidate. The amount cannot be changed during payment.
          </p>
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
