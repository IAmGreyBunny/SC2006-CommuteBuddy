import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// Use environment variable from Vite's import.meta.env
// Fallback to localhost:8000 if not defined (matching your backend URLs)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to automatically add the access token of the user to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;