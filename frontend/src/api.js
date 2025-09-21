// This file handles how api work
import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

// Creates an axios object with base url, so we don't have to call the whole url all the time
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

// Create an interceptor which allows modification of api request before it is being sent
// Adds an interceptor to automatically add the access token of the user to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(token)
        {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api