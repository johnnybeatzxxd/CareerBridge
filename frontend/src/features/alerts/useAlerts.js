import { useCallback, useEffect, useState } from 'react';
import { apiRequest, jsonRequest } from '../../api.js';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setAlerts(await apiRequest('/job-alerts'));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load job alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create(alert) {
    const created = await jsonRequest('/job-alerts', 'POST', alert);
    setAlerts((current) => [created, ...current]);
    return created;
  }

  async function update(alert) {
    await jsonRequest(`/job-alerts/${alert.id}`, 'PUT', alert);
    await load();
  }

  async function remove(alertId) {
    await apiRequest(`/job-alerts/${alertId}`, { method: 'DELETE' });
    setAlerts((current) => current.filter((alert) => alert.id !== alertId));
  }

  return { alerts, loading, error, create, update, remove, reload: load };
}
