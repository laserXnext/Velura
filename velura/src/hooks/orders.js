const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

// Create a new order from cart items
export const createOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    console.log('Creating order with data:', orderData);
    
    const response = await fetch(`${API_BASE_URL}/api/user/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response data:', errorData);
      throw new Error(errorData?.message || `Error: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Order created successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};