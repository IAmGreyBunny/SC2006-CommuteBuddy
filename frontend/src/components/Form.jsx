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
                alert("❌ Invalid password! Password must have:\n• At least 5 regular characters (letters/numbers)\n• At least 1 special character (!@#$%^&* etc.)\n\nExample: 'hello@' is valid ✓\nExample: 'hello' is invalid ✗");
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

        try {
            const res = await api.post(route, { 
                username: email, 
                password,
                ...(method === "register" && { full_name: fullName })
            });

            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                alert("✅ Registration successful! Please login.");
                navigate("/login");
            }
        } catch (error) {
            alert(`❌ ${error.response?.data?.detail || "An error occurred. Please try again."}`);
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
                    placeholder="Enter Email"
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