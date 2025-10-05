import { useState } from 'react';
import SignUp from './SignUp';
import StartupPage from './StartupPage';
import Home from './pages/Home';
import './App.css';
import MyTrips from './pages/myTrips';
import Settings from './pages/Settings';

function Login({ onSwitchToSignUp, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempted with:', email, password);
    onLoginSuccess();
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
          <p style={{textAlign: 'center', marginTop: '1rem'}}>
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignUp(); }} 
               style={{color: '#0095FF', fontWeight: 'bold'}}>
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('startup');
  const [userData, setUserData] = useState({ fullName: 'James Lee' });

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const handleSignUpSuccess = (signupData) => {
    setUserData(signupData);
    setCurrentPage('login');
  };

  if (currentPage === 'startup') {
    return <StartupPage onGetStarted={() => setCurrentPage('login')} />;
  }

  if (currentPage === 'login') {
    return <Login 
      onSwitchToSignUp={() => setCurrentPage('signup')} 
      onLoginSuccess={() => setCurrentPage('Home')}
    />;
  }

  if (currentPage === 'signup') {
    return <SignUp onSignUpSuccess={handleSignUpSuccess} />;
  }

  if (currentPage === 'Home') {
    return <Home userName={userData.fullName} navigateTo={navigateTo} />;
  }

  if (currentPage === 'myTrips') {
    return <MyTrips navigateTo={navigateTo} />;
  }

  if (currentPage === 'Settings') {
    return <Settings navigateTo={navigateTo} />;
  }
  return null;
}

export default App;

