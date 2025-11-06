import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import "./Settings.css";
import ProfilePopup from "./ProfilePopup";
import ChangePasswordPopup from "./ChangePasswordPopup";

const Settings = () => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [username, setUsername] = useState("Guest");

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) setUsername(stored);
  }, []);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=667eea&color=fff&size=48`;

  const handleHomeClick = () => navigate('/home');
  const handleMyTripsClick = () => navigate('/my-trips');
  const handleEditProfileClick = () => setShowProfilePopup(true);
  const closeProfilePopup = () => setShowProfilePopup(false);

  // Logout handlers
  const handleLogoutClick = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Delete account handlers
  const handleDeleteClick = () => setShowDeleteModal(true);
  const cancelDelete = () => setShowDeleteModal(false);
  const confirmDelete = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      alert("You are not logged in.");
      return;
    }

    try {
      await api.delete("/api/user/delete-account/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Account deleted successfully!");
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Delete account error:", error);
      alert(
        error.response?.data?.message || "Failed to delete account. Please try again."
      );
    }
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
        <div className="settings-item" onClick={() => setShowPasswordPopup(true)}>
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
        <div className="settings-item" onClick={handleDeleteClick}>
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Confirm Delete Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={cancelDelete}>Cancel</button>
              <button className="modal-btn confirm" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer-nav">
        <button className="nav-btn" onClick={handleHomeClick}>🏠 Home</button>
        <button className="nav-btn" onClick={handleMyTripsClick}>⭐ My Favourites</button>
        <button className="nav-btn active">⚙️ Settings</button>
      </footer>

      {showProfilePopup && (
        <ProfilePopup 
          onClose={closeProfilePopup} 
          username={username} 
          avatarUrl={avatarUrl} 
        />
      )}

      {showPasswordPopup && (
        <ChangePasswordPopup onClose={() => setShowPasswordPopup(false)} />
      )}
    </div>
  );
};

export default Settings;
