import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const handleGuestLogin = () => {
    navigate("/home");
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <div className="login-box">
        <LoginForm />

        <div className="guest-login">
          <button className="guest-button" onClick={handleGuestLogin}>
            Continue as Guest
          </button>
        </div>
      </div>

      <p>
        Forgot your password?{" "}
        <span className="login-link" onClick={() => navigate("/forgot-password")}>
          Reset here
        </span>
      </p>
      <p>
        Don’t have an account?{" "}
        <span className="login-link" onClick={() => navigate("/register")}>
          Register
        </span>
      </p>
      
    </div>
  );
}

export default Login;
