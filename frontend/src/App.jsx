<<<<<<< HEAD
import react from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoutes from "./components/ProtectedRoute";

// Logs the User out by clearing all tokens
function Logout()
{
  localStorage.clear();
  return <Navigate to="/login" />
}

// Clear tokens after registration
function RegisterAndLogout(){
  localStorage.clear();
  return <Register />
}

// This part list out all the routes 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path = "/"
          element = {
            <ProtectedRoutes>
              <Home/>
            </ProtectedRoutes>
          }
        />
        <Route path="/login" element={<Login/>}/>
        <Route path="/logout" element={<Logout/>}/>
        <Route path="/register" element={<RegisterAndLogout/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
=======
import { useState } from 'react'
import SignUp from './SignUp'
import './App.css'

function Login({ onSwitchToSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempted with:', username, password);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
               style={{color: '#667eea', fontWeight: 'bold'}}>
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
>>>>>>> 0bf2b6b (Added login and sign up pages)
}

function App() {
  const [showSignUp, setShowSignUp] = useState(false);

  if (showSignUp) {
    return <SignUp />;
  }

  return <Login onSwitchToSignUp={() => setShowSignUp(true)} />;
}

export default App;

