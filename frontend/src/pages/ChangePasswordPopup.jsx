import React, { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import "./ProfilePopup.css";

const ChangePasswordPopup = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
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
        "/api/user/change-password/", 
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Password changed successfully!");
      onClose();
    } catch (error) {
      console.error("Change password error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to change password. Please try again."
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
          <h2>Change Password</h2>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="profile-input"
            placeholder="Current Password"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="profile-input"
            placeholder="New Password"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="profile-input"
            placeholder="Confirm New Password"
          />

          <div className="profile-buttons">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="edit-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPopup;
