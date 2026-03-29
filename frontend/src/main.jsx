import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import LandingPreviewApp from './app/LandingPreviewApp.jsx';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LandingPreviewApp />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
