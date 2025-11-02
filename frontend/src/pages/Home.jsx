import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "./Home.css";

// REMOVED: const recentTrips = [...] - This should now be fetched dynamically

export default function Home({ userName = "James Lee" }) {
  const [activeTab, setActiveTab] = useState('recent');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const navigate = useNavigate(); 

  // updated routing
  const handleMyTripsClick = () => {
    navigate('/my-trips'); 
  };

  const handleSettingsClick = () => {
    navigate('/settings'); 
  };

  const handleLiveTrackerClick = () => { // New function to navigate to live tracker
    navigate('/LiveTracker');
  };

  const handleCrowdDensityClick = () => { // New function to navigate to crowd density
    navigate('/CrowdDensity');
  };

  const handleCarparksClick = () => { // New function to navigate to carparks
    navigate('/NearbyCarparks');
  };

  const handleYourLocationClick = () => {
    setShowLocationPrompt(true);
  };

  const handleLocationPermission = (permission) => {
    console.log('Location permission:', permission);
    setShowLocationPrompt(false);
    // In a real app, this would trigger device geolocation API access
  };

  // const getInitials = (name) =>
  //   name.split(' ').map(word => word[0]).join('').toUpperCase(); // Not used but kept for context

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
          className={`tab-btn ${activeTab === 'transport_mode' ? 'active' : ''}`}
          onClick={() => setActiveTab('transport_mode')}
        >
          Live Transport Maps
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recent Trips
        </button>
        <button 
          className={`tab-btn ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          My Locations
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'recent' && (
        <section className="recent-trips">
          <h3>Recent Trips</h3>
          <p style={{ color: '#666', padding: '10px 0', textAlign: 'center'}}>
            Your recent trips will appear here after you complete a journey.
          </p>
        </section>
      )}
      
      {activeTab === 'transport_mode' && (
        <section className="transport-settings">
          <h3>Live Transport Tracking</h3>
          <div className="transport-list">
            <div className="transport-item clickable" onClick={handleCarparksClick}>
              <span className="transport-icon">🚗</span>
              <span>**Carpark** Availability</span>
            </div>
            <div className="transport-item clickable" onClick={handleLiveTrackerClick}>
              <span className="transport-icon">🚌</span>
              <span>**Bus** Live Tracker</span>
            </div>
            <div className="transport-item clickable" onClick={handleCrowdDensityClick}>
              <span className="transport-icon">🚆</span>
              <span>**MRT** Crowd Density</span>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'location' && (
        <section className="location-settings">
          <h3>Saved Locations</h3>
          <div className="location-list">
            {/* Example saved location */}
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
                Use Current Location
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

      {/* Footer Navigation */}
      <footer className="footer-nav">
        <button className="nav-btn active">🏠 Home</button>
        <button className="nav-btn" onClick={handleMyTripsClick}>🧾 My Trips</button>
        <button className="nav-btn" onClick={handleSettingsClick}>⚙️ Settings</button>
      </footer>
    </div>
  );
}