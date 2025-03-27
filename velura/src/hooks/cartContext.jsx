import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Current timestamp and user information
const currentDateTime = 'right now';
const currentUser = 'laserXnext';

// Initial cart state
const initialState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  total: 0,
  lastAdded: null,
  notifications: []
};

// Actions
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const CLEAR_CART = 'CLEAR_CART';
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);
      
      // If item already exists in cart, update quantity
      if (existingItemIndex !== -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        
        console.log(`[${currentDateTime}] ${currentUser}: Updated quantity for "${product.name}" (ID: ${product.id}) to ${updatedItems[existingItemIndex].quantity}`);
        
        // Calculate new totals
        const subtotal = calculateSubtotal(updatedItems);
        const discount = calculateDiscount(subtotal);
        const total = subtotal - discount;
        
        return {
          ...state,
          items: updatedItems,
          itemCount: calculateItemCount(updatedItems),
          subtotal,
          discount,
          total,
          lastAdded: product
        };
      }
      
      // If item is new, add to cart
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.finalPrice || product.price,
        originalPrice: product.price,
        image: product.imageUrl || product.image_url || '/1.webp',
        quantity,
        material: product.material || 'Not specified',
        color: product.color || 'Not specified',
        discount_percentage: product.discount_percentage || 0
      };
      
      console.log(`[${currentDateTime}] ${currentUser}: Added new item "${product.name}" (ID: ${product.id}) to cart`);
      
      const updatedItems = [...state.items, newItem];
      const subtotal = calculateSubtotal(updatedItems);
      const discount = calculateDiscount(subtotal);
      const total = subtotal - discount;
      
      return {
        ...state,
        items: updatedItems,
        itemCount: calculateItemCount(updatedItems),
        subtotal,
        discount,
        total,
        lastAdded: product
      };
    }
    
    case REMOVE_FROM_CART: {
      const { id } = action.payload;
      const updatedItems = state.items.filter(item => item.id !== id);
      
      console.log(`[${currentDateTime}] ${currentUser}: Removed item ID: ${id} from cart`);
      
      const subtotal = calculateSubtotal(updatedItems);
      const discount = calculateDiscount(subtotal);
      const total = subtotal - discount;
      
      return {
        ...state,
        items: updatedItems,
        itemCount: calculateItemCount(updatedItems),
        subtotal,
        discount,
        total
      };
    }
    
    case UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;
      
      // If quantity is 0 or negative, remove the item
      if (quantity <= 0) {
        return cartReducer(state, { 
          type: REMOVE_FROM_CART, 
          payload: { id } 
        });
      }
      
      const updatedItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      
      
      const subtotal = calculateSubtotal(updatedItems);
      const discount = calculateDiscount(subtotal);
      const total = subtotal - discount;
      
      return {
        ...state,
        items: updatedItems,
        itemCount: calculateItemCount(updatedItems),
        subtotal,
        discount,
        total
      };
    }
    
    case CLEAR_CART:
      return {
        ...initialState,
        notifications: state.notifications
      };
      
    case ADD_NOTIFICATION:
      const newNotification = {
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'success',
        timestamp: new Date().toISOString()
      };
      
      return {
        ...state,
        notifications: [...state.notifications, newNotification]
      };
      
    case REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload.id
        )
      };
      
    default:
      return state;
  }
};

// Helper functions
const calculateSubtotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const calculateDiscount = (subtotal) => {
  // Default 10% discount
  return subtotal * 0.1;
};

const calculateItemCount = (items) => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Create context
const CartContext = createContext();

// Context provider component
export const CartProvider = ({ children }) => {
  // Check for cart in localStorage
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log(`[${currentDateTime}] ${currentUser}: Loaded cart from storage with ${parsedCart.itemCount} items`);
        return parsedCart;
      }
    } catch (error) {
      console.error(`[${currentDateTime}] ${currentUser}: Error loading cart from storage:`, error);
    }
    return initialState;
  };
  
  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage());
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state));
    } catch (error) {
      console.error(`[${currentDateTime}] ${currentUser}: Error saving cart to storage:`, error);
    }
  }, [state.items]);
  
  // Auto-remove notifications after 3 seconds
  useEffect(() => {
    if (state.notifications.length > 0) {
      const notificationId = state.notifications[state.notifications.length - 1].id;
      const timer = setTimeout(() => {
        dispatch({
          type: REMOVE_NOTIFICATION,
          payload: { id: notificationId }
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [state.notifications]);
  
  // Add to cart function
  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: ADD_TO_CART,
      payload: { product, quantity }
    });
    
    // Add success notification
    dispatch({
      type: ADD_NOTIFICATION,
      payload: {
        message: `Added ${quantity} ${product.name} to your cart`,
        type: 'success'
      }
    });
  };
  
  // Remove from cart function
  const removeFromCart = (id) => {
    // Find the item to be removed (for notification)
    const item = state.items.find(item => item.id === id);
    
    dispatch({
      type: REMOVE_FROM_CART,
      payload: { id }
    });
    
    if (item) {
      dispatch({
        type: ADD_NOTIFICATION,
        payload: {
          message: `Removed ${item.name} from your cart`,
          type: 'info'
        }
      });
    }
  };
  
  // Update quantity function
  const updateQuantity = (id, quantity) => {
    dispatch({
      type: UPDATE_QUANTITY,
      payload: { id, quantity }
    });
  };
  
  // Clear cart function
  const clearCart = () => {
    dispatch({ type: CLEAR_CART });
    
    dispatch({
      type: ADD_NOTIFICATION,
      payload: {
        message: 'Your cart has been cleared',
        type: 'info'
      }
    });
  };
  
  return (
    <CartContext.Provider
      value={{
        cart: state.items,
        itemCount: state.itemCount,
        subtotal: state.subtotal,
        discount: state.discount,
        total: state.total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        notifications: state.notifications
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};