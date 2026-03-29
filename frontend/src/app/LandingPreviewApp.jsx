import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../features/landing/LandingPage.jsx';
import PublicHeader from '../components/layout/PublicHeader.jsx';
import PreviewPlaceholder from '../components/layout/PreviewPlaceholder.jsx';
import { apiRequest } from '../api.js';

export default function LandingPreviewApp() {
  const [landing, setLanding] = useState({ stats: {}, featuredJobs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    apiRequest('/public/landing')
      .then((response) => {
        if (active) setLanding(response);
      })
      .catch(() => {
        if (active) setLanding({ stats: {}, featuredJobs: [] });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Routes>
      <Route element={<PublicHeader />}>
        <Route
          index
          element={
            <LandingPage
              featuredJobs={landing.featuredJobs}
              stats={landing.stats}
              isLoading={loading}
            />
          }
        />
        <Route path="jobs" element={<PreviewPlaceholder title="Jobs page" />} />
        <Route path="jobs/:jobId" element={<PreviewPlaceholder title="Job details page" />} />
        <Route path="login" element={<PreviewPlaceholder title="Sign in page" />} />
        <Route path="register" element={<PreviewPlaceholder title="Registration page" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
