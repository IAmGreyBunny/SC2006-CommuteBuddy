// import { useState } from "react";
// import api from "../api";
// import { useNavigate } from "react-router-dom";
// import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
// import "../styles/Form.css"; 

// function Form({ route, method }) {
//     const [fullName, setFullName] = useState("");
//     const [email, setEmail] = useState("");
//     const [reEmail, setReEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [rePassword, setRePassword] = useState("");
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const name = method === "login" ? "Login" : "Register";

//     // Email validation function
//     const isValidEmail = (email) => {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return emailRegex.test(email);
//     };

//     // Password validation function
//     const isValidPassword = (password) => {
//         const specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
//         
//         if (!specialCharPattern.test(password)) {
//             return false;
//         }
//         
//         const regularChars = password.replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');
//         
//         if (regularChars.length < 5) {
//             return false;
//         }
//         
//         return true;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (method === "register") {
//             if (!fullName.trim()) {
//                 alert("❌ Please enter your full name!");
//                 return;
//             }

//             if (!isValidEmail(email)) {
//                 alert("❌ Invalid email address! Please enter a valid email (e.g., example@gmail.com)");
//                 return;
//             }

//             if (email !== reEmail) {
//                 alert("❌ Emails do not match! Please re-enter your email.");
//                 return;
//             }

//             if (!isValidPassword(password)) {
//                 alert("❌ Invalid password! Password must have:\n• At least 5 regular characters (letters/numbers)\n• At least 1 special character (!@#$%^&* etc.)");
//                 return;
//             }

//             if (password !== rePassword) {
//                 alert("❌ Passwords do not match! Please re-enter your password.");
//                 return;
//             }
//         }

//         if (method === "login") {
//             if (!isValidEmail(email)) {
//                 alert("❌ Invalid email address!");
//                 return;
//             }
//         }

//         setLoading(true);
        
//         let payload = {};

//         // === UPDATED PAYLOAD LOGIC ===
//         if (method === "login") {
//             // Send both username (email) and email explicitly for robustness with DRF-SimpleJWT
//             payload = {
//                 username: email, 
//                 email: email, // Explicitly include email for Django check
//                 password,
//             };
//         } else { // Register
//             payload = {
//                 email: email, 
//                 username: email, // Using email as username for registration
//                 password,
//             };
//         }
//         // ============================

//         try {
//             const res = await api.post(route, payload);
            
//             // Handle registration success
//             if (route.includes("register")) {
//                 alert("✅ Registration successful! Please login.");
//                 navigate("/login");
//             } 
//             // Handle login success
//             else if (route.includes("token")) {
//                 localStorage.setItem(ACCESS_TOKEN, res.data.access);
//                 localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
//                 // Also store the user flag needed by your custom ProtectedRoute
//                 localStorage.setItem('user', JSON.stringify({ fullName: fullName || email })); 
//                 navigate("/LiveTracker"); // Navigate to the main feature
//             }
//         } catch (error) {
//             const errorMessage = error.response?.data?.detail || error.response?.data?.username?.[0] || error.response?.data?.email?.[0] || "An unknown error occurred. Check server response for details.";
//             alert(`❌ ${errorMessage}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="form-container">
//             <h1>{name}</h1>
//             
//             {method === "register" && (
//                 <>
//                     <input
//                         className="form-input"
//                         type="text"
//                         value={fullName}
//                         onChange={(e) => setFullName(e.target.value)}
//                         placeholder="Enter Full Name"
//                         required
//                     />
//                     <input
//                         className="form-input"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="Enter Email"
//                         required
//                     />
//                     <input
//                         className="form-input"
//                         type="email"
//                         value={reEmail}
//                         onChange={(e) => setReEmail(e.target.value)}
//                         placeholder="Re-Enter Email"
//                         required
//                     />
//                 </>
//             )}

//             {method === "login" && (
//                 <input
//                     className="form-input"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter Email (Username)"
//                     required
//                 />
//             )}

//             <input
//                 className="form-input"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter Password"
//                 required
//             />

//             {method === "register" && (
//                 <input
//                     className="form-input"
//                     type="password"
//                     value={rePassword}
//                     onChange={(e) => setRePassword(e.target.value)}
//                     placeholder="Re-enter Password"
//                     required
//                 />
//             )}

//             <button className="form-button" type="submit" disabled={loading}>
//                 {loading ? "Loading..." : name}
//             </button>
//         </form>
//     );
// }

// export default Form;



















// import { useState } from "react";
// import api from "../api";
// import { useNavigate } from "react-router-dom";
// import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
// import "../styles/Form.css"; 

// function Form({ route, method }) {
//     const [fullName, setFullName] = useState("");
//     const [email, setEmail] = useState("");
//     const [reEmail, setReEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [rePassword, setRePassword] = useState("");
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const name = method === "login" ? "Login" : "Register";

//     // Email validation function
//     const isValidEmail = (email) => {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return emailRegex.test(email);
//     };

//     // Password validation function
//     const isValidPassword = (password) => {
//         const specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
//         
//         if (!specialCharPattern.test(password)) {
//             return false;
//         }
//         
//         const regularChars = password.replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');
//         
//         if (regularChars.length < 5) {
//             return false;
//         }
//         
//         return true;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (method === "register") {
//             if (!fullName.trim()) {
//                 alert("❌ Please enter your full name!");
//                 return;
//             }

//             if (!isValidEmail(email)) {
//                 alert("❌ Invalid email address! Please enter a valid email (e.g., example@gmail.com)");
//                 return;
//             }

//             if (email !== reEmail) {
//                 alert("❌ Emails do not match! Please re-enter your email.");
//                 return;
//             }

//             if (!isValidPassword(password)) {
//                 alert("❌ Invalid password! Password must have:\n• At least 5 regular characters (letters/numbers)\n• At least 1 special character (!@#$%^&* etc.)");
//                 return;
//             }

//             if (password !== rePassword) {
//                 alert("❌ Passwords do not match! Please re-enter your password.");
//                 return;
//             }
//         }

//         if (method === "login") {
//             if (!isValidEmail(email)) {
//                 alert("❌ Invalid email address!");
//                 return;
//             }
//         }

//         setLoading(true);
        
//         let payload = {};

//         // === SIMPLIFIED PAYLOAD LOGIC TO FIX 400/TOKEN ERROR ===
//         if (method === "login") {
//             // Use the standard field name 'username' for the authentication endpoint,
//             // providing the email address as the value.
//             payload = {
//                 username: email, 
//                 password,
//             };
//         } else { // Register
//             // Registration requires these fields as per your serializer setup
//             payload = {
//                 email: email, 
//                 username: email, 
//                 password,
//             };
//         }
//         // ========================================================

//         try {
//             const res = await api.post(route, payload);
            
//             // Handle registration success
//             if (route.includes("register")) {
//                 alert("✅ Registration successful! Please login.");
//                 navigate("/login");
//             } 
//             // Handle login success
//             else if (route.includes("token")) {
//                 localStorage.setItem(ACCESS_TOKEN, res.data.access);
//                 localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
//                 // Also store the user flag needed by your custom ProtectedRoute
//                 localStorage.setItem('user', JSON.stringify({ fullName: fullName || email })); 
//                 navigate("/LiveTracker"); // Navigate to the main feature
//             }
//         } catch (error) {
//             const errorMessage = error.response?.data?.detail || error.response?.data?.username?.[0] || error.response?.data?.email?.[0] || "Invalid login credentials or check network connection.";
//             alert(`❌ ${errorMessage}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="form-container">
//             <h1>{name}</h1>
//             
//             {method === "register" && (
//                 <>
//                     <input
//                         className="form-input"
//                         type="text"
//                         value={fullName}
//                         onChange={(e) => setFullName(e.target.value)}
//                         placeholder="Enter Full Name"
//                         required
//                     />
//                     <input
//                         className="form-input"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="Enter Email"
//                         required
//                     />
//                     <input
//                         className="form-input"
//                         type="email"
//                         value={reEmail}
//                         onChange={(e) => setReEmail(e.target.value)}
//                         placeholder="Re-Enter Email"
//                         required
//                     />
//                 </>
//             )}

//             {method === "login" && (
//                 <input
//                     className="form-input"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter Email (Username)"
//                     required
//                 />
//             )}

//             <input
//                 className="form-input"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter Password"
//                 required
//             />

//             {method === "register" && (
//                 <input
//                     className="form-input"
//                     type="password"
//                     value={rePassword}
//                     onChange={(e) => setRePassword(e.target.value)}
//                     placeholder="Re-enter Password"
//                     required
//                 />
//             )}

//             <button className="form-button" type="submit" disabled={loading}>
//                 {loading ? "Loading..." : name}
//             </button>
//         </form>
//     );
// }

// export default Form;




import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"; 

function Form({ route, method }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [reEmail, setReEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    // Email validation function
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Password validation function
    const isValidPassword = (password) => {
        const specialCharPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        
        if (!specialCharPattern.test(password)) {
            return false;
        }
        
        const regularChars = password.replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');
        
        if (regularChars.length < 5) {
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (method === "register") {
            if (!fullName.trim()) {
                alert("❌ Please enter your full name!");
                return;
            }

            if (!isValidEmail(email)) {
                alert("❌ Invalid email address! Please enter a valid email (e.g., example@gmail.com)");
                return;
            }

            if (email !== reEmail) {
                alert("❌ Emails do not match! Please re-enter your email.");
                return;
            }

            if (!isValidPassword(password)) {
                alert("❌ Invalid password! Password must have:\n• At least 5 regular characters (letters/numbers)\n• At least 1 special character (!@#$%^&* etc.)");
                return;
            }

            if (password !== rePassword) {
                alert("❌ Passwords do not match! Please re-enter your password.");
                return;
            }
        }

        if (method === "login") {
            if (!isValidEmail(email)) {
                alert("❌ Invalid email address!");
                return;
            }
        }

        setLoading(true);
        
        let payload = {};

        // === REVISED PAYLOAD LOGIC (Final Attempt on Frontend) ===
        if (method === "login") {
            // NOTE: Use 'email' as the key if USERNAME_FIELD='email' is fully respected.
            // If the DRF wrapper still defaults to 'username', this is the issue.
            // We'll prioritize the field name defined in the serializer/token configuration.
            // Since your SimpleJWT serializer is customized to use email as the username,
            // but the default token endpoint uses 'username', we use 'username' as the key.
            // Let's rely on the Django backend (as configured by you) for validation,
            // and assume SimpleJWT requires the field name defined in settings.
            payload = {
                username: email, // Use email as the username value
                password,
            };
        } else { // Register
            payload = {
                email: email, 
                username: email, 
                password,
            };
        }
        // ========================================================

        try {
            const res = await api.post(route, payload);
            
            // Handle registration success
            if (route.includes("register")) {
                alert("✅ Registration successful! Please login.");
                navigate("/login");
            } 
            // Handle login success
            else if (route.includes("token")) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                // Also store the user flag needed by your custom ProtectedRoute
                localStorage.setItem('user', JSON.stringify({ fullName: fullName || email })); 
                navigate("/LiveTracker"); // Navigate to the main feature
            }
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.username?.[0] || error.response?.data?.email?.[0] || "Invalid login credentials or check network connection.";
            alert(`❌ ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            
            {method === "register" && (
                <>
                    <input
                        className="form-input"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter Full Name"
                        required
                    />
                    <input
                        className="form-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email"
                        required
                    />
                    <input
                        className="form-input"
                        type="email"
                        value={reEmail}
                        onChange={(e) => setReEmail(e.target.value)}
                        placeholder="Re-Enter Email"
                        required
                    />
                </>
            )}

            {method === "login" && (
                <input
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Email (Username)"
                    required
                />
            )}

            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
            />

            {method === "register" && (
                <input
                    className="form-input"
                    type="password"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    placeholder="Re-enter Password"
                    required
                />
            )}

            <button className="form-button" type="submit" disabled={loading}>
                {loading ? "Loading..." : name}
            </button>
        </form>
    );
}

export default Form;
