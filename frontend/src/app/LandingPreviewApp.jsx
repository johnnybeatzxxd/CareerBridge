import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../features/landing/LandingPage.jsx';
import { LoginPage, RegisterPage } from '../features/auth/index.js';
import { JobDetailsPage, JobsPage } from '../features/jobs/index.js';
import PublicHeader from '../components/layout/PublicHeader.jsx';
import PreviewPlaceholder from '../components/layout/PreviewPlaceholder.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import WorkspaceLayout from '../components/layout/WorkspaceLayout.jsx';
import { DashboardPage } from '../features/dashboard/index.js';
import { ApplicationsPage, CandidatesPage } from '../features/applications/index.js';
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
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:jobId" element={<JobDetailsPage />} />
      </Route>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<WorkspaceLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="resume" element={<PreviewPlaceholder title="Resume workspace" embedded />} />
          <Route path="alerts" element={<PreviewPlaceholder title="Job alerts workspace" embedded />} />
          <Route path="employer/jobs" element={<PreviewPlaceholder title="Employer jobs workspace" embedded />} />
          <Route path="employer/candidates" element={<CandidatesPage />} />
          <Route path="admin" element={<PreviewPlaceholder title="Administration workspace" embedded />} />
          <Route path="account" element={<PreviewPlaceholder title="Account settings" embedded />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
