import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./myTrips.css";

// The hardcoded data for trips is removed.

// Placeholder for trip icon based on route type (can be improved)
const getRouteIcon = (routeType) => {
  switch (routeType) {
    case "bus": return "🚌";
    case "mrt": return "🚆";
    default: return "📍";
  }
};

function MyTrips() {
  const [activeTab, setActiveTab] = useState("favourites");
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]); // This would typically come from a /recent-trips API
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // API: Fetch user's favorite routes
  const fetchFavorites = useCallback(async () => {
    try {
      const res = await api.get("/api/user/favourites/");
      setFavorites(res.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  }, []);

  // Placeholder for recent trips logic (since you don't have a specific endpoint, keeping it dummy)
  const fetchRecents = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRecents([
        { id: 1, route_id: "bus_179", route_type: "bus", nickname: "NTU to Boon Lay", created_at: "2025-10-25T10:00:00Z" },
        { id: 2, route_id: "mrt_DTL", route_type: "mrt", nickname: "Jln Besar to Bugis", created_at: "2025-10-24T15:30:00Z" },
      ]);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (activeTab === "favourites") {
      fetchFavorites();
    } else {
      fetchRecents();
    }
  }, [activeTab, fetchFavorites]);

  const handleHomeClick = () => navigate("/home");
  const handleSettingsClick = () => navigate("/settings");
  
  // Function to remove a favorite
  const handleRemoveFavorite = async (e, favoriteId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this favorite?")) return;

    try {
      await api.delete(`/api/user/favourites/remove/${favoriteId}/`);
      alert("Favorite removed successfully!");
      fetchFavorites(); // Refresh the list
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite. Please try again.");
    }
  };

  const displayList = activeTab === "favourites" ? favorites : recents;

  return (
    <>
      <div className="my-trips-container">
        <header className="header">
          <h1>My Trips 🧾</h1>
        </header>

        <div className="tab-buttons">
          <button
            className={activeTab === "favourites" ? "tab active" : "tab"}
            onClick={() => setActiveTab("favourites")}
          >
            **Favourites**
          </button>
          <button
            className={activeTab === "recent" ? "tab active" : "tab"}
            onClick={() => setActiveTab("recent")}
          >
            Recents
          </button>
        </div>

        <div className="trips-list">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading...</p>
          ) : displayList.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No {activeTab} yet. Go to Live Tracker to add a favourite!
            </p>
          ) : (
            displayList.map((trip) => (
              <div key={trip.id} className="trip-card">
                <div className="trip-icon">{getRouteIcon(trip.route_type)}</div>
                <div className="trip-details">
                  <p>
                    {trip.nickname || `${trip.route_type.toUpperCase()} ${trip.route_id}`}
                  </p>
                  <small>
                    {trip.route_type.toUpperCase()} Route | ID: {trip.route_id}
                  </small>
                </div>
                {activeTab === "favourites" && (
                  <button 
                    onClick={(e) => handleRemoveFavorite(e, trip.id)} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#ef4444', 
                      cursor: 'pointer', 
                      fontSize: '1.5rem' 
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <footer className="footer-nav">
        <button className="nav-btn" onClick={handleHomeClick}>
          🏠 Home
        </button>
        <button className="nav-btn active">🧾 My Trips</button>
        <button className="nav-btn" onClick={handleSettingsClick}>
          ⚙️ Settings
        </button>
      </footer>
    </>
  );
}

export default MyTrips;