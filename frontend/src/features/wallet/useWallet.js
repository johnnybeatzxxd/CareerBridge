import { useCallback, useEffect, useState } from 'react';
import { apiRequest, jsonRequest } from '../../api.js';

const emptyWallet = {
  availableBalance: 0,
  totalEarned: 0,
  totalWithdrawn: 0,
  transactions: [],
};

export function useWallet() {
  const [wallet, setWallet] = useState(emptyWallet);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setWallet(await apiRequest('/wallet'));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function withdraw(details) {
    await jsonRequest('/wallet/withdrawals', 'POST', details);
    await load();
  }

  return { wallet, loading, error, withdraw };
}
