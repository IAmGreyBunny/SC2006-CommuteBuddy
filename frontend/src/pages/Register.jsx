import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== rePassword) {
      alert("Passwords do not match!");
      return;
    }
    // TEMP SUCCESS → Go Login
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          style={styles.input}
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Re-enter Password"
          value={rePassword}
          onChange={(e) => setRePassword(e.target.value)}
        />
        <button style={styles.button} type="submit">Register</button>
      </form>

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
  input: { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "5px" },
  button: { width: "100%", padding: "10px", background: "#0095FF", color: "white", border: "none", borderRadius: "5px" },
  link: { color: "#0095FF", cursor: "pointer" }
};

export default Register;

