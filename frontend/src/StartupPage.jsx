import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartupPage.css'; // if you have a CSS file

function StartupPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login'); // ✅ This navigates to your login page
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top waves */}
      <svg style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '200px',
        transform: 'rotate(180deg)',
        opacity: 0.15
      }} viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,50 C300,100 500,0 800,50 C1000,80 1100,30 1200,50 L1200,0 L0,0 Z" 
              fill="rgba(255,255,255,0.5)"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2">
          <animate attributeName="d" 
                   dur="8s" 
                   repeatCount="indefinite"
                   values="M0,50 C300,100 500,0 800,50 C1000,80 1100,30 1200,50 L1200,0 L0,0 Z;
                           M0,80 C300,30 500,90 800,40 C1000,20 1100,70 1200,60 L1200,0 L0,0 Z;
                           M0,50 C300,100 500,0 800,50 C1000,80 1100,30 1200,50 L1200,0 L0,0 Z"/>
        </path>
      </svg>

      {/* Bottom waves - more defined */}
      <svg style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '250px',
        opacity: 0.2
      }} viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,50 C300,100 500,0 800,50 C1000,80 1100,30 1200,50 L1200,120 L0,120 Z" 
              fill="rgba(255,255,255,0.4)"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="3">
          <animate attributeName="d" 
                   dur="10s" 
                   repeatCount="indefinite"
                   values="M0,50 C300,100 500,0 800,50 C1000,80 1100,30 1200,50 L1200,120 L0,120 Z;
                           M0,80 C300,30 500,90 800,40 C1000,20 1100,70 1200,60 L1200,120 L0,120 Z;
                           M0,50 C300,100 500,0 800,50 C1000,80 1100,30 1200,50 L1200,120 L0,120 Z"/>
        </path>
      </svg>

      <div style={{
        textAlign: 'center',
        color: 'white',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo */}
        <div style={{ 
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {/* Icons Row */}
          <div style={{
            display: 'flex',
            gap: '2.5rem',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Walking Person - Simple stick figure with smile */}
            <svg width="50" height="60" viewBox="0 0 50 70" fill="none">
              <circle cx="25" cy="12" r="8" fill="#1e3a8a" stroke="white" strokeWidth="2"/>
              <circle cx="22" cy="11" r="1.5" fill="white"/>
              <circle cx="28" cy="11" r="1.5" fill="white"/>
              <path d="M20 14 Q25 17 30 14" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M25 20 L25 42" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <path d="M25 26 L15 32" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <path d="M25 26 L35 32" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <path d="M25 42 L18 60" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <path d="M25 42 L32 60" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>

            {/* Bicycle - More defined */}
            <svg width="80" height="60" viewBox="0 0 100 70" fill="none">
              {/* Back wheel */}
              <circle cx="25" cy="50" r="15" fill="none" stroke="#93c5fd" strokeWidth="4"/>
              <circle cx="25" cy="50" r="10" fill="none" stroke="#93c5fd" strokeWidth="1.5"/>
              <line x1="25" y1="35" x2="25" y2="65" stroke="#93c5fd" strokeWidth="1.5"/>
              <line x1="10" y1="50" x2="40" y2="50" stroke="#93c5fd" strokeWidth="1.5"/>
              
              {/* Front wheel */}
              <circle cx="75" cy="50" r="15" fill="none" stroke="#93c5fd" strokeWidth="4"/>
              <circle cx="75" cy="50" r="10" fill="none" stroke="#93c5fd" strokeWidth="1.5"/>
              <line x1="75" y1="35" x2="75" y2="65" stroke="#93c5fd" strokeWidth="1.5"/>
              <line x1="60" y1="50" x2="90" y2="50" stroke="#93c5fd" strokeWidth="1.5"/>
              
              {/* Frame */}
              <path d="M25 50 L50 30 L75 50" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M50 30 L50 42" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M42 50 L50 42 L58 50" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              
              {/* Handlebars */}
              <path d="M50 30 L60 25" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="60" cy="25" r="2.5" fill="#93c5fd"/>
              
              {/* Seat */}
              <line x1="45" y1="27" x2="55" y2="27" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round"/>
            </svg>

            {/* Car - Simple and clean */}
            <svg width="80" height="60" viewBox="0 0 100 70" fill="none">
              <rect x="10" y="35" width="80" height="25" rx="5" fill="#1e3a8a" stroke="white" strokeWidth="2"/>
              <path d="M20 35 L30 20 L70 20 L80 35" fill="#1e3a8a" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <rect x="32" y="25" width="15" height="10" fill="#93c5fd" rx="2"/>
              <rect x="53" y="25" width="15" height="10" fill="#93c5fd" rx="2"/>
              <circle cx="30" cy="60" r="6" fill="white"/>
              <circle cx="70" cy="60" r="6" fill="white"/>
              <circle cx="30" cy="60" r="3" fill="#1e3a8a"/>
              <circle cx="70" cy="60" r="3" fill="#1e3a8a"/>
            </svg>
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
          onClick={handleGetStarted}
          style={{
            backgroundColor: 'white',
            color: '#1d4ed8',
            border: 'none',
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '9999px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default StartupPage;

