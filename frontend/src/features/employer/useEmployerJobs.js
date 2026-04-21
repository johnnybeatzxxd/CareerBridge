import { useCallback, useEffect, useState } from 'react';
import { apiRequest, jsonRequest } from '../../api.js';

export function useEmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [jobList, applicationList] = await Promise.all([
        apiRequest('/jobs?scope=EMPLOYER'),
        apiRequest('/applications'),
      ]);
      setJobs(jobList);
      setApplications(applicationList);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load employer jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(job) {
    await jsonRequest('/jobs', 'POST', job);
    await load();
  }

  async function update(job) {
    await jsonRequest(`/jobs/${job.id}`, 'PUT', job);
    await load();
  }

  async function remove(jobId) {
    await apiRequest(`/jobs/${jobId}`, { method: 'DELETE' });
    await load();
  }

  function applicationCount(jobId) {
    return applications.filter((application) => application.jobId === jobId).length;
  }

  return { jobs, applications, loading, error, create, update, remove, applicationCount };
}
