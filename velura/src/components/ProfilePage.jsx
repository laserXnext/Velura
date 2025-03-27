import { useState } from 'react';
import '../css/profile.css';

const UserProfile = () => {
  const [user, setUser] = useState({
    id: '12345',
    name: 'Chamali Tennakoon',
    email: 'Chamali.Tennakoon@example.com',
    phone: '+91 98765 43210',
    profileImage: '/profile.jfif',
    address: {
      street: '42 Silk Garden Society',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    dateJoined: 'January 15, 2024'
  });

  const [orders, setOrders] = useState([
    {
      id: 'ORD-8765431',
      date: '2025-03-01',
      status: 'Delivered',
      total: 12499,
      items: [
        { 
          id: 'SAREE-1003', 
          name: 'Kanchipuram Silk Saree - Royal Purple',
          price: 12499,
          image: '/sarees/saree- (24).jpeg'
        }
      ]
    },
    {
      id: 'ORD-8765290',
      date: '2025-02-14',
      status: 'Delivered',
      total: 18700,
      items: [
        { 
          id: 'SAREE-892', 
          name: 'Banarasi Silk Saree - Gold Zari',
          price: 18700,
          image: '/sarees/saree- (25).jpeg'
        }
      ]
    },
    {
      id: 'ORD-8764912',
      date: '2025-01-20',
      status: 'Delivered',
      total: 15999,
      items: [
        { 
          id: 'SAREE-567', 
          name: 'Designer Pattu Saree - Peacock Blue',
          price: 15999,
          image: '/sarees/saree- (26).jpeg'
        }
      ]
    }
  ]);

  // Measurement data (sample)
  const [measurements, setMeasurements] = useState({
    blouse: {
      bust: '36',
      waist: '32',
      shoulder: '14',
      armLength: '22',
      armhole: '16'
    },
    petticoat: {
      waist: '32',
      length: '40'
    }
  });

  // State to track active tab
  const [activeTab, setActiveTab] = useState('overview');

  // State for form editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({...user});
  
  // State for measurement editing
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [editedMeasurements, setEditedMeasurements] = useState({...measurements});

  // Current date info
  const currentDate = '2025-03-17 11:45:25';
  const currentUser = 'laserXnext';

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

  // Handle measurement input changes
  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedMeasurements({
        ...editedMeasurements,
        [parent]: {
          ...editedMeasurements[parent],
          [child]: value
        }
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setUser(editedUser);
    setIsEditing(false);
    // Here you would typically send the updated data to your backend
  };

  // Handle measurements form submission
  const handleMeasurementSubmit = (e) => {
    e.preventDefault();
    setMeasurements(editedMeasurements);
    setIsEditingMeasurements(false);
    // Here you would typically send the updated data to your backend
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-overlay"></div>
        <div className="profile-header-content">
          <div className="profile-image">
            <img src={user.profileImage} alt={user.name} />
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p>Member since {user.dateJoined}</p>
          </div>
        </div>
      </div>

      <div className="profile-navigation">
        <button 
          className={`profile-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i class="fi fi-rr-circle-user"></i>Overview
        </button>
        <button 
          className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <i class="fi fi-rr-shopping-bag"></i>Orders
        </button>
        <button 
          className={`profile-nav-btn ${activeTab === 'measurements' ? 'active' : ''}`}
          onClick={() => setActiveTab('measurements')}
        >
          <i class="fi fi-rr-pencil-ruler"></i>Measurements
        </button>
      </div>

      <div className="profile-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Account Details</h2>
              {!isEditing ? (
                <button 
                  className="edit-btn" 
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fi fi-rr-edit"/> Edit
                </button>
              ) : null}
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
                    <span className="detail-value">{user.phone}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h3>Shipping Address</h3>
                  <div className="detail-item">
                    <span className="detail-label">Street</span>
                    <span className="detail-value">{user.address.street}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">City</span>
                    <span className="detail-value">{user.address.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">State</span>
                    <span className="detail-value">{user.address.state}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Zip Code</span>
                    <span className="detail-value">{user.address.zipCode}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Country</span>
                    <span className="detail-value">{user.address.country}</span>
                  </div>
                </div>
                
                <div className="detail-group">
                  <h3>Account Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Username</span>
                    <span className="detail-value">{currentUser}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Login</span>
                    <span className="detail-value">{currentDate}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form className="profile-edit-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={editedUser.name} 
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
                      value={editedUser.email} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={editedUser.phone} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Shipping Address</h3>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="street">Street</label>
                    <input 
                      type="text" 
                      id="street" 
                      name="address.street" 
                      value={editedUser.address.street} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input 
                      type="text" 
                      id="city" 
                      name="address.city" 
                      value={editedUser.address.city} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input 
                      type="text" 
                      id="state" 
                      name="address.state" 
                      value={editedUser.address.state} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipCode">Zip Code</label>
                    <input 
                      type="text" 
                      id="zipCode" 
                      name="address.zipCode" 
                      value={editedUser.address.zipCode} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input 
                      type="text" 
                      id="country" 
                      name="address.country" 
                      value={editedUser.address.country} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUser({...user});
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Your Orders</h2>
            </div>

            <div className="orders-list">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div className="order-card" key={order.id}>
                    <div className="order-header">
                      <div className="order-id">
                        <span className="label">Order ID:</span>
                        <span className="value">{order.id}</span>
                      </div>
                      <div className="order-date">
                        <span className="label">Date:</span>
                        <span className="value">{formatDate(order.date)}</span>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item) => (
                        <div className="order-item" key={item.id}>
                          <div className="item-image">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="item-details">
                            <h4>{item.name}</h4>
                            <p className="item-price">{formatCurrency(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        <span className="label">Total:</span>
                        <span className="total-value">{formatCurrency(order.total)}</span>
                      </div>
                      <button className="view-details-btn">View Details</button>
                      </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fas fa-shopping-bag"></i>
                  <h3>No Orders Yet</h3>
                  <p>When you place orders, they will appear here.</p>
                  <button className="shop-now-btn">Shop Now</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Measurements Tab */}
        {activeTab === 'measurements' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Your Measurements</h2>
              {!isEditingMeasurements ? (
                <button 
                  className="edit-btn" 
                  onClick={() => setIsEditingMeasurements(true)}
                >
                   <i className="fi fi-rr-edit"/> Edit
                </button>
              ) : null}
            </div>
            
            <div className="measurement-info-box">
              <p>Your saved measurements help us customize your sarees and blouses for the perfect fit.</p>
              <p className="measurement-last-update">Last updated: {currentDate}</p>
            </div>

            {!isEditingMeasurements ? (
              <div className="measurements-container">
                <div className="detail-group measurement-card">
                  <h3>Blouse Measurements</h3>
                  <div className="detail-item">
                    <span className="detail-label">Bust</span>
                    <span className="detail-value">{measurements.blouse.bust} inches</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Waist</span>
                    <span className="detail-value">{measurements.blouse.waist} inches</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Shoulder</span>
                    <span className="detail-value">{measurements.blouse.shoulder} inches</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Arm Length</span>
                    <span className="detail-value">{measurements.blouse.armLength} inches</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Armhole</span>
                    <span className="detail-value">{measurements.blouse.armhole} inches</span>
                  </div>
                </div>

                <div className="detail-group measurement-card">
                  <h3>Petticoat Measurements</h3>
                  <div className="detail-item">
                    <span className="detail-label">Waist</span>
                    <span className="detail-value">{measurements.petticoat.waist} inches</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Length</span>
                    <span className="detail-value">{measurements.petticoat.length} inches</span>
                  </div>
                </div>

                <div className="measurement-guide">
                  <div className="measurement-guide-icon">
                    <i className="fas fa-ruler"></i>
                  </div>
                  <div className="measurement-guide-content">
                    <h4>Need help with measurements?</h4>
                    <p>View our detailed measurement guide to ensure accurate measurements.</p>
                    <button className="view-guide-btn">View Measurement Guide</button>
                  </div>
                </div>
              </div>
            ) : (
              <form className="profile-edit-form" onSubmit={handleMeasurementSubmit}>
                <div className="form-section">
                  <h3>Blouse Measurements</h3>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="blouse-bust">Bust (inches)</label>
                    <input 
                      type="text" 
                      id="blouse-bust" 
                      name="blouse.bust" 
                      value={editedMeasurements.blouse.bust} 
                      onChange={handleMeasurementChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="blouse-waist">Waist (inches)</label>
                    <input 
                      type="text" 
                      id="blouse-waist" 
                      name="blouse.waist" 
                      value={editedMeasurements.blouse.waist} 
                      onChange={handleMeasurementChange} 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="blouse-shoulder">Shoulder (inches)</label>
                    <input 
                      type="text" 
                      id="blouse-shoulder" 
                      name="blouse.shoulder" 
                      value={editedMeasurements.blouse.shoulder} 
                      onChange={handleMeasurementChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="blouse-armLength">Arm Length (inches)</label>
                    <input 
                      type="text" 
                      id="blouse-armLength" 
                      name="blouse.armLength" 
                      value={editedMeasurements.blouse.armLength} 
                      onChange={handleMeasurementChange} 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="blouse-armhole">Armhole (inches)</label>
                    <input 
                      type="text" 
                      id="blouse-armhole" 
                      name="blouse.armhole" 
                      value={editedMeasurements.blouse.armhole} 
                      onChange={handleMeasurementChange} 
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Petticoat Measurements</h3>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="petticoat-waist">Waist (inches)</label>
                    <input 
                      type="text" 
                      id="petticoat-waist" 
                      name="petticoat.waist" 
                      value={editedMeasurements.petticoat.waist} 
                      onChange={handleMeasurementChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="petticoat-length">Length (inches)</label>
                    <input 
                      type="text" 
                      id="petticoat-length" 
                      name="petticoat.length" 
                      value={editedMeasurements.petticoat.length} 
                      onChange={handleMeasurementChange} 
                    />
                  </div>
                </div>

                <div className="form-guidance-note">
                  <i className="fas fa-info-circle"></i>
                  <p>Please provide accurate measurements to ensure the perfect fit. All measurements should be in inches.</p>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-btn">Save Measurements</button>
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => {
                      setIsEditingMeasurements(false);
                      setEditedMeasurements({...measurements});
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      
      <div className="profile-footer">
        <p>Last login: {currentDate} | User: {currentUser}</p>
        <div className="support-links">
          <a href="#" className="support-link">Need Help?</a>
          <a href="#" className="support-link">Contact Support</a>
          <a href="#" className="support-link">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;