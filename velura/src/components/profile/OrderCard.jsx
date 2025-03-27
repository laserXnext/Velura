import React from 'react';

const OrderCard = ({ order, formatCurrency, formatDate }) => {
  return (
    <div className="order-card">
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
  );
};

export default OrderCard;