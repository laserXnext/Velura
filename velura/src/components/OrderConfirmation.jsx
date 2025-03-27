import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import '../css/order-confirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Current timestamp for logging
  const currentDateTime = '2025-03-21 17:33:15';
  
  useEffect(() => {
    // Check if we have order details from navigation state
    if (location.state?.orderSuccess && location.state?.orderDetails) {
      setOrderDetails(location.state.orderDetails);
      setLoading(false);
      console.log(`[${currentDateTime}] Displaying order confirmation for order ${orderId}`);
    } else {
      // If no state (e.g., page refresh), fetch the order details
      // This would typically call an API endpoint to get order details
      // For now, we'll redirect to the orders page if details aren't available
      console.log(`[${currentDateTime}] No order details found in state, redirecting`);
      navigate('/profile');
    }
  }, [orderId, location.state, navigate, currentDateTime]);
  
  // Format price with currency
  const formatPrice = (price) => {
    if (!price) return 'LKR 0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  if (loading) {
    return (
      <div className="order-confirmation-loading">
        <i className="fi fi-rr-spinner loading-spinner"></i>
        <p>Loading order details...</p>
      </div>
    );
  }
  
  return (
    <div className="order-confirmation-container">
      <div className="order-confirmation-box">
        <div className="order-confirmation-header">
          <div className="order-confirmation-icon">
            <i className="fi fi-rr-check-circle"></i>
          </div>
          <h1>Thank You for Your Order!</h1>
          <p>Your order has been placed successfully</p>
        </div>
        
        <div className="order-confirmation-details">
          <div className="order-confirmation-info">
            <p><strong>Order Number:</strong> {orderId}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            <p><strong>Items:</strong> {orderDetails.items}</p>
            <p><strong>Total:</strong> {formatPrice(orderDetails.total)}</p>
          </div>
          
          <div className="order-confirmation-message">
            <p>We've received your order and will begin processing it right away. You will receive an email confirmation shortly.</p>
          </div>
        </div>
        
        <div className="order-confirmation-actions">
          <Link to="/profile" className="order-view-button">
            View My Orders
          </Link>
          <Link to="/product" className="order-continue-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;