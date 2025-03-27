import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/profile.css';

// Import components
import ProfileHeader from './components/profile/ProfileHeader';
import ProfileNavigation from './components/profile/ProfileNavigation';
import ProfileFooter from './components/profile/ProfileFooter';
import OverviewTab from './components/profile/tabs/OverviewTab';
import OrdersTab from './components/profile/tabs/OrdersTab';
import MeasurementsTab from './components/profile/tabs/MeasurementsTab';

// Import formatters
import { formatCurrency, formatDate } from './utils/formatters';

const UserProfile = () => {
  const navigate = useNavigate();
  
  // User authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // User data state
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    profileImage: '/profile.jfif',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    dateJoined: '',
    username: '',
    lastLogin: ''
  });

  // Orders data state
  const [orders, setOrders] = useState([]);

  // Measurement data state
  const [measurements, setMeasurements] = useState({
    blouse: {
      bust: '',
      waist: '',
      shoulder: '',
      armLength: '',
      armhole: ''
    },
    petticoat: {
      waist: '',
      length: ''
    }
  });

  // State to track active tab
  const [activeTab, setActiveTab] = useState('overview');

  // Current date and user info
  const currentDate = '2025-03-18 09:23:32';
  const currentUser = 'laserXnext'; 

  // Fetch user data on component mount
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('user_id');
    
    if (!token || !username) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    setIsAuthenticated(true);
    
    // Fetch user profile data
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8082/api/user/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          // Update the user state with data from API
          setUser({
            id: userData.user_id || userId,
            name: userData.name || username,
            email: userData.email || '',
            phone: userData.phone || '',
            profileImage: userData.profile_image_path || '/profile.jfif',
            address: {
              street: userData.street || '',
              city: userData.city || '',
              state: userData.state || '',
              zipCode: userData.zip_code || '',
              country: userData.country || ''
            },
            dateJoined: userData.date_joined || '',
            username: userData.username || username,
            lastLogin: userData.last_login || currentDate
          });
        } else {
          // If API call fails, use data from localStorage as fallback
          setUser(prev => ({
            ...prev,
            username: username,
            name: username,
            lastLogin: currentDate
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Use fallback data if API call fails
        setUser(prev => ({
          ...prev,
          username: username,
          name: username,
          lastLogin: currentDate
        }));
      }
    };
    
    // Fetch user orders
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:8082/api/user/orders/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const orderData = await response.json();
          setOrders(orderData);
        } else {
          // Use sample data as fallback
          setOrders([
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
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching user orders:', error);
      }
    };
    
    // Fetch user measurements
    const fetchMeasurements = async () => {
      try {
        const response = await fetch(`http://localhost:8082/api/user/measurements/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const measurementData = await response.json();
          setMeasurements({
            blouse: {
              bust: measurementData.blouse_bust || '',
              waist: measurementData.blouse_waist || '',
              shoulder: measurementData.blouse_shoulder || '',
              armLength: measurementData.blouse_arm_length || '',
              armhole: measurementData.blouse_armhole || ''
            },
            petticoat: {
              waist: measurementData.petticoat_waist || '',
              length: measurementData.petticoat_length || ''
            }
          });
        } else {
          // Use sample data as fallback
          setMeasurements({
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
        }
      } catch (error) {
        console.error('Error fetching user measurements:', error);
      }
    };
    
    // Call all fetch functions
    fetchUserData();
    fetchOrders();
    fetchMeasurements();
  }, [navigate]);

  // If not authenticated, don't render the profile
  if (!isAuthenticated) {
    return null; // Or you could show a loading spinner here
  }

  return (
    <div className="profile-container">
      {/* Profile Header Component */}
      <ProfileHeader user={user} />
      
      {/* Navigation Component */}
      <ProfileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Content Area */}
      <div className="profile-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <OverviewTab user={user} setUser={setUser} />
        )}
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrdersTab 
            orders={orders} 
            formatCurrency={formatCurrency} 
            formatDate={formatDate} 
          />
        )}
        
        {/* Measurements Tab */}
        {activeTab === 'measurements' && (
          <MeasurementsTab 
            measurements={measurements}
            setMeasurements={setMeasurements}
            currentDate={currentDate}
          />
        )}
      </div>
      
      {/* Footer Component - Display current date and username */}
      <ProfileFooter currentDate={currentDate} currentUser={currentUser} />
    </div>
  );
};

export default UserProfile;