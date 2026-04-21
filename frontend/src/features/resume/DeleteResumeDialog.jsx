import { Button, Dialog } from '../../components/ui/index.js';

export default function DeleteResumeDialog({ open, deleting, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete resume profile?"
      description="This removes the structured resume and uploaded file reference from your account."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={deleting} loadingText="Deleting..." onClick={onConfirm}>
            Delete resume
          </Button>
        </>
      }
    >
      <div className="border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
        This action cannot be undone. You can create a new resume later.
      </div>
    </Dialog>
  );
}
