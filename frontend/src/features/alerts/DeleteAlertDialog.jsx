import { Button, Dialog } from '../../components/ui/index.js';
import { alertTitle } from './alertUtils.js';

export default function DeleteAlertDialog({ alert, deleting, onClose, onConfirm }) {
  return (
    <Dialog
      open={Boolean(alert)}
      onClose={onClose}
      title="Delete job alert?"
      description={alert ? `Remove the saved search “${alertTitle(alert)}”.` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={deleting} loadingText="Deleting..." onClick={onConfirm}>
            Delete alert
          </Button>
        </>
      }
    >
      <div className="border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
        Matching jobs remain available in the marketplace, but this saved search will be removed.
      </div>
    </Dialog>
  );
}
