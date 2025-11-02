import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SignUp from './SignUp';
import StartupPage from './StartupPage';
import Home from './pages/Home';
import MyTrips from './pages/myTrips';
import Settings from './pages/Settings';
import NearbyCarparks from './pages/NearbyCarparks';
import CrowdDensity from './pages/CrowdDensity';
import LiveTracker from './pages/LiveTracker';
import NotFound from './pages/NotFound';

import DensityDebugger from './pages/DensityDebugger.jsx';
import BusDebugger from './pages/BusDebugger';

// Import Form and ForgotPassword to use them directly
import Form from './components/Form';
import ForgotPassword from './pages/ForgotPassword'; 
import './App.css';

// Custom Login wrapper using your centralized Form.jsx
function LoginWrapper() {
    return (
        <div className="login-container">
            <div className="login-card">
                <Form route="/token/" method="login" />
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px' }}>
                    Don't have an account?{' '}
                    <a href="/register" style={{ color: '#0095FF', fontWeight: 'bold' }}>
                        Sign Up
                    </a>
                </p>
                <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
            </div>
        </div>
    );
}

// ProtectedRoute checks localStorage for a simple token/user presence.
// We keep this check simple and rely on the imported component in components/
const ProtectedRoute = ({ children }) => {
    // This assumes your ProtectedRoute.jsx handles the actual JWT logic
    const isAuthenticated = !!localStorage.getItem('access'); 
    return isAuthenticated ? children : <Navigate to="/login" />;
};

//not found page
const NotFoundPage = () => ( // Renamed to avoid collision with file import
  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

function AppRoutes() { // Renamed from App to AppRoutes for clean usage with BrowserRouter
  const [userData] = useState({ fullName: 'James Lee' });

    // Note: navigate is now imported from react-router-dom at the top level
  return (
    <Routes>
      <Route path="/" element={<StartupPage />} />
      
      {/* AUTH ROUTES: Use Form.jsx component directly */}
      <Route path="/login" element={<LoginWrapper />} />
      <Route path="/register" element={<Form route="/user/register/" method="register" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      

      {/* CORE PROTECTED APPLICATION PAGES */}
      <Route path="/home" element={<ProtectedRoute><Home userName={userData.fullName} /></ProtectedRoute>} />
      <Route path="/my-trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/NearbyCarparks" element={<ProtectedRoute><NearbyCarparks /></ProtectedRoute>} />

      {/* LIVE TRACKER & CROWD DENSITY PAGES */}
      <Route
    path="/LiveTracker"
    element={
        // <ProtectedRoute>
            <LiveTracker /> 
            //{/* <BusDebugger />  <-- TEMPORARILY USE THIS FOR TESTING */}
        //</Routes>/* </ProtectedRoute>
    }
/>
      {/* Crowd Density Routes: one for selector view, one for deep link */}
      <Route path="/CrowdDensity" element={
            // <ProtectedRoute>
            // <DensityDebugger />
              <CrowdDensity />
            // 
            } />
      <Route path="/crowd-density/:stationCode" element={
        // <ProtectedRoute>
          <CrowdDensity />
          // <DensityDebugger />
        // </ProtectedRoute>
        } />


      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function WrappedApp() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
