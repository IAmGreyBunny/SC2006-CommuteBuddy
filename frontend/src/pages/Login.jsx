import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempted with:', email, password);
    
    const loginData = {
      fullName: 'James Lee',
      email: email
    };
    
    localStorage.setItem('access', 'dummy-token-for-now');
    localStorage.setItem('refresh', 'dummy-refresh-token');
    localStorage.setItem('user', JSON.stringify(loginData));
    
    if (onLoginSuccess) {
      onLoginSuccess(loginData);
    }
    
    navigate('/home');
  };

  const handleSignUpClick = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
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
      overflow: 'hidden',
      padding: '2rem'
    }}>
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
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '3rem 2.5rem',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.875rem',
              fontSize: '1.05rem',
              fontWeight: '600',
              color: 'white',
              backgroundColor: '#0095FF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0077CC';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#0095FF';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Login
          </button>

          <a
            href="#"
            onClick={handleForgotPasswordClick}
            style={{
              display: 'block',
              textAlign: 'center',
              color: '#0095FF',
              fontSize: '0.95rem',
              textDecoration: 'none',
              marginBottom: '1rem'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Forgot Password?
          </a>

          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.95rem',
            margin: 0
          }}>
            Don't have an account?{' '}
            <a
              href="#"
              onClick={handleSignUpClick}
              style={{
                color: '#0095FF',
                fontWeight: '600',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;


