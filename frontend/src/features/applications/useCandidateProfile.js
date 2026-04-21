import { useEffect, useState } from 'react';
import { apiRequest } from '../../api.js';

export function useCandidateProfile(applicationId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    apiRequest(`/applications/${applicationId}/profile`)
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load candidate profile');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId]);

  async function downloadResume() {
    const token = localStorage.getItem('jobsite_token');
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const response = await fetch(`${base}/applications/${applicationId}/resume-file`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Unable to download uploaded resume');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = profile?.resumeFileName || 'resume';
    link.click();
    URL.revokeObjectURL(url);
  }

  return { profile, loading, error, downloadResume };
}
