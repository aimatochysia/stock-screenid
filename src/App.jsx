import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <ThemeProvider>
      {showDashboard ? (
        <Dashboard />
      ) : (
        <LandingPage onEnter={() => setShowDashboard(true)} />
      )}
    </ThemeProvider>
  );
}
