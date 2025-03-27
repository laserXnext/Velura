// src/pages/admin/OrderDetails.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('2025-03-24 13:35:41');
  const [currentUser, setCurrentUser] = useState('laserXnext');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const printFrameRef = useRef(null);
  
  // Get auth token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        
        const response = await axios.get(
          `http://localhost:8082/api/admin/orders/${orderId}`,
          { headers: getAuthHeader() }
        );
        
        setOrder(response.data);
      } catch (error) {
        console.error(`[${currentDateTime}] ${currentUser}: Error fetching order details:`, error);
        setErrorMessage(error.response?.data?.error || 'Failed to fetch order details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, currentDateTime, currentUser]);
  
  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdateLoading(true);
      
      await axios.put(
        `http://localhost:8082/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: getAuthHeader() }
      );
      
      // Update local state
      setOrder({
        ...order,
        status: newStatus,
        updated_at: currentDateTime
      });
      
    } catch (error) {
      console.error(`[${currentDateTime}] ${currentUser}: Error updating order status:`, error);
      setErrorMessage(error.response?.data?.error || 'Failed to update order status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };
  
  // Print invoice
  const handlePrintInvoice = () => {
    const printFrame = printFrameRef.current;
    if (printFrame && order) {
      const printDoc = printFrame.contentDocument;
      printDoc.open();
      printDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice #${order.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.5;
              margin: 0;
              padding: 20px;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #eee;
              padding-bottom: 20px;
            }
            .invoice-title {
              font-size: 24px;
              color: #333;
              margin-bottom: 5px;
            }
            .invoice-date {
              font-size: 14px;
              color: #777;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .address {
              margin-bottom: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            table th, table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            table th {
              background-color: #f8f8f8;
            }
            .total-row {
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 30px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="invoice-title">INVOICE #${order.id}</div>
            <div class="invoice-date">Date: ${new Date(order.date).toLocaleDateString()}</div>
            <div class="invoice-date">Status: ${order.status}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div>${order.customer.name}</div>
            <div>${order.customer.email}</div>
            <div>${order.customer.phone}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Shipping Address</div>
            <div class="address">${order.shipping.street}</div>
            <div class="address">${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip}</div>
            <div class="address">${order.shipping.country}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>LKR ${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>LKR ${item.subtotal.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Total:</td>
                  <td>LKR ${order.total_amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Velura Sarees</p>
            <p>Generated on: ${currentDateTime}</p>
          </div>
        </body>
        </html>
      `);
      printDoc.close();
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (isLoading) {
    return (
      <div className="admin-loading">
        <i className="fi fi-rr-spinner admin-spinner"></i>
        <p>Loading order details...</p>
      </div>
    );
  }
  
  if (!order && !isLoading) {
    return (
      <div className="admin-error-container">
        <div className="admin-error-message">
          <i className="fi fi-rr-exclamation-triangle"></i>
          <h2>Order Not Found</h2>
          <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            className="admin-button primary"
            onClick={() => navigate('/admin/orders')}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-order-details">
      <iframe ref={printFrameRef} style={{ display: 'none' }} title="Print Frame"></iframe>
      
      <div className="admin-page-header">
        <div className="header-title">
          <h1>Order #{order.id}</h1>
          <span className={`status-badge status-${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </div>
        
        <div className="admin-header-actions">
          <button 
            className="admin-button secondary"
            onClick={() => navigate('/admin/orders')}
          >
            <i className="fi fi-rr-arrow-left"></i> Back to Orders
          </button>
          
          <button 
            className="admin-button secondary"
            onClick={handlePrintInvoice}
          >
            <i className="fi fi-rr-print"></i> Print Invoice
          </button>
          
          <div className="status-dropdown">
            <button 
              className={`admin-button primary ${statusUpdateLoading ? 'loading' : ''}`}
              disabled={statusUpdateLoading}
            >
              {statusUpdateLoading ? (
                <>
                  <i className="fi fi-rr-spinner admin-spinner"></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fi fi-rr-edit"></i> Change Status
                </>
              )}
            </button>
            <div className="dropdown-content">
              <button 
                className="dropdown-item"
                onClick={() => handleStatusChange('Pending')}
                disabled={order.status === 'Pending'}
              >
                Pending
              </button>
              <button 
                className="dropdown-item"
                onClick={() => handleStatusChange('Processing')}
                disabled={order.status === 'Processing'}
              >
                Processing
              </button>
              <button 
                className="dropdown-item"
                onClick={() => handleStatusChange('Shipped')}
                disabled={order.status === 'Shipped'}
              >
                Shipped
              </button>
              <button 
                className="dropdown-item"
                onClick={() => handleStatusChange('Delivered')}
                disabled={order.status === 'Delivered'}
              >
                Delivered
              </button>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item text-danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this order?')) {
                    handleStatusChange('Cancelled');
                  }
                }}
                disabled={order.status === 'Cancelled'}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {errorMessage && (
        <div className="admin-error-message">
          <i className="fi fi-rr-exclamation"></i>
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage('')}>
            <i className="fi fi-rr-cross-small"></i>
          </button>
        </div>
      )}
      
      <div className="order-meta-info">
        <div className="meta-item">
          <i className="fi fi-rr-calendar"></i>
          <span className="meta-label">Order Date:</span>
          <span className="meta-value">{formatDate(order.date)}</span>
        </div>
        
        <div className="meta-item">
          <i className="fi fi-rr-user"></i>
          <span className="meta-label">Customer:</span>
          <span className="meta-value">
            <Link to={`/admin/customers/${order.customer.id}`}>
              {order.customer.name}
            </Link>
          </span>
        </div>
        
        <div className="meta-item">
          <i className="fi fi-rr-dollar"></i>
          <span className="meta-label">Total Amount:</span>
          <span className="meta-value">{formatCurrency(order.total_amount)}</span>
        </div>
        
        <div className="meta-item">
          <i className="fi fi-rr-box"></i>
          <span className="meta-label">Items Count:</span>
          <span className="meta-value">{order.items.length}</span>
        </div>
      </div>
      
      <div className="order-details-grid">
        <div className="order-info-panel">
          <div className="panel-section">
            <h2>Customer Information</h2>
            <div className="customer-details">
              <p><strong>Name:</strong> {order.customer.name}</p>
              <p><strong>Email:</strong> {order.customer.email}</p>
              <p><strong>Phone:</strong> {order.customer.phone}</p>
              <Link to={`/admin/customers/${order.customer.id}`} className="admin-link">
                <i className="fi fi-rr-user"></i> View Customer Profile
              </Link>
            </div>
          </div>
          
          <div className="panel-section">
            <h2>Shipping Information</h2>
            <div className="shipping-details">
              <p>{order.shipping.street}</p>
              <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
              <p>{order.shipping.country}</p>
            </div>
          </div>
          
          <div className="panel-section">
            <h2>Order Timeline</h2>
            <div className="order-timeline">
              <div className="timeline-item">
                <div className="timeline-icon">
                  <i className="fi fi-rr-plus"></i>
                </div>
                <div className="timeline-content">
                  <p className="timeline-title">Order Created</p>
                  <p className="timeline-date">{formatDate(order.created_at)}</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-icon">
                  <i className="fi fi-rr-refresh"></i>
                </div>
                <div className="timeline-content">
                  <p className="timeline-title">Last Updated</p>
                  <p className="timeline-date">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="order-items-panel">
          <h2>Order Items</h2>
          
          <div className="order-items-list">
            {order.items.map(item => (
              <div className="order-item" key={item.id}>
                <div className="item-image">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    onError={(e) => { e.target.src = "/1.webp"; }}
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">
                    <Link to={`/admin/products/${item.product_id}`}>
                      {item.name}
                    </Link>
                  </h3>
                  
                  <div className="item-meta">
                    <div className="item-price">
                      <span className="meta-label">Price:</span>
                      <span className="meta-value">{formatCurrency(item.price)}</span>
                    </div>
                    
                    <div className="item-quantity">
                      <span className="meta-label">Quantity:</span>
                      <span className="meta-value">{item.quantity}</span>
                    </div>
                    
                    <div className="item-subtotal">
                      <span className="meta-label">Subtotal:</span>
                      <span className="meta-value">{formatCurrency(item.subtotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="order-summary">
            <div className="summary-row">
              <span>Items Total:</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
            
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="admin-action-bar">      
        <div className="admin-buttons">
          <button 
            className="admin-button secondary"
            onClick={() => navigate('/admin/orders')}
          >
            Back to Orders
          </button>
          
          <button 
            className="admin-button primary"
            onClick={handlePrintInvoice}
          >
            <i className="fi fi-rr-print"></i> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;