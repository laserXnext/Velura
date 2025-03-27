import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/cartContext';
import { createOrder } from '../hooks/orders';
import '../css/cart.css';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, discount, total } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const navigate = useNavigate();
  
  // Current timestamp and user login
  const currentDateTime = '2025-03-21 17:33:15';
  const currentUser = 'laserXnext';

  const handleQuantityChange = (id, delta) => {
    console.log(`[${currentDateTime}] ${currentUser}: Changing quantity for item ID: ${id} by ${delta}`);
    const item = cart.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + delta);
    }
  };
  
  const handleRemoveItem = (id) => {
    console.log(`[${currentDateTime}] ${currentUser}: Removing item ID: ${id} from cart`);
    removeFromCart(id);
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      console.log(`[${currentDateTime}] ${currentUser}: Clearing entire cart`);
      clearCart();
    }
  };

  // Format price with currency
  const formatPrice = (price) => {
    if (!price) return 'LKR 0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Apply promo code
  const applyPromoCode = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    
    if (!promoCode) {
      setPromoError('Please enter a promo code');
      return;
    }
    
    // Simulate checking promo code
    setIsProcessing(true);
    console.log(`[${currentDateTime}] ${currentUser}: Applying promo code: ${promoCode}`);
    
    setTimeout(() => {
      setIsProcessing(false);
      
      // Example promo code logic
      if (promoCode.toUpperCase() === 'SAREE10') {
        setPromoSuccess('Promo code applied successfully! 10% discount added.');
        // You would update the cart context with the new discount
      } else if (promoCode.toUpperCase() === 'FREESHIP') {
        setPromoSuccess('Free shipping has been applied to your order!');
        // You would update the cart context with free shipping
      } else {
        setPromoError('Invalid or expired promo code');
      }
    }, 1000);
  };
  
  const handleCheckout = async () => {
    // Reset error state
    setOrderError('');
    setIsProcessing(true);
  
    try {
      // Check if user is logged in
      const userString = localStorage.getItem('user_data');
      console.log(`[${currentDateTime}] ${currentUser}: Retrieved user data: ${userString}`);
      let userData;
  
      try {
        userData = JSON.parse(userString);
        console.log(`[${currentDateTime}] ${currentUser}: Parsed user data:`, userData);
      } catch (error) {
        console.error(`[${currentDateTime}] ${currentUser}: Failed to parse user data:`, error);
        throw new Error('Invalid user data. Please log in again.');
      }
  
      if (!userData || !userData.token) {
        // Redirect to login if user is not authenticated
        navigate('/login', { state: { from: '/cart', message: 'Please log in to complete your purchase' } });
        return;
      }
  
      console.log(`[${currentDateTime}] ${currentUser}: Proceeding to checkout with ${cart.length} items totaling ${formatPrice(total)}`);
  
      // Prepare order data
      const orderItems = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_path: item.image
      }));
  
      const orderData = {
        items: orderItems,
        total_amount: total,
        discount_amount: discount,
        subtotal_amount: subtotal
      };
  
      // Create order in database
      const response = await createOrder(orderData);
  
      // If successful, clear cart and redirect to confirmation page
      clearCart();
  
      // Navigate to order confirmation page
      navigate(`/profile/orders/${response.orderId}`, { 
        state: { 
          orderSuccess: true,
          orderDetails: {
            id: response.orderId,
            total: total,
            items: cart.length
          } 
        } 
      });
  
    } catch (error) {
      console.error(`[${currentDateTime}] ${currentUser}: Error creating order:`, error);
      setOrderError(error.message || 'Failed to place your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="saree-cart-page-wrapper">
      <div className="saree-cart-container">
        <div className="saree-cart-header">
          <h1>SHOPPING CART</h1>
        </div>
        
        {cart.length === 0 ? (
          <div className="saree-cart-empty">
            <i className="fi fi-rr-shopping-cart"></i>
            <h3>Your Cart is Empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/product" className="saree-continue-shopping">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="saree-cart-content">
            <div className="saree-cart-items-container">
              <div className="saree-cart-items-header">
                <span className="saree-product-col">Product</span>
                <span className="saree-price-col">Price</span>
                <span className="saree-quantity-col">Quantity</span>
                <span className="saree-subtotal-col">Subtotal</span>
                <span className="saree-action-col"></span>
              </div>
              
              <div className="saree-cart-items">
                {cart.map((item) => (
                  <div className="saree-cart-item" key={item.id}>
                    <div className="saree-product-info">
                      <div className="saree-product-image">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="saree-img"
                          onError={(e) => { e.target.src = "/1.webp"; }}
                        />
                      </div>
                      <div className="saree-product-details">
                        <h3>{item.name}</h3>
                        <div className="saree-product-meta">
                          {item.material && <p className="saree-item-material">Material: {item.material}</p>}
                          {item.color && (
                            <p className="saree-item-color">
                              Color: 
                              <span 
                                className="saree-color-dot" 
                                style={{backgroundColor: item.color.toLowerCase()}}
                              ></span>
                              {item.color}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="saree-item-price">
                      <p>{formatPrice(item.price)}</p>
                      {item.discount_percentage > 0 && (
                        <div className="saree-price-discount">
                          <span className="saree-original-price">
                            {formatPrice(item.originalPrice)}
                          </span>
                          <span className="saree-discount-badge">
                            {item.discount_percentage}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="saree-item-quantity">
                      <div className="saree-quantity-control">
                        <button 
                          className="saree-quantity-btn"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <i className="fi fi-rr-minus-small"></i>
                        </button>
                        <span className="saree-quantity-value">{item.quantity}</span>
                        <button 
                          className="saree-quantity-btn"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <i className="fi fi-rr-plus-small"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="saree-item-subtotal">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    
                    <div className="saree-item-actions">
                      <button 
                        className="saree-remove-item"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remove item"
                      >
                        <i className="fi fi-rr-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="saree-cart-actions">
                <div className="saree-cart-left-actions">
                  <Link to="/product" className="saree-continue-shopping-link">
                    <i className="fi fi-rr-arrow-left"></i> Continue Shopping
                  </Link>
                </div>
                <div className="saree-cart-right-actions">
                  <button 
                    className="saree-clear-cart-button"
                    onClick={handleClearCart}
                    disabled={isProcessing}
                  >
                    <i className="fi fi-rr-broom"></i> Clear Cart
                  </button>
                </div>
              </div>
            </div>
            
            <div className="saree-cart-checkout-container">
              <div className="saree-cart-summary">
                <h3>ORDER SUMMARY</h3>
                
                <div className="saree-summary-row">
                  <p>Items ({cart.reduce((count, item) => count + item.quantity, 0)}):</p>
                  <p>{formatPrice(subtotal)}</p>
                </div>
                
                <div className="saree-summary-row saree-discount-row">
                  <p>Discount:</p>
                  <p>-{formatPrice(discount)}</p>
                </div>
                
                <div className="saree-summary-row saree-shipping-row">
                  <p>Shipping:</p>
                  <p>{formatPrice(0)}</p>
                </div>
                
                <div className="saree-promo-code-section">
                  <form onSubmit={applyPromoCode}>
                    <div className="saree-promo-input-wrapper">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={isProcessing}
                        className="saree-promo-input"
                      />
                      <button 
                        type="submit" 
                        disabled={isProcessing || !promoCode}
                        className="saree-apply-promo-btn"
                      >
                        {isProcessing ? (
                          <i className="fi fi-rr-spinner saree-loading-spinner"></i>
                        ) : 'Apply'}
                      </button>
                    </div>
                  </form>
                  {promoError && <p className="saree-promo-error">{promoError}</p>}
                  {promoSuccess && <p className="saree-promo-success">{promoSuccess}</p>}
                </div>
                
                <div className="saree-summary-total">
                  <p>Total:</p>
                  <p>{formatPrice(total)}</p>
                </div>
                
                {orderError && (
                  <div className="saree-order-error">
                    <i className="fi fi-rr-exclamation-triangle"></i>
                    {orderError}
                  </div>
                )}
                
                <button 
                  className={`saree-checkout-btn ${isProcessing ? 'saree-processing' : ''}`}
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processing <i className="fi fi-rr-spinner saree-loading-spinner"></i></>
                  ) : (
                    <>Place Order <i className="fi fi-rr-angle-right"></i></>
                  )}
                </button>          
                <div className="saree-cart-additional-info">
                  <p>
                    <i className="fi fi-rr-shield-check"></i>
                    Secure Checkout
                  </p>
                  <p>
                    <i className="fi fi-rr-truck-side"></i>
                    Free Shipping on Orders over LKR 5,000
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;