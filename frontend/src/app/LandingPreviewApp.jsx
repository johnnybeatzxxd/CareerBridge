import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../features/landing/LandingPage.jsx';
import { LoginPage, RegisterPage, VerifyEmailPage } from '../features/auth/index.js';
import { JobDetailsPage, JobsPage } from '../features/jobs/index.js';
import PublicHeader from '../components/layout/PublicHeader.jsx';
import PreviewPlaceholder from '../components/layout/PreviewPlaceholder.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import WorkspaceLayout from '../components/layout/WorkspaceLayout.jsx';
import { DashboardPage } from '../features/dashboard/index.js';
import { ApplicationsPage, CandidateProfilePage, CandidatesPage } from '../features/applications/index.js';
import { ResumePage } from '../features/resume/index.js';
import { AlertsPage } from '../features/alerts/index.js';
import { EmployerJobsPage } from '../features/employer/index.js';
import { WalletPage } from '../features/wallet/index.js';
import { apiRequest } from '../api.js';
import { AccountPage } from '../features/account/index.js';

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
      <Route path="verify-email" element={<VerifyEmailPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<WorkspaceLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="employer/jobs" element={<EmployerJobsPage />} />
          <Route path="employer/candidates" element={<CandidatesPage />} />
          <Route path="employer/candidates/:applicationId" element={<CandidateProfilePage />} />
          <Route path="admin" element={<PreviewPlaceholder title="Administration workspace" embedded />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
