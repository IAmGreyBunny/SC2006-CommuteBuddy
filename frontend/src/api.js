// frontend/src/api.js - REFINED IMPLEMENTATION

import axios from "axios"
import { ACCESS_TOKEN } from "./constants"

// Creates an axios object with base url, so we don't have to call the whole url all the time
const api = axios.create({
    // IMPORTANT: Make sure this points to your Django server API root (e.g., http://localhost:8000/api/)
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/" 
})

// Add an interceptor to automatically add the access token to requests
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

// --- Custom API wrappers for Commute Buddy features ---

// Helper to handle API response structure
const handleResponse = (response) => {
    // Assuming Django backend wraps success responses in 'success' and actual data
    if (response.data.success) {
        return response.data;
    }
    throw new Error(response.data.error || 'API call failed without explicit error message.');
};

// --- LOCATION & LIVE TRACKER ---

/**
 * Fetches nearby bus stops and MRT stations based on user location.
 * Combines two backend calls: nearby-bus-stops/ and nearby-mrt-stations/.
 */
export const getNearbyLocations = async (latitude, longitude, radius = 500) => {
    const params = `?lat=${latitude}&lng=${longitude}&radius=${radius}`;
    
    const [busStopsRes, mrtStationsRes] = await Promise.all([
        api.get(`nearby-bus-stops/${params}`),
        api.get(`nearby-mrt-stations/${params}`)
    ]);

    const busStopsData = handleResponse(busStopsRes);
    const mrtStationsData = handleResponse(mrtStationsRes);

    return {
        // Your bus stops endpoint returns an array keyed 'stops'
        busStops: busStopsData.stops || [],
        // Your MRT stations endpoint returns an array keyed 'results'
        mrtStations: mrtStationsData.results || [], 
    };
};

/**
 * Gets real-time bus arrivals for a specific bus stop.
 */
export const getBusArrivals = async (busStopCode) => {
    // Using the processed endpoint to get user-friendly arrival times
    const response = await api.get(`bus-arrival-processed/${busStopCode}/`);
    const data = handleResponse(response);
    // Your processing service returns a list keyed 'services'
    return data.services || []; 
};

// --- MRT CROWD ---

/**
 * Gets real-time MRT crowd density for a specific train line.
 * Your backend expects line code (e.g., 'NSL', 'EWL').
 */
export const getMrtCrowdRealTime = async (trainLineCode) => {
    const response = await api.get(`mrt-crowd/${trainLineCode}/`);
    const data = handleResponse(response);
    // The actual crowd data is deeply nested in the LTA API structure
    return data.data.value || []; 
};

// --- FAVORITES ---

/**
 * Fetches the user's saved favorite routes.
 */
export const getFavorites = async () => {
    // Uses the API ViewSet route
    const response = await api.get('user/favourites/'); 
    const data = handleResponse(response);
    // Your backend returns an array under 'results' for list view
    return data.results || [];
};

/**
 * Adds a new favorite route.
 */
export const addFavorite = async (routeType, routeId, nickname = null) => {
    const response = await api.post('user/favourites/add/', {
        route_type: routeType, // 'bus' or 'mrt'
        route_id: routeId,
        nickname: nickname
    });
    // This endpoint should return the new favorite object or success message
    return handleResponse(response); 
};

/**
 * Removes a favorite route by its ID.
 */
export const removeFavorite = async (favoriteId) => {
    // Your backend uses the favorite_id in the path
    const response = await api.delete(`user/favourites/remove/${favoriteId}/`);
    return handleResponse(response); 
};


export default api; // Keep the default export for login/register