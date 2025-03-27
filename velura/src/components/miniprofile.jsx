import React, { useState, useEffect } from "react";
import "../css/miniprofile.css";

const MiniProfile = ({ onClose }) => {
  const [profileDetails, setProfileDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const id = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");
  const currentTime = "2025-03-18 11:26:35";
  const currentUser = "laserXnext";

  useEffect(() => {
    fetchProfileDetails();
  }, [id]);

  const fetchProfileDetails = async () => {
    if (!id || !token) {
      console.error("Id or token is missing from local storage");
      setError("Authentication required");
      setLoading(false);
      return;
    }
    
    try {
      // Add the Authorization header with the Bearer token
      const response = await fetch(`http://localhost:8082/api/user/profile/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setProfileDetails(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile details, using temp data:", error);
      setProfileDetails({
        firstname: "Johnny",
        lastname: "Sins",
        username: currentUser,
        last_login: currentTime
      });
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token"); 
    localStorage.removeItem("user_id");
    setProfileDetails(null);
    window.location.href = "/";
  };

  const handleRedirect = () => {
    window.location.href = "/profile";
  }

  if (loading) {
    return (
      <div className="loading-mini-profile">
        <div className="loading-wave">
          <div className="loading-bar"></div>
          <div className="loading-bar"></div>
          <div className="loading-bar"></div>
          <div className="loading-bar"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mini-profile error-state">
        <div className="mini-profile-header">
          <h1>Profile Error</h1>
          <i className="fi fi-rr-cross" onClick={onClose} style={{ cursor: "pointer" }} />
        </div>
        <div className="error-message">
          <i className="fi fi-rr-exclamation"></i>
          <p>{error}</p>
          <button className="login-btn" onClick={() => window.location.href = "/login"}>
            Login Again
          </button>
        </div>
        <div className="session-info">
          <p>Session expired at {currentTime}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mini-profile">
      <div className="mini-profile-header">
        <h1>Profile</h1>
        <i className="fi fi-rr-cross" onClick={onClose} style={{ cursor: "pointer" }} />
      </div>
      <div className="mini-profile-details">
        <i className="fi fi-rr-circle-user" id="mini-profile" />
        <div className="mini-profile-names">
          <h2>{profileDetails.name || `${profileDetails.firstname || ''} ${profileDetails.lastname || ''}`}</h2>
          <p>{profileDetails.username || currentUser}</p>
        </div>
      </div>
      <div className="mini-profile-buttons">
        <button className="extend" onClick={handleRedirect}>Extend <i className="fi fi-rr-arrow-up-right-from-square" /></button>
        <button className="logout" onClick={handleLogout}>Logout <i className="fi fi-rr-exit-alt"></i></button>
      </div>
    </div>
  );
};

export default MiniProfile;