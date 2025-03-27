import React from 'react';
import OrderCard from '../OrderCard';

const OrdersTab = ({ orders, formatCurrency, formatDate }) => {
  const handleShopNow = () => {
    window.location.href = '/product';
  };
  return (
    <div className="profile-section">
      <div className="section-header">
        <h2>Your Orders</h2>
      </div>

      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              formatCurrency={formatCurrency} 
              formatDate={formatDate} 
            />
          ))
        ) : (
          <div className="empty-state">
            <i className="fas fa-shopping-bag"></i>
            <h3>No Orders Yet</h3>
            <p>When you place orders, they will appear here.</p>
            <button className="shop-now-btn" onClick={handleShopNow}>Shop Now</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTab;