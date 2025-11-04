import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="register-container">
      <h2>Register</h2>
      <RegisterForm />
      <p>
        Already have an account?{" "}
        <span className="register-link" onClick={() => navigate("/login")}>
          Login
        </span>
      </p>
    </div>
  );
}

export default Register;
