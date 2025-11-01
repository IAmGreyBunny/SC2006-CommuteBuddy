// frontend/src/pages/myTrips.jsx - UPDATED FOR BACKEND INTEGRATION

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getFavorites, removeFavorite } from "../api"; // Import real API calls
import "./myTrips.css";

// Note: Recents tab remains dummy data as there's no backend endpoint for 'recent trips'

function MyTrips() {
    const [activeTab, setActiveTab] = useState("favourites");
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Mock data for Recents (since your backend doesn't have a 'Recents' endpoint)
    const recents = [
        { id: 101, route_id: "99", nickname: "Jurong East to Orchard", route_type: "bus", info: "13.5 km | 33 mins" },
        { id: 102, route_id: "NTU", nickname: "NTU to Changi Airport", route_type: "mrt", info: "38.5 km | 58 mins" },
    ];

    const fetchUserFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const favs = await getFavorites();
            setFavorites(favs);
        } catch (e) {
            setError("Failed to load favourites. Please ensure you are logged in.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'favourites') {
            fetchUserFavorites();
        }
    }, [activeTab, fetchUserFavorites]);

    const handleRemoveFavorite = async (favoriteId, e) => {
        e.stopPropagation(); // Stop click propagating to the card
        try {
            await removeFavorite(favoriteId);
            // Optimistically update the list
            setFavorites(current => current.filter(fav => fav.id !== favoriteId));
        } catch (e) {
            alert(`Failed to remove favorite: ${e.message}`);
        }
    };
    
    const handleTripClick = (routeType, routeId) => {
        if (routeType === 'mrt') {
            navigate(`/crowd-density/${routeId}`);
        } else {
            // Bus stop ID/Route ID might need to be passed to LiveTracker if map centering is desired
            alert(`Navigating to ${routeType.toUpperCase()} stop/route ${routeId} on the map.`);
            navigate('/LiveTracker'); 
        }
    }


    const tripsToDisplay = activeTab === "favourites" ? favorites : recents;
    const isFavoritesTab = activeTab === "favourites";

    return (
        <>
            <div className="my-trips-container">
                <header className="header">
                    <h1>My Trips 🧾</h1>
                </header>

                <div className="tab-buttons">
                    <button
                        className={isFavoritesTab ? "tab active" : "tab"}
                        onClick={() => setActiveTab("favourites")}
                    >
                        Favourites
                    </button>
                    <button
                        className={!isFavoritesTab ? "tab active" : "tab"}
                        onClick={() => setActiveTab("recent")}
                    >
                        Recents (Mock)
                    </button>
                </div>
                
                {isFavoritesTab && loading && <div className="loading" style={{ padding: '20px', textAlign: 'center' }}>Loading favourites...</div>}
                {isFavoritesTab && error && <div className="error-state" style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>}

                <div className="trips-list">
                    {tripsToDisplay.length === 0 && !loading ? (
                        <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            {isFavoritesTab ? "You haven't saved any favourite routes yet." : "No recent trips available."}
                        </p>
                    ) : (
                        tripsToDisplay.map((trip) => (
                            <div 
                                key={trip.id} 
                                className="trip-card"
                                onClick={() => handleTripClick(trip.route_type || trip.mode.toLowerCase(), trip.route_id || trip.id)}
                            >
                                <div className="trip-icon">{trip.route_type === 'mrt' || trip.mode === 'Train' ? '🚆' : '🚌'}</div>
                                <div className="trip-details">
                                    <p>
                                        {trip.nickname || `${trip.route_type?.toUpperCase() || trip.mode} Route ${trip.route_id || trip.id}`}
                                    </p>
                                    <small>
                                        {trip.route_type?.toUpperCase() || trip.mode} ID: {trip.route_id || trip.id} 
                                        {trip.info && ` | ${trip.info}`}
                                    </small>
                                </div>
                                {isFavoritesTab && (
                                    <button 
                                        onClick={(e) => handleRemoveFavorite(trip.id, e)} 
                                        style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#ef4444' }}
                                    >
                                        🗑️
                                    </button>
                                )}
                                {!isFavoritesTab && <div className="trip-arrow">➔</div>}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <footer className="footer-nav">
                <button className="nav-btn" onClick={() => navigate("/home")}>🏠 Home</button>
                <button className="nav-btn active">🧾 My Trips</button>
                <button className="nav-btn" onClick={() => navigate("/settings")}>⚙️ Settings</button>
            </footer>
        </>
    );
}

export default MyTrips;