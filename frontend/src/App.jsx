import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SignUp from './SignUp';
import StartupPage from './StartupPage';
import Home from './pages/Home';
import MyTrips from './pages/myTrips';
import Settings from './pages/Settings';
import NearbyCarparks from './pages/NearbyCarparks';
import CarparkSourceForm from './pages/CarparkSourceForm';
import CrowdDensity from './pages/CrowdDensity';
import LiveTracker from './pages/LiveTracker';
import DensityDebugger from './pages/DensityDebugger.jsx';
import BusDebugger from './pages/BusDebugger';
import './App.css';


function Login({ onSwitchToSignUp, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempted with:', email, password);

    onLoginSuccess();
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button type="submit">Login</button>
          <a href="#" className="forgot-password">Forgot Password?</a>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Don't have an account?{' '}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onSwitchToSignUp(); }}
              style={{ color: '#0095FF', fontWeight: 'bold' }}
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

//protected route

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('user'); // simple auth check
  return isLoggedIn ? children : <Navigate to="/login" />;
};

//not found page

const NotFound = () => (
  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

function App() {
  const [userData, setUserData] = useState({ fullName: 'James Lee' });

  const handleSignUpSuccess = (signupData) => {
    setUserData(signupData);
    localStorage.setItem('user', JSON.stringify(signupData)); // save login state
  };

  const handleLoginSuccess = () => {
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const navigate = useNavigate(); // used for callbacks

  return (
    <Routes>
      <Route path="/" element={<StartupPage />} />
      <Route
        path="/login"
        element={
          <Login
            onSwitchToSignUp={() => navigate('/signup')}
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />
      <Route
        path="/signup"
        element={<SignUp onSignUpSuccess={handleSignUpSuccess} />}
      />
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
        path="/NearbyCarparks"
        element={
            <NearbyCarparks />
        }
      />
      <Route
        path="/CarparkSourceForm"
        element={
          <ProtectedRoute>
            <CarparkSourceForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/LiveTracker"
        element={
        // <ProtectedRoute>
            <LiveTracker /> 
            //{/* <BusDebugger />  <-- TEMPORARILY USE THIS FOR TESTING */}
        //</Routes>/* </ProtectedRoute>
        }
      />

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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
export default function WrappedApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
