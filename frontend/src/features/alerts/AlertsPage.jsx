import { Bell, Plus } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Button,
  EmptyState,
  PageHeader,
  Skeleton,
} from '../../components/ui/index.js';
import { useAuth } from '../auth/index.js';
import AlertCard from './AlertCard.jsx';
import AlertFormDialog from './AlertFormDialog.jsx';
import DeleteAlertDialog from './DeleteAlertDialog.jsx';
import { useAlerts } from './useAlerts.js';

export default function AlertsPage() {
  const { user } = useAuth();
  const { alerts, loading, error, create, update, remove } = useAlerts();
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');

  if (user.role !== 'JOB_SEEKER') return <Navigate to="/dashboard" replace />;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
    setActionError('');
    setNotice('');
  }

  function openEdit(alert) {
    setEditing(alert);
    setFormOpen(true);
    setActionError('');
    setNotice('');
  }

  async function saveAlert(form) {
    setSaving(true);
    setActionError('');
    try {
      if (editing?.id) {
        await update({ ...editing, ...form });
        setNotice('Job alert updated.');
      } else {
        await create(form);
        setNotice('Job alert created.');
      }
      setFormOpen(false);
      setEditing(null);
    } catch (requestError) {
      setActionError(requestError.message || 'Unable to save job alert');
    } finally {
      setSaving(false);
    }
  }

  async function toggleAlert(alert) {
    setTogglingId(alert.id);
    setActionError('');
    try {
      await update({ ...alert, active: !alert.active });
      setNotice(alert.active ? 'Job alert paused.' : 'Job alert enabled.');
    } catch (requestError) {
      setActionError(requestError.message || 'Unable to update job alert');
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteAlert() {
    setDeletingBusy(true);
    setActionError('');
    try {
      await remove(deleting.id);
      setDeleting(null);
      setNotice('Job alert deleted.');
    } catch (requestError) {
      setActionError(requestError.message || 'Unable to delete job alert');
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Job seeker workspace"
        title="Job alerts"
        subtitle="Save focused searches, pause them when needed, and review current matching roles."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} />
            Create alert
          </Button>
        }
      />

      {(error || actionError) && (
        <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || actionError}</div>
      )}
      {notice && (
        <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{notice}</div>
      )}

      {loading ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton className="h-80" key={index} />)}
        </div>
      ) : alerts.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {alerts.map((alert) => (
            <AlertCard
              alert={alert}
              key={alert.id}
              toggling={togglingId === alert.id}
              onEdit={openEdit}
              onDelete={setDeleting}
              onToggle={toggleAlert}
            />
          ))}
        </div>
      ) : (
        <div className="border border-[#d8dfda] bg-white">
          <EmptyState
            icon={Bell}
            title="No job alerts yet"
            description="Create a saved search to keep relevant opportunities organized."
            action={
              <Button onClick={openCreate}>
                <Plus size={16} />
                Create your first alert
              </Button>
            }
          />
        </div>
      )}

      <AlertFormDialog
        alert={editing}
        open={formOpen}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSave={saveAlert}
      />
      <DeleteAlertDialog
        alert={deleting}
        deleting={deletingBusy}
        onClose={() => setDeleting(null)}
        onConfirm={deleteAlert}
      />
    </div>
  );
}
