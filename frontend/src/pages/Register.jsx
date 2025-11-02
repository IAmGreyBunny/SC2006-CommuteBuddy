import { useNavigate } from "react-router-dom";
import Form from "../components/Form";

function Register() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <Form route="/api/user/register/" method="register" />
      <p>
        Already have an account?{" "}
        <span style={styles.link} onClick={() => navigate("/login")}>
          Login
        </span>
      </p>
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "auto", textAlign: "center", padding: "20px" },
  link: { color: "#0095FF", cursor: "pointer" },
};

export default Register;
