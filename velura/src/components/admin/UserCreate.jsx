import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    profile_image_path: '',
    password: '',
    confirm_password: ''
  });
  
  // Get auth token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (!formData.name || !formData.email || !formData.username || !formData.password) {
      setErrorMessage('Name, email, username, and password are required');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Remove confirm_password from the data sent to the API
      const userData = { ...formData };
      delete userData.confirm_password;
      
      const response = await axios.post('http://localhost:8082/api/admin/users', userData, {
        headers: getAuthHeader()
      });
      
      navigate(`/admin/customers`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] laserXnext: Error creating user:`, error);
      setErrorMessage(error.response?.data?.error || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="admin-user-create">
      {errorMessage && (
        <div className="error-message">
          <i className="fi fi-rr-exclamation"></i>
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage('')}>
            <i className="fi fi-rr-cross-small"></i>
          </button>
        </div>
      )}
      
      <div className="admin-page-header">
        <button 
          className="back-button"
          onClick={() => navigate('/admin/customers')}
        >
          <i className="fi fi-rr-arrow-left"></i> Back to Customers
        </button>
        
        <h1>Create New User</h1>
      </div>
      
      <div className="user-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h4 className="Admin-form-h4">Basic Information</h4>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Username <span className="required">*</span></label>
                <input 
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Profile Image URL</label>
              <input 
                type="text"
                name="profile_image_path"
                value={formData.profile_image_path}
                onChange={handleInputChange}
                placeholder="Profile Image URL"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h4 className="Admin-form-h4">Address Information</h4>
            
            <div className="form-group">
              <label>Street Address</label>
              <input 
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="Street Address"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input 
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
              </div>
              
              <div className="form-group">
                <label>State/Province</label>
                <input 
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State/Province"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>ZIP/Postal Code</label>
                <input 
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  placeholder="ZIP/Postal Code"
                />
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <input 
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h4 className="Admin-form-h4">Account Security</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>Password <span className="required">*</span></label>
                <input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Confirm Password <span className="required">*</span></label>
                <input 
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button"
              className="admin-button secondary"
              onClick={() => navigate('/admin/customers')}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="admin-button primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fi fi-rr-spinner admin-spinner"></i> Creating...
                </>
              ) : (
                <>
                  <i className="fi fi-rr-check"></i> Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreate;