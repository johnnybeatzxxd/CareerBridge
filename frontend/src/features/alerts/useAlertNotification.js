import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../api.js';
import { ALERTS_CHANGED_EVENT } from './alertEvents.js';

export function useAlertNotification(enabled) {
  const [matchCount, setMatchCount] = useState(0);

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const alerts = await apiRequest('/job-alerts');
      const jobIds = new Set(
        alerts
          .filter((alert) => alert.active)
          .flatMap((alert) => alert.matchingJobs || [])
          .map((job) => job.id),
      );
      setMatchCount(jobIds.size);
    } catch {
      // Session recovery and redirect are handled centrally by the API client.
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setMatchCount(0);
      return undefined;
    }
    load();
    const interval = window.setInterval(load, 60_000);
    window.addEventListener(ALERTS_CHANGED_EVENT, load);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener(ALERTS_CHANGED_EVENT, load);
    };
  }, [enabled, load]);

  return { matchCount, refresh: load };
}
