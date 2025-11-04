import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import ProfilePopup from "./ProfilePopup";

const Settings = () => {
  const [tripReminders, setTripReminders] = useState(false);
  const [liveArrivalAlerts, setLiveArrivalAlerts] = useState(false);
  const [serviceDisruptions, setServiceDisruptions] = useState(false);
  const [peakHourAlerts, setPeakHourAlerts] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Correct state

  const navigate = useNavigate();

  const handleHomeClick = () => navigate('/home');
  const handleMyTripsClick = () => navigate('/my-trips');
  const handleEditProfileClick = () => setShowProfilePopup(true);
  const closeProfilePopup = () => setShowProfilePopup(false);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
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
        <div className="settings-item" onClick={handleEditProfileClick}>
          <span>👤 Edit Profile</span>
          <span className="arrow">›</span>
        </div>
        <div className="settings-item">
          <span>🔒 Change Password</span>
          <span className="arrow">›</span>
        </div>
      </section>

      {/* Account Actions */}
      <section className="settings-section">
        <h3>Account Actions</h3>
        <div className="settings-item" onClick={handleLogoutClick}>
          <span>➡️ Logout</span>
          <span className="arrow">›</span>
        </div>
        <div className="settings-item">
          <span>❌ Delete Account</span>
          <span className="arrow">›</span>
        </div>
      </section>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={cancelLogout}>Cancel</button>
              <button className="modal-btn confirm" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer-nav">
        <button className="nav-btn" onClick={handleHomeClick}>🏠 Home</button>
        <button className="nav-btn" onClick={handleMyTripsClick}>🧾 My Trips</button>
        <button className="nav-btn active">⚙️ Settings</button>
      </footer>

      {showProfilePopup && <ProfilePopup onClose={closeProfilePopup} />}
    </div>
  );
};

export default Settings;
