import { useState } from 'react';
import './ChangeAccountDetails.css';

function ChangeAccountDetails({ onUpdate }) {
  const [name, setName] = useState('James Lee');
  const [email, setEmail] = useState('jameslee01@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    onUpdate({ name, email, password });
  };

  return (
    <div className="change-account-container">
      <div className="change-account-content">
        <h1 className="page-title">Change Account Details</h1>
        <p className="page-subtitle">Join to plan, track, and ride smarter</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-field"
            />
          </div>

          <div className="input-group password-group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              className="input-field"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <div className="input-group password-group">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="input-field"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button type="submit" className="update-btn">
            Update
          </button>
        </form>
      </div>

      <div className="home-indicator"></div>
    </div>
  );
}

export default ChangeAccountDetails;

