import React, { useEffect, useState } from "react";
import "./ProfilePopup.css";

const ProfilePopup = ({ onClose }) => {
  const [username, setUsername] = useState("Guest");
  const [email, setEmail] = useState("guest@example.com");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email"); 
    if (storedUsername) setUsername(storedUsername);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=667eea&color=fff&size=48`;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <div className="profile-container">
          <img src={avatarUrl} className="profile-avatar" alt="Profile" />

          <h2>{username}</h2>
          <p>{email}</p>

          <div className="profile-buttons">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="edit-btn">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;

