import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
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

export default function Home({ userName = "User" }) {
  const [activeTab, setActiveTab] = useState('recent');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const navigate = useNavigate(); 

  const handleMyTripsClick = () => {
    navigate('/my-trips'); 
  };

  const handleSettingsClick = () => {
    navigate('/settings'); 
  };

  const handleYourLocationClick = () => {
    setShowLocationPrompt(true);
  };

  const handleLocationPermission = (permission) => {
    console.log('Location permission:', permission);
    setShowLocationPrompt(false);
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0095FF&color=fff&size=64`;

  return (
    <div className="home-container">
      {/* Animated Wave Background */}
      <div className="wave-background">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path className="wave1" fill="#a8d5ff" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path className="wave2" fill="#7eb9f5" fillOpacity="0.4" d="M0,64L48,80C96,96,192,128,288,133.3C384,139,480,117,576,122.7C672,128,768,160,864,165.3C960,171,1056,149,1152,133.3C1248,117,1344,107,1392,101.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path className="wave3" fill="#5ba3eb" fillOpacity="0.5" d="M0,32L48,53.3C96,75,192,117,288,133.3C384,149,480,139,576,128C672,117,768,107,864,112C960,117,1056,139,1152,138.7C1248,139,1344,117,1392,106.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div className="content-wrapper">
        <header className="home-header">
          <div className="profile-info">
            <img src={avatarUrl} alt="Profile" className="avatar" />
            <div>
              <h2 className="greeting">Hi, {userName}!</h2>
              <p className="location-text">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Singapore
              </p>
            </div>
          </div>
          <div className="header-icons">
            <button className="icon-button" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <button className="icon-button" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </header>

        <section className="main-text">
          <h1>
            Plan. <span className="highlight">Ride.</span> Arrive.
          </h1>
          <p>Track public transport in real time.</p>
        </section>

        <section className="trip-input">
          <div className="input-wrapper">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"></path>
            </svg>
            <input type="text" placeholder="Your location" />
          </div>
          <div className="input-wrapper">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2v20M2 12h20"></path>
            </svg>
            <input type="text" placeholder="Where are you going?" />
          </div>
          <button className="trip-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
            Plan My Trip
          </button>
        </section>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Recent trips
          </button>
          <button 
            className={`tab-btn ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Default Location
          </button>
          <button 
            className={`tab-btn ${activeTab === 'transport' ? 'active' : ''}`}
            onClick={() => setActiveTab('transport')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Transport Mode
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
                    <p>{trip.from} → {trip.to}</p>
                    <small>{trip.distance} | {trip.duration} | {trip.cost}</small>
                  </div>
                  <svg className="trip-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
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
                <span style={{ fontSize: '28px' }}>🏫</span>
                <span>NTU North Spine</span>
              </div>
              <div className="location-item">
                <span style={{ fontSize: '28px' }}>🏠</span>
                <div>
                  <p>Home</p>
                  <small>Singapore 650188</small>
                </div>
              </div>
              <div 
                className="location-item clickable" 
                onClick={handleYourLocationClick}
              >
                <span style={{ fontSize: '28px' }}>📍</span>
                <span className="your-location">Your location</span>
              </div>
            </div>
          </section>
        )}

        {/* Location Permission Prompt */}
        {showLocationPrompt && (
          <div className="location-prompt-overlay">
            <div className="location-prompt">
              <button className="close-btn" onClick={() => setShowLocationPrompt(false)}>✕</button>
              <div className="prompt-icon">
                <span style={{ fontSize: '64px' }}>📍</span>
              </div>
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
                <span style={{ fontSize: '48px' }}>🚗</span>
                <span>Car</span>
              </div>
              <div className="transport-item">
                <span style={{ fontSize: '48px' }}>🚆</span>
                <span>Train</span>
              </div>
              <div className="transport-item">
                <span style={{ fontSize: '48px' }}>🚌</span>
                <span>Bus</span>
              </div>
            </div>
          </section>
        )}
      </div>

      <footer className="footer-nav">
        <button className="nav-btn active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
          <span>Home</span>
        </button>
        <button className="nav-btn" onClick={handleMyTripsClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span>Trips</span>
        </button>
        <button className="nav-btn" onClick={handleSettingsClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6"></path>
            <path d="M17 12h6M5 12H1"></path>
            <path d="m4.22 4.22 4.24 4.24m7.08 7.08 4.24 4.24"></path>
            <path d="m19.78 4.22-4.24 4.24M9.46 14.54 5.22 18.78"></path>
          </svg>
          <span>Settings</span>
        </button>
      </footer>
    </div>
  );
}

