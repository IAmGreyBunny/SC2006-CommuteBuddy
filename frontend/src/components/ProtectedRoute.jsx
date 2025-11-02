import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);

      // No token → not authorized
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        // Token expired → try refresh
        if (decoded.exp < now) {
          const refreshToken = localStorage.getItem(REFRESH_TOKEN);
          if (!refreshToken) {
            setIsAuthorized(false);
            return;
          }

          const res = await api.post("/api/token/refresh/", { refresh: refreshToken });
          if (res.status === 200) {
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
