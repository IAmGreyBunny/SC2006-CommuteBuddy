import React from "react";
import "./ProfilePopup.css";

const ProfilePopup = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="profile-container">
          <img
            src="/pic.png" //not gg to attach pic as backend handles that
            className="profile-avatar"
          />
          <h2>James Lee</h2>
          <p>jameslee01@gmail.com</p>
          <div className="profile-buttons">
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
            <button className="edit-btn">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;

