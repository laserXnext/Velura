import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileHeader = ({ user, onProfileUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Get user ID from localStorage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      console.log('Retrieved userId from localStorage:', storedUserId);
    } else {
      console.warn('No userId found in localStorage');
      // Fallback to user prop if available
      const id = user?.userId || user?.id;
      if (id) {
        setUserId(id);
        console.log('Using userId from props:', id);
      }
    }
  }, [user]);
  
  const handleRedirect = () => {
    window.location.href = "/";
  };
  
  const handleImageClick = () => {
    document.getElementById('profile-image-input').click();
  };
  
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if we have a valid user ID
    if (!userId) {
      alert('Unable to update profile image: User ID not found in localStorage');
      return;
    }
    
    setUploading(true);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found in localStorage');
      }
      
      // First, upload the file to get a proper file path
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Extract the file path from the upload response
      const imagePath = uploadResponse.data.filePath;
      
      if (!imagePath) {
        throw new Error('No file path returned from upload');
      }
      
      console.log(`File uploaded successfully. Path: ${imagePath}`);
      
      // Now update the user profile with the real file path
      const response = await axios.post(`/api/user/profile-image/${userId}`, 
        { 
          imagePath,
          updated_at: "2025-03-26 18:03:57" // Using the provided date
        }, 
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      console.log('Profile image update response:', response.data);
      
      // Create a temporary URL for immediate display in the UI
      const tempImageUrl = URL.createObjectURL(file);
      
      // Update the UI
      if (onProfileUpdate) {
        onProfileUpdate({ ...user, profileImage: tempImageUrl });
      }
      
      alert('Profile image updated successfully');
    } catch (error) {
      console.error('Error updating profile image:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      alert(`Failed to update profile image: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="profile-header">
      <div className="profile-header-overlay"></div>
      <div className="profile-header-content">
        <div className="profile-back-button">
          <i className="fi fi-rr-cross" onClick={handleRedirect}></i>
        </div>
        <div className="profile-image-container">
          <div className="profile-image">
            <img 
              src={user?.profileImage || '/default-profile.png'} 
              alt={user?.name || 'User'} 
            />
            {uploading && (
              <div className="upload-overlay">
                <span>Uploading...</span>
              </div>
            )}
          </div>
          <div className="profile-edit-icon" onClick={handleImageClick}>
            <i className="fi fi-rr-pencil"></i>
          </div>
          <input 
            id="profile-image-input"
            type="file" 
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>
        <div className="profile-info">
          <h1>{user?.name || 'User'}</h1>
          <p className="username">@{user?.username || 'laserXnext'}</p>
          <p>Member since {user?.dateJoined || new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;