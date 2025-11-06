// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaTrainSubway } from "react-icons/fa6";
// import { BsBusFrontFill } from "react-icons/bs";
// import { FaCar } from "react-icons/fa";
// import { FaHome } from "react-icons/fa";
// import "./Home.css";

// export default function Home() {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("Guest"); 

//   useEffect(() => {
//     const stored = localStorage.getItem("username");
//     if (stored) setUsername(stored);
//   }, []);

//   const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
//     username
//   )}&background=667eea&color=fff&size=48`;

//   const handleTransportClick = (mode) => {
//     if (mode === "Car") navigate("/NearbyCarparks");
//     else if (mode === "Train") navigate("/CrowdDensity");
//     else if (mode === "Bus") navigate("/LiveTracker");
//   };

//   const handleMyTripsClick = () => navigate("/my-trips");
//   const handleSettingsClick = () => navigate("/settings");

//   return (
//     <div className="home-container">
//       <header className="home-header">
//         <div className="profile-info">
//           <img src={avatarUrl} alt="Profile" className="avatar" />
//           <div>
//             <h2 className="greeting">Hi, {username}!</h2>
//           </div>
//         </div>
//       </header>

//       <section className="main-text">
//         <h1>
//           Plan. <span className="highlight">Ride.</span> Arrive.
//         </h1>
//         <p>Choose your preferred mode of transport below.</p>
//       </section>

//       <section className="transport-settings">
//         <h3>Preferred Mode of Transport</h3>
//         <div className="transport-list">
//           <div className="transport-item" onClick={() => handleTransportClick("Car")}>
//             <span className="transport-icon"><FaCar /></span>
//             <span className="transport-label">Car</span>
//           </div>
//           <div className="transport-item" onClick={() => handleTransportClick("Train")}>
//             <span className="transport-icon"><FaTrainSubway /></span>
//             <span className="transport-label">Train</span>
//           </div>
//           <div className="transport-item" onClick={() => handleTransportClick("Bus")}>
//             <span className="transport-icon"><BsBusFrontFill /></span>
//             <span className="transport-label">Bus</span>
//           </div>
//         </div>
//       </section>

//       <footer className="footer-nav">
//         <button className="nav-btn active"><FaHome />Home</button>
//         <button className="nav-btn" onClick={handleMyTripsClick}>⭐ My Favourites</button>
//         <button className="nav-btn" onClick={handleSettingsClick}>⚙️ Settings</button>
//       </footer>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrainSubway } from "react-icons/fa6";
import { BsBusFrontFill } from "react-icons/bs";
import { FaCar } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Guest"); 

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) setUsername(stored);
  }, []);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=667eea&color=fff&size=48`;

  const handleTransportClick = (mode) => {
    if (mode === "Car") navigate("/NearbyCarparks");
    else if (mode === "Train") navigate("/CrowdDensity");
    else if (mode === "Bus") navigate("/LiveTracker");
  };

  const handleMyTripsClick = () => navigate("/my-trips");
  const handleSettingsClick = () => navigate("/settings");

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="profile-info">
          <img src={avatarUrl} alt="Profile" className="avatar" />
          <div>
            <h2 className="greeting">Hi, {username}!</h2>
          </div>
        </div>
      </header>

      <section className="main-text">
        <h1>
          Plan. <span className="highlight">Ride.</span> Arrive.
        </h1>
        <p>Choose your preferred mode of transport below.</p>
      </section>

      <section className="transport-settings">
        <h3>Preferred Mode of Transport</h3>
        <div className="transport-list">
          <div className="transport-item" onClick={() => handleTransportClick("Car")}>
            <span className="transport-icon"><FaCar /></span>
            <span className="transport-label">Car</span>
          </div>
          <div className="transport-item" onClick={() => handleTransportClick("Train")}>
            <span className="transport-icon"><FaTrainSubway /></span>
            <span className="transport-label">Train</span>
          </div>
          <div className="transport-item" onClick={() => handleTransportClick("Bus")}>
            <span className="transport-icon"><BsBusFrontFill /></span>
            <span className="transport-label">Bus</span>
          </div>
        </div>
      </section>

      <footer className="footer-nav">
        <button className="nav-btn active"><FaHome /> Home</button>
        <button className="nav-btn" onClick={handleMyTripsClick}>⭐ My Favourites</button>
        <button className="nav-btn" onClick={handleSettingsClick}>⚙️ Settings</button>
      </footer>
    </div>
  );
}


