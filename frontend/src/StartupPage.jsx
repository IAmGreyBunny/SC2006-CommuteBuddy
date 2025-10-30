import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartupPage.css';
const logoPath = '/icon.png'; 

function StartupPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login'); // ✅ This navigates to your login page
  };

  return (
    <div className="startup-container">
      <div className="startup-content">
        <div className="logo">
          <div className="logo-icon">
            <img src={logoPath} alt="CommuteBuddy logo" className="app-logo" />
          </div>
          
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            margin: '0',
            letterSpacing: '-0.02em',
            lineHeight: '1.1',
            fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            Commute<span style={{ color: '#93c5fd' }}>Buddy</span>
          </h1>
        </div>
        
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2.5rem',
          opacity: '0.95',
          fontWeight: '300'
        }}>
          Your smarter, stress-free commute
        </p>
        
        <button
          className="get-started-btn"
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default StartupPage;
