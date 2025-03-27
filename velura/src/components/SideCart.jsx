import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/cartContext';
import '../css/SideCart.css';

const SideCart = ({ isOpen, onClose }) => {
  const { cart, itemCount, subtotal, total, removeFromCart, updateQuantity } = useCart();
  
  // Format price with currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const handleQuantityChange = (id, delta) => {
    const item = cart.find(item => item.id === id);
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity > 0) {
        updateQuantity(id, newQuantity);
      } else {
        removeFromCart(id);
      }
    }
  };
  
  return (
    <>
      {/* Overlay */}
      <div 
        className={`side-cart-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      ></div>
      
      {/* Side Cart Panel */}
      <div className={`side-cart ${isOpen ? 'open' : ''}`}>
        <div className="side-cart-header">
          <h3>Your Cart <span>({itemCount} items)</span></h3>
          <button className="side-cart-close" onClick={onClose} aria-label="Close cart">
            <i className="fi fi-rr-cross"></i>
          </button>
        </div>
        
        <div className="side-cart-content">
          {cart.length === 0 ? (
            <div className="side-cart-empty">
              <i className="fi fi-rr-shopping-cart"></i>
              <p>Your cart is empty</p>
              <Link to="/product" className="side-cart-empty-cta" onClick={onClose}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="side-cart-items">
                {cart.map((item) => (
                  <div className="side-cart-item" key={item.id}>
                    <div className="side-cart-item-image">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        onError={(e) => { e.target.src = "/1.webp"; }}
                      />
                    </div>
                    
                    <div className="side-cart-item-info">
                      <h4>{item.name}</h4>
                      <div className="side-cart-item-details">
                        {item.color && (
                          <span className="side-cart-item-color">
                            <span 
                              className="color-dot"
                              style={{ backgroundColor: item.color.toLowerCase() }}
                            ></span>
                            {item.color}
                          </span>
                        )}
                        {item.material && (
                          <span className="side-cart-item-material">
                            {item.material}
                          </span>
                        )}
                      </div>
                      
                      <div className="side-cart-item-price">
                        {formatPrice(item.price)}
                        {item.quantity > 1 && (
                          <span className="side-cart-item-quantity">
                            × {item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="side-cart-item-actions">
                      <div className="side-cart-quantity">
                        <button 
                          className="side-cart-qty-btn"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <i className="fi fi-rr-minus-small"></i>
                        </button>
                        <span className="side-cart-qty-value">{item.quantity}</span>
                        <button 
                          className="side-cart-qty-btn"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <i className="fi fi-rr-plus-small"></i>
                        </button>
                      </div>
                      
                      <button 
                        className="side-cart-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                      >
                        <i className="fi fi-rr-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="side-cart-summary">
                <div className="side-cart-subtotal">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="side-cart-total">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <div className="side-cart-actions">
                <Link 
                  to="/cart" 
                  className="side-cart-view-btn"
                  onClick={onClose}
                >
                  View Cart
                </Link>
              </div>
              
              <div className="side-cart-recently-added">
                <p>
                  <i className="fi fi-rr-check-circle"></i>
                  Item added to your cart
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SideCart;