import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Password reset requested for:', email);
    
    // Add your password reset API call here
    // For now, just show success message
    setIsSubmitted(true);
    
    // Optionally redirect back to login after a delay
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {!isSubmitted ? (
          <>
            <h1 className="forgot-password-title">Forgot Password</h1>
            <p className="forgot-password-description">
              Provide the email address associated with your account to recover your password.
            </p>

            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  required
                  className="email-input"
                />
              </div>

              <button type="submit" className="reset-button">
                Reset Password
              </button>

              <button 
                type="button" 
                onClick={handleBackToLogin}
                className="back-to-login"
              >
                Back to Login
              </button>
            </form>
          </>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Check Your Email</h2>
            <p>
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="redirect-text">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;

