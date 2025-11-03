// import { useState } from "react";
// import api from "../api";
// import { useNavigate } from "react-router-dom";
// import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

// function Form({ route, method }) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const name = method === "login" ? "Login" : "Register";

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await api.post(route, { username, email, password });

//       if (method === "login") {
//         // save tokens to local storage
//         localStorage.setItem(ACCESS_TOKEN, res.data.access);
//         localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
//         localStorage.setItem("username", username);
//         console.log("Saved username:", localStorage.getItem("username"));
//         navigate("/home");
//       } 
//       else if (method === "register") {
//         alert("Registration successful!");
//         navigate("/login");
//       } 
//     } catch (error) {
//       console.error("Error:", error);
//       alert("Invalid username or password.");
//     } finally {
//       setLoading(false);
//     }
//   };

//     // Add everything together into a form
//     return <form onSubmit={handleSubmit}>
//         <input type = "text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username"/>
//         <input type="text" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email (optional)" />
//         <input type = "text" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="password"/>
//         <button type="submit"> {name} </button>
//     </form>
// }

// export default Form