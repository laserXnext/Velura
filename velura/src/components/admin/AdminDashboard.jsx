import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useMessages } from '../../hooks/MessageContext';
import { toast } from 'react-toastify'; // Add this import for toast
import '../../css/AdminMain.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get messages from context
  const { getActiveUsers, getUserMessages, markAsRead, addMessage, unreadCount } = useMessages();
  
  // Get user data from localStorage
  const [userData, setUserData] = useState(() => {
    const storedData = localStorage.getItem("user_data");
    return storedData ? JSON.parse(storedData) : { 
      username: '', 
      role: '' 
    };
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = () => {
      const userRole = localStorage.getItem("role") || userData?.role;
      
      // If not admin, redirect to home page
      if (userRole !== "admin") {
        console.log("[2025-03-25 19:45:14] laserXnext: User not authorized to access admin panel");
        toast.error("You don't have permission to access the admin panel");
        navigate('/');
      }
    };
    
    checkAdminRole();
  }, [navigate, userData?.role]);

  // Effect to handle window resize
  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleNotificationClick = () => {
    setShowChatPopup(!showChatPopup);
  };
  
  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    markAsRead(userId);
  };
  
  const handleCloseChat = () => {
    setSelectedUser(null);
    setShowChatPopup(false);
  };
  
  const handleGoToFullChat = () => {
    navigate('/admin/chats');
    setShowChatPopup(false);
  };
  
  const handleSendReply = (userId, message) => {
    if (message.trim() === '') return;
    addMessage(userId, message, true);
  };
  
  // Log out function
  const handleLogout = () => {
    console.log('[2025-03-25 19:45:14] laserXnext: Logged out');
    
    // Clear all localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("user_data");
    
    // Redirect to login page
    navigate('/login');
  };
  
  // Active link check
  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <h2>
            <i className="fi fi-rr-silk"></i>
            <span className="sidebar-title">Velura Admin</span>
          </h2>
          <button 
            className="sidebar-toggle" 
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <i className={`fi fi-rr-${isSidebarOpen ? 'arrow-small-left' : 'arrow-small-right'}`}></i>
          </button>
        </div>
        
        <nav className="admin-navigation">
          <ul>
            <li>
              <Link 
                to="/admin" 
                className={isActiveLink('/admin') && !isActiveLink('/admin/products')  && !isActiveLink('/admin/orders') && !isActiveLink('/admin/customers') && !isActiveLink('/admin/reviews') && !isActiveLink('/admin/promotions') && !isActiveLink('/admin/chats')? 'active' : '' }
              >
                <i className="fi fi-rr-dashboard"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/products" 
                className={isActiveLink('/admin/products') ? 'active' : ''}
              >
                <i className="fi fi-rr-box"></i>
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/orders" 
                className={isActiveLink('/admin/orders') ? 'active' : ''}
              >
                <i className="fi fi-rr-shopping-cart"></i>
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/customers" 
                className={isActiveLink('/admin/customers') ? 'active' : ''}
              >
                <i className="fi fi-rr-users"></i>
                <span>Customers</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/reviews" 
                className={isActiveLink('/admin/reviews') ? 'active' : ''}
              >
                <i className="fi fi-rr-comment"></i>
                <span>Reviews</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/chats" 
                className={isActiveLink('/admin/chats') ? 'active' : ''}
              >
                <i className="fi fi-rr-comment-alt"></i>
                <span>Customer Chats</span>
                {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {userData?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="admin-user-details">
              <p className="admin-username">{userData?.username || 'Admin'}</p>
              <p className="admin-role">{userData?.role || 'Administrator'}</p>
            </div>
          </div>
          <button className="admin-logout" onClick={handleLogout}>
            <i className="fi fi-rr-sign-out"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>
      
      {/* Mobile overlay */}
      {isSidebarOpen && isMobile && (
        <div className="admin-sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
      {/* Main content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            {isMobile && (
              <button className="mobile-menu-button" onClick={toggleSidebar}>
                <i className="fi fi-rr-menu-burger"></i>
              </button>
            )}
            <h1 className="admin-page-title">
              {location.pathname === '/admin' && 'Dashboard'}
              {location.pathname === '/admin/products' && 'Products'}
              {location.pathname === '/admin/orders' && 'Orders'}
              {location.pathname === '/admin/customers' && 'Customers'}
              {location.pathname === '/admin/categories' && 'Categories'}
              {location.pathname === '/admin/reviews' && 'Reviews'}
              {location.pathname === '/admin/chats' && 'Customer Chats'}
            </h1>
          </div>
          
          <div className="admin-header-right">
            <div className="admin-header-actions">
              <Link to="/" className="view-site-link">
                <i className="fi fi-rr-globe"></i>
                <span>View Site</span>
              </Link>
              <button className="notification-button" onClick={handleNotificationClick}>
                <i className="fi fi-rr-comment-alt"></i>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
            </div>
          </div>
        </header>
        
        {/* Chat popup */}
        {showChatPopup && (
          <div className="admin-chat-popup">
            <div className="admin-chat-popup-header">
              <h3>{selectedUser ? 'Chat with Customer' : 'Recent Chats'}</h3>
              {selectedUser && (
                <button className="back-button" onClick={() => setSelectedUser(null)}>
                  <i className="fi fi-rr-arrow-left"></i>
                </button>
              )}
              <button className="close-button" onClick={handleCloseChat}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            
            <div className="admin-chat-popup-content">
              {!selectedUser ? (
                // List of active chats
                <div className="chat-user-list">
                  {getActiveUsers().map(user => (
                    <div 
                      key={user.userId} 
                      className={`chat-user-item ${user.unreadMessages > 0 ? 'unread' : ''}`}
                      onClick={() => handleUserSelect(user.userId)}
                    >
                      <div className="chat-user-avatar">
                        {user.userId.charAt(0).toUpperCase()}
                      </div>
                      <div className="chat-user-details">
                        <div className="chat-user-name">
                          Customer {user.userId.substring(0, 8)}
                          {user.unreadMessages > 0 && (
                            <span className="chat-user-badge">{user.unreadMessages}</span>
                          )}
                        </div>
                        <div className="chat-user-last-message">
                          {user.lastMessage?.message.substring(0, 30)}
                          {user.lastMessage?.message.length > 30 && '...'}
                        </div>
                      </div>
                      <div className="chat-user-time">
                        {user.lastActivity && new Date(user.lastActivity).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {getActiveUsers().length === 0 && (
                    <div className="no-chats-message">
                      No active chats at the moment.
                    </div>
                  )}
                </div>
              ) : (
                // Individual chat view
                <AdminChatView 
                  userId={selectedUser} 
                  messages={getUserMessages(selectedUser)}
                  onSendReply={(message) => handleSendReply(selectedUser, message)}
                />
              )}
            </div>
            
            <div className="admin-chat-popup-footer">
              <button className="view-all-button" onClick={handleGoToFullChat}>
                View All Chats
              </button>
            </div>
          </div>
        )}
        
        <div className="admin-content">
          <Outlet />
        </div>
        
        <footer className="admin-footer">
          <p>&copy; 2025 Velura Saree Shop - Admin Panel v1.0.0</p>
          <p>Last updated: {new Date().toLocaleString()}</p>
        </footer>
      </main>
    </div>
  );
};

// Admin Chat View Component
const AdminChatView = ({ userId, messages, onSendReply }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendReply = (e) => {
    e.preventDefault();
    onSendReply(replyMessage);
    setReplyMessage('');
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="admin-chat-view">
      <div className="admin-chat-messages">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`admin-chat-message ${msg.isAdminMessage ? 'admin' : 'user'}`}
          >
            <div className="message-content">{msg.message}</div>
            <div className="message-time">{formatTime(msg.timestamp)}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="admin-chat-reply-form" onSubmit={handleSendReply}>
        <input
          type="text"
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Type your reply..."
          className="admin-chat-input"
        />
        <button type="submit" className="admin-chat-send-button">
          <i className="fi fi-rr-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default AdminLayout;