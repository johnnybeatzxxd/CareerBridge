import { useEffect, useState } from 'react';
import { apiRequest } from '../../api.js';

export function useDashboard(role) {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const statsRequest = role === 'ADMIN'
      ? apiRequest('/admin/stats')
      : apiRequest('/dashboard');
    const activityRequest = role === 'ADMIN'
      ? Promise.resolve([])
      : apiRequest('/applications').catch(() => []);

    Promise.all([statsRequest, activityRequest])
      .then(([stats, recentActivity]) => {
        if (!active) return;
        setData(stats);
        setActivity(recentActivity);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load dashboard');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [role]);

  return { data, activity, loading, error };
}
