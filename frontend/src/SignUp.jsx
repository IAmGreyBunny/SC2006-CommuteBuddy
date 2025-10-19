import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';


function SignUp({ onSignUpSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [reEmail, setReEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();


  // Email validation - must have valid format with @ and domain
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  // Password validation - at least 6 characters and 1 special character
  const validatePassword = (password) => {
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 6;
    return { isLongEnough, hasSpecialChar };
  };


  const handleSubmit = (e) => {
    e.preventDefault();
   
    const newErrors = {};


    // Validate full name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }


    // Validate email format
    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email (e.g., user@gmail.com)';
    }
   
    // Check if emails match
    if (email !== reEmail) {
      newErrors.reEmail = 'Emails do not match!';
    }


    // Validate email format for re-entered email
    if (!validateEmail(reEmail)) {
      newErrors.reEmail = 'Please enter a valid email';
    }
   
    // Validate password
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isLongEnough) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (!passwordCheck.hasSpecialChar) {
      newErrors.password = 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
    }
   
    // Check if passwords match
    if (password !== rePassword) {
      newErrors.rePassword = 'Passwords do not match!';
    }


    // If there are errors, display them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }


    // Clear errors if validation passes
    setErrors({});
   
    console.log('Sign up attempted with:', { fullName, email, password });
    alert('Account created successfully!');
   
    // Pass user data and navigate to login page
    if (onSignUpSuccess) {
      onSignUpSuccess({ fullName, email });
    }
   
    // Navigate to login after successful signup
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
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({...errors, fullName: ''});
              }}
              placeholder="Enter Full Name"
              required
            />
            {errors.fullName && <p className="error-message">{errors.fullName}</p>}
          </div>


          <div className="form-field">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({...errors, email: ''});
              }}
              placeholder="Enter Email (e.g., user@gmail.com)"
              required
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>


          <div className="form-field">
            <input
              type="email"
              value={reEmail}
              onChange={(e) => {
                setReEmail(e.target.value);
                if (errors.reEmail) setErrors({...errors, reEmail: ''});
              }}
              placeholder="Re-Enter Email"
              required
            />
            {errors.reEmail && <p className="error-message">{errors.reEmail}</p>}
          </div>


          <div className="form-field password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({...errors, password: ''});
              }}
              placeholder="Enter Password (min 6 chars with special char)"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>


          <div className="form-field password-field">
            <input
              type={showRePassword ? "text" : "password"}
              value={rePassword}
              onChange={(e) => {
                setRePassword(e.target.value);
                if (errors.rePassword) setErrors({...errors, rePassword: ''});
              }}
              placeholder="Re-enter Password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowRePassword(!showRePassword)}
            >
              {showRePassword ? '👁️' : '👁️‍🗨️'}
            </button>
            {errors.rePassword && <p className="error-message">{errors.rePassword}</p>}
          </div>


          <button type="submit" className="signup-button">
            Sign Up
          </button>


          <p style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280' }}>
            Already have an account?{' '}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              style={{ color: '#0095FF', fontWeight: '600', textDecoration: 'none' }}
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}


export default SignUp;





