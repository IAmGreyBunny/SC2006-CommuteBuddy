// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // TEMP LOGIN SUCCESS → Go Home
//     navigate("/home");
//   };

//   return (
//     <div style={styles.container}>
//       <h2>Login</h2>
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
//         <button style={styles.button} type="submit">Login</button>
//       </form>

//       <p>
//         Forgot your password?{" "}
//         <span style={styles.link} onClick={() => navigate("/forgot-password")}>
//           Reset here
//         </span>
//       </p>

//       <p>
//         Don't have an account?{" "}
//         <span style={styles.link} onClick={() => navigate("/register")}>
//           Register
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

// export default Login;





















// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Login.css";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // TEMP LOGIN SUCCESS → Go Home
//     navigate("/home");
//   };

//   return (
//     <div className="login-container">
//       <h2>Login</h2>

//       <form onSubmit={handleSubmit}>
//         <input
//           className="login-input"
//           type="email"
//           placeholder="Enter Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           className="login-input"
//           type="password"
//           placeholder="Enter Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button className="login-button" type="submit">
//           Login
//         </button>
//       </form>

//       <p>
//         Forgot your password?{" "}
//         <span
//           className="login-link"
//           onClick={() => navigate("/ForgotPassword")}
//         >
//           Reset here
//         </span>
//       </p>

//       <p>
//         Don't have an account?{" "}
//         <span className="login-link" onClick={() => navigate("/register")}>
//           Register
//         </span>
//       </p>
//     </div>
//   );
// }

// export default Login;





import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/token/', { // ✅ Correct JWT endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT tokens
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        navigate("/");
      } else {
        alert(data.detail || "Invalid email or password!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Cannot connect to server! Make sure your backend is running on http://localhost:8000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="login-input"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button 
          className="login-button" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>

      <p>
        Forgot your password?{" "}
        <span
          className="login-link"
          onClick={() => navigate("/ForgotPassword")}
        >
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
