import React, { useState } from "react";
import "./myTrips.css";

const favouriteTrips = [
  { id: 1, from: "Boon lay Int", to: "Jurong East", distance: "9.2 km", duration: "35 mins", mode: "Bus" },
  { id: 2, from: "Bishan Park", to: "313 Somerset", distance: "11.5 km", duration: "25 mins", mode: "Car" },
  { id: 3, from: "Clarke Quay", to: "Tiong Bahru Market", distance: "5.1 km", duration: "28 mins", mode: "Bus" },
  { id: 4, from: "Block 426", to: "Oh My Mango Bingsu", distance: "8.8 km", duration: "30 mins", mode: "Car" },
];

const recentTrips = [
  { id: 1, from: "Jurong East", to: "Orchard Road", distance: "13.5 km", duration: "33 mins", mode: "Bus" },
  { id: 2, from: "NTU North Spine", to: "Changi Airport", distance: "38.5 km", duration: "58 mins", mode: "Car" },
  { id: 3, from: "Clarke Quay Central", to: "Marina Bay Sands", distance: "2.1 km", duration: "19 mins", mode: "Bus" },
  { id: 4, from: "Block 301", to: "Lickers, blk 177", distance: "1.5 km", duration: "6 mins", mode: "Car" },
];

function MyTrips({ navigateTo }) {
  const [activeTab, setActiveTab] = useState("favourites");

  const trips = activeTab === "favourites" ? favouriteTrips : recentTrips;

  return (
    <div className="my-trips-container">
      <header className="header">
        <h1>My Trips 🧾</h1>
      </header>

      <div className="tab-buttons">
        <button
          className={activeTab === "favourites" ? "tab active" : "tab"}
          onClick={() => setActiveTab("favourites")}
        >
          Favourites
        </button>
        <button
          className={activeTab === "recent" ? "tab active" : "tab"}
          onClick={() => setActiveTab("recent")}
        >
          Recent Trips
        </button>
      </div>

      <div className="trips-list">
        {trips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <div className="trip-icon">🚌</div>
            <div className="trip-details">
              <p>{trip.from} → {trip.to}</p>
              <small>{trip.distance} | {trip.duration} | {trip.mode}</small>
            </div>
            <div className="trip-arrow">➔</div>
          </div>
        ))}
      </div>

      <footer className="footer-nav">
        <button className="nav-btn" onClick={() => navigateTo("home")}>🏠 Home</button>
        <button className="nav-btn" onClick={() => navigateTo("liveTracker")}>🗺 Live Tracker</button>
        <button className="nav-btn active">🧾 My Trips</button>
        <button className="nav-btn" onClick={() => navigateTo("settings")}>⚙️ Settings</button>
      </footer>
    </div>
  );
}

export default MyTrips;
