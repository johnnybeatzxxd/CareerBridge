import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../api.js';

export function useJobs(filters) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.location) params.set('location', filters.location);
      if (filters.jobType) params.set('jobType', filters.jobType);
      if (filters.skill) params.set('skill', filters.skill);
      setJobs(await apiRequest(`/jobs${params.size ? `?${params.toString()}` : ''}`));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters.q, filters.location, filters.jobType, filters.skill]);

  useEffect(() => {
    load();
  }, [load]);

  return { jobs, loading, error, reload: load };
}

export function useJob(jobId) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    apiRequest(`/jobs/${jobId}`)
      .then((response) => {
        if (active) setJob(response);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load this job');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [jobId]);

  return { job, loading, error };
}
