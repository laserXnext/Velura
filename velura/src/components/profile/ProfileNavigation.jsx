import React from 'react';

const ProfileNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="profile-navigation">
      <button 
        className={`profile-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => setActiveTab('overview')}
      >
        <i className="fi fi-rr-circle-user"></i>Overview
      </button>
      <button 
        className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
        onClick={() => setActiveTab('orders')}
      >
        <i className="fi fi-rr-shopping-bag"></i>Orders
      </button>
      <button 
        className={`profile-nav-btn ${activeTab === 'measurements' ? 'active' : ''}`}
        onClick={() => setActiveTab('measurements')}
      >
        <i className="fi fi-rr-pencil-ruler"></i>Measurements
      </button>
    </div>
  );
};

export default ProfileNavigation;