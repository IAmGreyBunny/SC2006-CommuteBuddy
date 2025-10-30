import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ ADD THIS
import './SignUp.css';

function SignUp({ onSignUpSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [reEmail, setReEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const navigate = useNavigate(); // ✅ ADD THIS

  // Email validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password validation
  const isValidPassword = (password) => {
    const specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharPattern.test(password)) return false;

    const regularChars = password.replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');
    return regularChars.length >= 5;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all input fields
    if (!isValidEmail(email)) {
      alert('Invalid email address! Please enter a valid email.');
      return;
    }

    if (email !== reEmail) {
      alert('Emails do not match! Please re-enter your email.');
      return;
    }

    if (!isValidPassword(password)) {
      alert('Invalid password!\n\nPassword must have:\n• At least 5 regular characters\n• At least 1 special character.');
      return;
    }

    if (password !== rePassword) {
      alert('Passwords do not match! Please re-enter your password.');
      return;
    }

    console.log('Sign up attempted with:', { fullName, email, password });
    alert('Account created successfully!');

    // ✅ Pass user data up (optional)
    if (onSignUpSuccess) {
      onSignUpSuccess({ fullName, email });
    }

    // ✅ Navigate to login page after success
    navigate('/login');
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <h1>Create an Account</h1>
        <p className="subtitle">Join to plan, track, and ride smarter</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter Full Name"
              required
            />
          </div>

          <div className="form-field">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              required
            />
          </div>

          <div className="form-field">
            <input
              type="email"
              value={reEmail}
              onChange={(e) => setReEmail(e.target.value)}
              placeholder="Re-Enter Email"
              required
            />
          </div>

          <div className="form-field password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁️
            </button>
          </div>

          <div className="form-field password-field">
            <input
              type={showRePassword ? 'text' : 'password'}
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              placeholder="Re-enter Password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowRePassword(!showRePassword)}
            >
              👁️
            </button>
          </div>

          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;

