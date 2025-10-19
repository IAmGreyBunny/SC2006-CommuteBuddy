// This component is meant to be a wrapper for pages that require authentication
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react"; 

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    // Checks if authorisation status
    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    // Function to refresh token
    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken
            });

            // Refresh successful, set access token to new access token, set isAuthorized to True
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    // This function checks if the user is logged in by checking if they have ACCESS_TOKEN
    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        
        // No token provided, No authentication
        if (!token) {
            setIsAuthorized(false);
            return;
        }

        // Check if it's a dummy token (for development/testing)
        if (token === 'dummy-token-for-now' || token.startsWith('dummy')) {
            // For development: just check if token exists
            setIsAuthorized(true);
            return;
        }

        // For production: decode and validate JWT token
        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;

            if (tokenExpiration < now) {
                // Token expired, try to refresh
                await refreshToken();
            } else {
                // Token still valid
                setIsAuthorized(true);
            }
        } catch (error) {
            // If token decode fails, treat as unauthorized
            console.error("Token decode error:", error);
            setIsAuthorized(false);
        }
    };

    // isAuthorized not properly set yet
    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    // if authorized return children component(i.e. page), otherwise redirect to login page
    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;

