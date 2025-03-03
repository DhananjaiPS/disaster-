import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import EmergencySOSPage from './pages/EmergencySOSPage';
import DisasterTrackingPage from './pages/DisasterTrackingPage';
import RecoveryPage from './pages/RecoveryPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/emergency-sos" element={<EmergencySOSPage />} />
          <Route path="/disaster-tracking" element={<DisasterTrackingPage />} />
          <Route path="/recovery" element={<RecoveryPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 