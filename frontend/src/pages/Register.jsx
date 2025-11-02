// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// function Register() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [rePassword, setRePassword] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (password !== rePassword) {
//       alert("Passwords do not match!");
//       return;
//     }
//     // TEMP SUCCESS → Go Login
//     navigate("/login");
//   };

//   return (
//     <div style={styles.container}>
//       <h2>Register</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           style={styles.input}
//           type="email"
//           placeholder="Enter Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           style={styles.input}
//           type="password"
//           placeholder="Enter Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <input
//           style={styles.input}
//           type="password"
//           placeholder="Re-enter Password"
//           value={rePassword}
//           onChange={(e) => setRePassword(e.target.value)}
//         />
//         <button style={styles.button} type="submit">Register</button>
//       </form>

//       <p>
//         Already have an account?{" "}
//         <span style={styles.link} onClick={() => navigate("/login")}>
//           Login
//         </span>
//       </p>
//     </div>
//   );
// }

// const styles = {
//   container: { maxWidth: "400px", margin: "auto", textAlign: "center", padding: "20px" },
//   input: { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "5px" },
//   button: { width: "100%", padding: "10px", background: "#0095FF", color: "white", border: "none", borderRadius: "5px" },
//   link: { color: "#0095FF", cursor: "pointer" }
// };

// export default Register;







import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== rePassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username,
          email: email, 
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        // Handle validation errors
        if (data.email) {
          alert(`Email error: ${data.email[0]}`);
        } else if (data.username) {
          alert(`Username error: ${data.username[0]}`);
        } else if (data.password) {
          alert(`Password error: ${data.password[0]}`);
        } else {
          alert("Registration failed: " + JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Cannot connect to server! Make sure your backend is running on http://localhost:8000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Re-enter Password"
          value={rePassword}
          onChange={(e) => setRePassword(e.target.value)}
          required
        />
        <button 
          style={styles.button} 
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : "Register"}
        </button>
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
  input: { 
    width: "100%", 
    padding: "10px", 
    margin: "8px 0", 
    borderRadius: "5px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  },
  button: { 
    width: "100%", 
    padding: "10px", 
    background: "#0095FF", 
    color: "white", 
    border: "none", 
    borderRadius: "5px",
    cursor: "pointer"
  },
  link: { color: "#0095FF", cursor: "pointer" }
};

export default Register;

