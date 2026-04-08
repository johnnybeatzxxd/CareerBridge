import { useCallback, useEffect, useState } from 'react';
import { apiRequest, jsonRequest } from '../../api.js';

export function useApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setApplications(await apiRequest('/applications'));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(applicationId, status) {
    await jsonRequest(`/applications/${applicationId}`, 'PATCH', { status });
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId ? { ...application, status } : application,
      ),
    );
  }

  return { applications, loading, error, reload: load, updateStatus };
}
