import React, { useState } from "react";
import "./Home.css";

const recentTrips = [
  {
    id: 1,
    from: "NTU",
    to: "Pioneer MRT station",
    distance: "4.3 km",
    duration: "12 mins",
    cost: "$__",
    icon: "🚕"
  },
  {
    id: 2,
    from: "Jurong Point",
    to: "Orchard MRT",
    distance: "21.4 km",
    duration: "31 mins",
    cost: "$__",
    icon: "🚌"
  },
  {
    id: 3,
    from: "Changi Airport",
    to: "NTU",
    distance: "46.0 km",
    duration: "40 mins",
    cost: "$__",
    icon: "🚕"
  },
];

export default function Home({ userName = "James Lee", navigateTo }) {
  const [activeTab, setActiveTab] = useState('recent'); // 'recent', 'location', or 'transport'
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const handleLiveTrackerClick = () => {  //function for nagiv to Live Tracker screen
    navigateTo('LiveTracker');
  };

  const handleMyTripsClick = () => {  //function for nagiv to myTrips screen
    navigateTo('myTrips');
  };

  const handleSettingsClick = () => {  //function for nagiv to Settings screen
    navigateTo('Settings');
  };

  const handleYourLocationClick = () => {
    setShowLocationPrompt(true);
  };

  const handleLocationPermission = (permission) => {
    if (permission === 'allow-visiting') {
      console.log('Location permission: Allow while visiting');
    } else if (permission === 'allow-once') {
      console.log('Location permission: Allow this time');
    } else if (permission === 'never') {
      console.log('Location permission: Never allow');
    }
    setShowLocationPrompt(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const initials = getInitials(userName);
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=667eea&color=fff&size=48`;

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="profile-info">
          <img src={avatarUrl} alt="Profile" className="avatar" />
          <div>
            <h2 className="greeting">Hi, {userName}!</h2>
            <p className="location-text">📍 Singapore</p>
          </div>
        </div>
        <div className="header-icons">
          <button className="icon-button">🔔</button>
          <button className="icon-button">🔍</button>
        </div>
      </header>

      <section className="main-text">
        <h1>
          Plan. <span className="highlight">Ride.</span> Arrive.
        </h1>
        <p>Track public transport in real time.</p>
      </section>

      <section className="trip-input">
        <input type="text" placeholder="Your location" />
        <input type="text" placeholder="Where are you going?" />
        <button className="trip-button">Plan My Trip</button>
      </section>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recent trips
        </button>
        <button 
          className={`tab-btn ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          Setting Default Location
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transport' ? 'active' : ''}`}
          onClick={() => setActiveTab('transport')}
        >
          Preferred mode of transport
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'recent' && (
        <section className="recent-trips">
          <h3>Recent Trips</h3>
          <div className="trip-cards">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <div className="trip-icon">{trip.icon}</div>
                <div className="trip-details">
                  <p>
                    {trip.from} → {trip.to}
                  </p>
                  <small>
                    {trip.distance} | {trip.duration} | {trip.cost}
                  </small>
                </div>
                <div className="trip-arrow">➔</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'location' && (
        <section className="location-settings">
          <h3>Setting default location:</h3>
          <div className="location-list">
            <div className="location-item">
              <span className="location-icon">📍</span>
              <span>NTU North Spine</span>
            </div>
            <div className="location-item">
              <span className="location-icon">📍</span>
              <div>
                <p>Home</p>
                <small>Singapore 650188</small>
              </div>
            </div>
            <div 
              className="location-item clickable" 
              onClick={handleYourLocationClick}
            >
              <span className="location-icon">📍</span>
              <span className="your-location">
                Your location
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Location Permission Prompt */}
      {showLocationPrompt && (
        <div className="location-prompt-overlay">
          <div className="location-prompt">
            <button className="close-btn" onClick={() => setShowLocationPrompt(false)}>✕</button>
            <div className="prompt-icon">📍</div>
            <h3>CommuteBuddy wants to</h3>
            <p>Know your location</p>
            <div className="prompt-buttons">
              <button 
                className="prompt-btn primary"
                onClick={() => handleLocationPermission('allow-visiting')}
              >
                Allow while visiting the site
              </button>
              <button 
                className="prompt-btn primary"
                onClick={() => handleLocationPermission('allow-once')}
              >
                Allow this time
              </button>
              <button 
                className="prompt-btn secondary"
                onClick={() => handleLocationPermission('never')}
              >
                Never allow
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transport' && (
        <section className="transport-settings">
          <h3>Preferred mode of transport:</h3>
          <div className="transport-list">
            <div className="transport-item">
              <span className="transport-icon">🚗</span>
              <span>Car</span>
            </div>
            <div className="transport-item">
              <span className="transport-icon">🚆</span>
              <span>Train</span>
            </div>
            <div className="transport-item">
              <span className="transport-icon">🚌</span>
              <span>Bus</span>
            </div>
            <div className="transport-item">
              <span className="transport-icon">🚶</span>
              <span>Walk</span>
            </div>
          </div>
        </section>
      )}

      <footer className="footer-nav">
        <button className="nav-btn active">🏠 Home</button>
        <button className="nav-btn" onClick={handleLiveTrackerClick}>🗺 Live Tracker</button>
        <button className="nav-btn" onClick={handleMyTripsClick} >🧾 My Trips</button>
        <button className="nav-btn" onClick={handleSettingsClick} >⚙️ Settings</button>
      </footer>
    </div>
  );
}

