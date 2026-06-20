import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Dialog, FormField, Input } from '../../components/ui/index.js';

export default function DeleteAccountDialog({ deleting, open, onClose, onConfirm }) {
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    if (open) setConfirmation('');
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete your account?"
      description="This disables access immediately. Existing marketplace records are retained for platform integrity."
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={confirmation !== 'DELETE'} loading={deleting} variant="danger" onClick={onConfirm}>
            <Trash2 size={16} />
            Delete account
          </Button>
        </>
      )}
    >
      <div className="space-y-5">
        <div className="border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          You will be signed out and will no longer be able to log in with this account.
        </div>
        <FormField label="Type DELETE to confirm" required>
          <Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </FormField>
      </div>
    </Dialog>
  );
}
