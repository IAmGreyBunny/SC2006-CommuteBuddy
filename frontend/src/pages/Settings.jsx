import React, { useState } from "react";
import "./Settings.css";

const Settings = ( {navigateTo} ) => {
  const [tripReminders, setTripReminders] = useState(false);
  const [liveArrivalAlerts, setLiveArrivalAlerts] = useState(false);
  const [serviceDisruptions, setServiceDisruptions] = useState(false);
  const [peakHourAlerts, setPeakHourAlerts] = useState(false);

  const handleHomeClick = () => {  //function for nagiv to Home screen
    navigateTo('Home');
  };

  const handleLiveTrackerClick = () => {  //function for nagiv to Live Tracker screen
    navigateTo('LiveTracker');
  };

  const handleMyTripsClick = () => {  //function for nagiv to myTrips screen
    navigateTo('myTrips');
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h2>Settings</h2>
        <button className="search-btn">🔍</button>
      </header>

      {/* Account Settings */}
      <section className="settings-section">
        <h3>Account Settings</h3>
        <div className="settings-item">
          <span>👤 Edit Profile</span>
          <span className="arrow">›</span>
        </div>
        <div className="settings-item">
          <span>🔒 Change Password</span>
          <span className="arrow">›</span>
        </div>
      </section>

      {/* Notifications */}
      <section className="settings-section">
        <h3>Notifications</h3>
        <div className="settings-item">
          <span>🔔 Trip Reminders</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={tripReminders}
              onChange={() => setTripReminders(!tripReminders)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="settings-item">
          <span>💡 Live Arrival Alerts</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={liveArrivalAlerts}
              onChange={() => setLiveArrivalAlerts(!liveArrivalAlerts)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="settings-item">
          <span>ℹ️ Service Disruptions or Delays</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={serviceDisruptions}
              onChange={() => setServiceDisruptions(!serviceDisruptions)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="settings-item">
          <span>💡 Peak Hour Alerts</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={peakHourAlerts}
              onChange={() => setPeakHourAlerts(!peakHourAlerts)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </section>

      {/* Account Actions */}
      <section className="settings-section">
        <h3>Account Actions</h3>
        <div className="settings-item">
          <span>➡️ Logout</span>
          <span className="arrow">›</span>
        </div>
        <div className="settings-item">
          <span>❌ Delete Account</span>
          <span className="arrow">›</span>
        </div>
      </section>
      <footer className="footer-nav">
        <button className="nav-btn" onClick={handleHomeClick}>🏠 Home</button>
        <button className="nav-btn" onClick={handleLiveTrackerClick}>🗺 Live Tracker</button>
        <button className="nav-btn" onClick={handleMyTripsClick}>🧾 My Trips</button>
        <button className="nav-btn active">⚙️ Settings</button>
      </footer>
    </div>
  );
};

export default Settings;
