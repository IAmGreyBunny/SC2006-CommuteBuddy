// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api"; 
// import "./myTrips.css";

// function MyTrips() {
//   const [activeTab, setActiveTab] = useState("carparks");
//   const [favourites, setFavourites] = useState({ carparks: [], bus: [], train: [] });
//   const [allCarparks, setAllCarparks] = useState([]); 
//   const [newFav, setNewFav] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchFavourites();
//     fetchAllCarparks();
//   }, []);

//   const fetchFavourites = async () => {
//     try {
//       const res = await api.get("http://localhost:8000/api/carpark/get_favourite/");
//       setFavourites(prev => ({ ...prev, carparks: res.data || [] }));
//     } catch (err) {
//       console.error("Error fetching favourites:", err);
//       if (err.response?.status === 401) {
//         alert("Please log in to view favourites!");
//       }
//     }
//   };

//   const fetchAllCarparks = async () => {
//     try {
//       const res = await api.get("http://localhost:8000/api/carpark/get_favourite/");
//       setAllCarparks(res.data || []);
//     } catch (err) {
//       console.error("Error fetching carparks:", err);
//     }
//   };

//   const handleAddFavourite = async () => {
//     if (!newFav.trim()) return;

//     // find carpark by name
//     const selected = allCarparks.find(c => c.name.toLowerCase() === newFav.toLowerCase());
//     if (!selected) {
//       alert("Carpark not found!");
//       return;
//     }

//     try {
//       await api.post("/carpark/add_favourite/", { carpark: selected.id });
//       fetchFavourites();
//       setNewFav("");
//       alert(`${selected.name} added to favourites!`);
//     } catch (err) {
//       console.error("Error adding favourite:", err);
//       if (err.response?.status === 401) {
//         alert("You must log in to add favourites!");
//       }
//     }
//   };

//   const handleHomeClick = () => navigate("/home");
//   const handleSettingsClick = () => navigate("/settings");

//   const items = favourites[activeTab] || [];

//   return (
//     <div className="my-trips-container">
//       <header className="header"><h1>⭐ My Favourites</h1></header>

//       <div className="tab-buttons">
//         <button className={activeTab === "carparks" ? "tab active" : "tab"} onClick={() => setActiveTab("carparks")}>🅿️ Carparks</button>
//         <button className={activeTab === "bus" ? "tab active" : "tab"} onClick={() => setActiveTab("bus")}>🚌 Bus</button>
//         <button className={activeTab === "train" ? "tab active" : "tab"} onClick={() => setActiveTab("train")}>🚆 Train</button>
//       </div>

//       <div className="add-section">
//         <input
//           type="text"
//           placeholder={`Add new ${activeTab} favourite...`}
//           value={newFav}
//           onChange={(e) => setNewFav(e.target.value)}
//           list="carpark-options"
//         />
//         <datalist id="carpark-options">
//           {allCarparks.map(c => <option key={c.id} value={c.name} />)}
//         </datalist>
//         <button onClick={handleAddFavourite}>＋ Add</button>
//       </div>

//       <div className="trips-list">
//         {items.length === 0 ? <p className="empty-text">No favourites added yet.</p> :
//           items.map((item, idx) => (
//             <div key={idx} className="trip-card">
//               <div className="trip-icon">{activeTab === "carparks" ? "🅿️" : activeTab === "bus" ? "🚌" : "🚆"}</div>
//               <div className="trip-details"><p>{item.name}</p></div>
//               <div className="trip-arrow">⭐</div>
//             </div>
//           ))
//         }
//       </div>

//       <footer className="footer-nav">
//         <button className="nav-btn" onClick={handleHomeClick}>🏠 Home</button>
//         <button className="nav-btn active">⭐ My Favourites</button>
//         <button className="nav-btn" onClick={handleSettingsClick}>⚙️ Settings</button>
//       </footer>
//     </div>
//   );
// }

// export default MyTrips;



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


  // Fetching all favorites (including Bus/MRT) ---
  const fetchFavourites = async () => {
    if (!localStorage.getItem('access')) return;

    try {
       // 1. Fetch Carpark favourites
      const carparksRes = await api.get("http://localhost:8000/api/carpark/get_favourite/");

      // 2. Fetch Bus/MRT favourites
      const routesRes = await api.get("/api/user/favourites/");

        setFavourites({
        carparks: carparksRes.data || [],
        bus: routesRes.data?.bus_favourites || [],
        train: routesRes.data?.mrt_favourites || [],
      });
    } catch (err) {
      console.error("Error fetching favourites:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Please log in to view favourites!");
      }
    }
  };
  // --- END UPDATED FETCH ---

  // carpark logic for fetchAllCarparks and handleAddFavourite
  const fetchAllCarparks = async () => {
    try {
      const res = await api.get("http://localhost:8000/api/carpark/get_favourite/");
      setAllCarparks(res.data || []);
    } catch (err) {
      console.error("Error fetching carparks:", err);
    }
  };

  const handleAddFavourite = async () => {
    if (activeTab !== 'carparks') {
      alert("Use the tracker pages to add Bus/Train favourites!");
      return;
    }

    // carpark logic
    if (!newFav.trim()) return;

    alert("Carpark add logic is currently managed by the designated feature owner.");
  };

    // Navigation Logic for Bus/Train Favorites ---
  const handleTripClick = (item) => {
    if (activeTab === "bus") {
      // Redirect to LiveTracker, passing the BusStopCode via state
      navigate(`/LiveTracker`, { state: { targetCode: item.route_id, targetType: 'bus' } });
    } else if (activeTab === "train") {
      // Redirect to CrowdDensity, passing the MRTStationCode via state
      navigate(`/CrowdDensity`, { state: { targetCode: item.route_id, targetType: 'mrt' } });
    } else if (activeTab === "carparks") {
      // Add navigation for carpark (e.g. back to map)
      console.log(`Navigating to carpark: ${item.carpark?.name}`);
      navigate(`/NearbyCarparks`);
    }
  };
    // --- END NEW LOGIC ---

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
          items.map((item) => {

            // Logic to display the correct name/code
            const primaryName = item.nickname || item.details?.name || item.carpark?.name || item.route_id;
            const secondaryCode = item.details?.code || item.carpark?.external_id || item.route_id;

            return (
              <div key={item.id} className="trip-card" onClick={() => handleTripClick(item)}>
                <div className="trip-icon">{activeTab === "carparks" ? "🅿️" : activeTab === "bus" ? "🚌" : "🚆"}</div>
                <div className="trip-details">
                  <p>{primaryName}</p>
                  <small style={{color: '#888'}}>
                    {secondaryCode}
                  </small>
                </div>
                <div className="trip-arrow">➡️</div>
              </div>
            );
          })
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