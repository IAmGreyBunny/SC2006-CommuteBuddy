import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; 
import "./myTrips.css";

function MyTrips() {
  const [activeTab, setActiveTab] = useState("carparks");
  const [favourites, setFavourites] = useState({ carparks: [], bus: [], train: [] });
  const [allCarparks, setAllCarparks] = useState([]); 
  const [newFav, setNewFav] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavourites();
    fetchAllCarparks();
  }, []);

  const fetchFavourites = async () => {
    try {
      const res = await api.get("http://localhost:8000/api/carpark/get_favourite/");
      setFavourites(prev => ({ ...prev, carparks: res.data || [] }));
    } catch (err) {
      console.error("Error fetching favourites:", err);
      if (err.response?.status === 401) {
        alert("Please log in to view favourites!");
      }
    }
  };

  const fetchAllCarparks = async () => {
    try {
      const res = await api.get("http://localhost:8000/api/carpark/get_favourite/");
      setAllCarparks(res.data || []);
    } catch (err) {
      console.error("Error fetching carparks:", err);
    }
  };

  const handleAddFavourite = async () => {
    if (!newFav.trim()) return;

    // find carpark by name
    const selected = allCarparks.find(c => c.name.toLowerCase() === newFav.toLowerCase());
    if (!selected) {
      alert("Carpark not found!");
      return;
    }

    try {
      await api.post("/carpark/add_favourite/", { carpark: selected.id });
      fetchFavourites();
      setNewFav("");
      alert(`${selected.name} added to favourites!`);
    } catch (err) {
      console.error("Error adding favourite:", err);
      if (err.response?.status === 401) {
        alert("You must log in to add favourites!");
      }
    }
  };

  const handleHomeClick = () => navigate("/home");
  const handleSettingsClick = () => navigate("/settings");

  const items = favourites[activeTab] || [];

  return (
    <div className="my-trips-container">
      <header className="header"><h1>⭐ My Favourites</h1></header>

      <div className="tab-buttons">
        <button className={activeTab === "carparks" ? "tab active" : "tab"} onClick={() => setActiveTab("carparks")}>🅿️ Carparks</button>
        <button className={activeTab === "bus" ? "tab active" : "tab"} onClick={() => setActiveTab("bus")}>🚌 Bus</button>
        <button className={activeTab === "train" ? "tab active" : "tab"} onClick={() => setActiveTab("train")}>🚆 Train</button>
      </div>

      <div className="add-section">
        <input
          type="text"
          placeholder={`Add new ${activeTab} favourite...`}
          value={newFav}
          onChange={(e) => setNewFav(e.target.value)}
          list="carpark-options"
        />
        <datalist id="carpark-options">
          {allCarparks.map(c => <option key={c.id} value={c.name} />)}
        </datalist>
        <button onClick={handleAddFavourite}>＋ Add</button>
      </div>

      <div className="trips-list">
        {items.length === 0 ? <p className="empty-text">No favourites added yet.</p> :
          items.map((item, idx) => (
            <div key={idx} className="trip-card">
              <div className="trip-icon">{activeTab === "carparks" ? "🅿️" : activeTab === "bus" ? "🚌" : "🚆"}</div>
              <div className="trip-details"><p>{item.name}</p></div>
              <div className="trip-arrow">⭐</div>
            </div>
          ))
        }
      </div>

      <footer className="footer-nav">
        <button className="nav-btn" onClick={handleHomeClick}>🏠 Home</button>
        <button className="nav-btn active">⭐ My Favourites</button>
        <button className="nav-btn" onClick={handleSettingsClick}>⚙️ Settings</button>
      </footer>
    </div>
  );
}

export default MyTrips;
