import React, { useEffect, useState } from "react";
import api from "../api"; 
import "./ProfilePopup.css";
import { ACCESS_TOKEN } from "../constants";

const ProfilePopup = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "Guest";
    const storedEmail = localStorage.getItem("email") || "guest@example.com";
    setUsername(storedUsername);
    setEmail(storedEmail);
  }, []);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=667eea&color=fff&size=128`;

  const handleSave = async () => {
    if (!username || !email) {
      alert("Please fill in all fields.");
      return;
    }

    const token = localStorage.getItem(ACCESS_TOKEN); 
    if (!token) {
      alert("You are not logged in.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put(
        "/api/user/profile/",
        { username, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email", res.data.email);

      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("popup-overlay")) {
      onClose();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="profile-container">
          <img src={avatarUrl} className="profile-avatar" alt="Profile" />

          {editing ? (
            <>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="profile-input"
                placeholder="Username"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="profile-input"
                placeholder="Email"
              />
            </>
          ) : (
            <>
              <h2>{username}</h2>
              <p>{email}</p>
            </>
          )}

          <div className="profile-buttons">
            <button
              className="cancel-btn"
              onClick={() => (editing ? setEditing(false) : onClose())}
            >
              {editing ? "Cancel" : "Close"}
            </button>
            <button
              className="edit-btn"
              onClick={editing ? handleSave : () => setEditing(true)}
              disabled={loading}
            >
              {editing ? (loading ? "Saving..." : "Save") : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;
