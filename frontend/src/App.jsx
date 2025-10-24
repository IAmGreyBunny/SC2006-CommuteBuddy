import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './SignUp';
import StartupPage from './StartupPage';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import MyTrips from './pages/myTrips';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import LiveTracker from './pages/LiveTracker';
import MrtNames from './pages/MrtNames';
import './App.css';


function App() {
  const [userData, setUserData] = useState({ fullName: 'James Lee' });

  const handleSignUpSuccess = (signupData) => {
    setUserData(signupData);
    localStorage.setItem('user', JSON.stringify(signupData));
  };

  const handleLoginSuccess = (loginData) => {
    setUserData(loginData);
    localStorage.setItem('user', JSON.stringify(loginData));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartupPage />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<SignUp onSignUpSuccess={handleSignUpSuccess} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home userName={userData.fullName} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-trips"
          element={
            <ProtectedRoute>
              <MyTrips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/LiveTracker"
          element={
            <ProtectedRoute>
              <LiveTracker />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/MrtNames"
          element={
            <ProtectedRoute>
              <MrtNames/>
            </ProtectedRoute>
          }
        />


        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

