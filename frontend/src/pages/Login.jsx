import { useNavigate } from "react-router-dom";
import Form from "../components/Form";
import "./Login.css";

function Login() {
  const navigate = useNavigate(); 

  return (
    <div className="login-container">
      <h2>Login</h2>
      <Form route="/api/token/" method="login" />   
      <p>
        Forgot your password?{" "}
        <span className="login-link" onClick={() => navigate("/forgot-password")}>
          Reset here
        </span>
      </p>
      <p>
        Don't have an account?{" "}
        <span className="login-link" onClick={() => navigate("/register")}>
          Register
        </span>
      </p>
    </div>
  );
}

export default Login;
