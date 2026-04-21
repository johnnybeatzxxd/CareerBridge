import { useCallback, useEffect, useState } from 'react';
import { apiRequest, jsonRequest } from '../../api.js';
import { emptyResume } from './resumeUtils.js';

export function useResume() {
  const [resume, setResume] = useState(emptyResume);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profile, templateList] = await Promise.all([
        apiRequest('/cv'),
        apiRequest('/cv/templates'),
      ]);
      setResume({ ...emptyResume, ...profile });
      setTemplates(templateList);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load resume');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(nextResume) {
    const saved = await jsonRequest('/cv', 'PUT', nextResume);
    setResume({ ...emptyResume, ...saved });
    return saved;
  }

  async function upload(file) {
    const body = new FormData();
    body.append('cv', file);
    const result = await apiRequest('/cv/upload', { method: 'POST', body });
    setResume((current) => ({ ...current, fileName: result.fileName }));
    return result;
  }

  async function remove() {
    await apiRequest('/cv', { method: 'DELETE' });
    setResume(emptyResume);
  }

  async function download() {
    return apiRequest('/cv/download');
  }

  return {
    resume,
    setResume,
    templates,
    loading,
    error,
    reload: load,
    save,
    upload,
    remove,
    download,
  };
}
