import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import LandingPreviewApp from './app/LandingPreviewApp.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LandingPreviewApp />
    </BrowserRouter>
  </React.StrictMode>,
);
