import React, { useState } from 'react';
import { toast } from 'react-toastify';

const OverviewTab = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({...user});
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedUser({
        ...editedUser,
        [parent]: {
          ...editedUser[parent],
          [child]: value
        }
      });
    } else {
      setEditedUser({
        ...editedUser,
        [name]: value
      });
    }
  };

  // Cancel editing and reset form
  const handleCancel = () => {
    setEditedUser({...user});
    setIsEditing(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      
      const response = await fetch(`http://localhost:8082/api/user/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editedUser.name,
          email: editedUser.email,
          phone: editedUser.phone,
          address: editedUser.address
        })
      });
      
      if (response.ok) {
        // Update the user state with edited data
        setUser(editedUser);
        
        // Show success message
        toast.success("Profile updated successfully!");
        
        // Exit edit mode
        setIsEditing(false);
      } else {
        const errorData = await response.json().catch(() => null) || await response.text();
        console.error("Error updating profile:", errorData);
        toast.error(typeof errorData === 'string' ? errorData : "Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h2>Account Details</h2>
        {!isEditing ? (
          <button 
            className="edit-btn" 
            onClick={() => setIsEditing(true)}
          >
            <i className="fi fi-rr-edit"></i> Edit
          </button>
        ) : null}
      </div>

      <div className="session-info-card">
        <div className="session-info-header">
          <i className="fi fi-rr-user"></i>
          <h3>Current Session</h3>
        </div>
        <div className="session-info-content">
          <div className="session-detail">
            <span className="label">Logged in as:</span>
            <span className="value">{user.username || 'laserXnext'}</span>
          </div>
          <div className="session-detail">
            <span className="label">Last login:</span>
            <span className="value">{user.lastLogin || '2025-03-18 10:05:48'}</span>
          </div>
        </div>
      </div>

      {!isEditing ? (
        <div className="account-details">
          <div className="detail-group">
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{user.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{user.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="detail-group">
            <h3>Shipping Address</h3>
            <div className="detail-item">
              <span className="detail-label">Street</span>
              <span className="detail-value">{user.address?.street || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">City</span>
              <span className="detail-value">{user.address?.city || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">State</span>
              <span className="detail-value">{user.address?.state || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Zip Code</span>
              <span className="detail-value">{user.address?.zipCode || 'Not provided'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Country</span>
              <span className="detail-value">{user.address?.country || 'Not provided'}</span>
            </div>
          </div>
          
          <div className="detail-group">
            <h3>Account Information</h3>
            <div className="detail-item">
              <span className="detail-label">Username</span>
              <span className="detail-value">{user.username}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">{user.dateJoined || 'Not available'}</span>
            </div>
          </div>
        </div>
      ) : (
        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedUser.name || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={editedUser.email || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={editedUser.phone || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-section">
            <h3>Shipping Address</h3>
            
            <div className="form-group">
              <label htmlFor="address.street">Street</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={editedUser.address?.street || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.city">City</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={editedUser.address?.city || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.state">State</label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={editedUser.address?.state || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address.zipCode">Zip Code</label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={editedUser.address?.zipCode || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="address.country">Country</label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={editedUser.address?.country || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OverviewTab;