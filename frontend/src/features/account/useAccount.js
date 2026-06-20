import { useCallback, useEffect, useState } from 'react';
import { apiRequest, jsonRequest } from '../../api.js';

export function useAccount() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setAccount(await apiRequest('/account'));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load account');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(details) {
    const updated = await jsonRequest('/account', 'PUT', details);
    setAccount(updated);
    return updated;
  }

  async function remove() {
    await apiRequest('/account', { method: 'DELETE' });
  }

  return { account, setAccount, loading, error, save, remove };
}
