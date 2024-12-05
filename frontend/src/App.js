import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Contact from './components/Contact';
import AlertSettings from './components/AlertSettings';
import Reports from './components/Reports';
import MainLayout from './layouts/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import ResetPassword from './components/ResetPassword';
import SettlementFailsReport from './components/SettlementFailsReport';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes with MainLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="contact" element={<Contact />} />
              <Route path="settings/alerts" element={<AlertSettings />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/settlement-fails" element={<SettlementFailsReport />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 