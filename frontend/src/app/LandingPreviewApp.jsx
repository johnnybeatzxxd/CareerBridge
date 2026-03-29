import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../features/landing/LandingPage.jsx';
import { LoginPage, RegisterPage } from '../features/auth/index.js';
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
        <Route path="dashboard" element={<PreviewPlaceholder title="Dashboard" />} />
      </Route>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
