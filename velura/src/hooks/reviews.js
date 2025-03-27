const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

// Fetch all reviews for a product
export const getProductReviews = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews?productId=${productId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    throw error;
  }
};

// Submit a new review
export const submitReview = async (reviewData) => {
  // Get the current user ID directly from localStorage without parsing
  const userId = localStorage.getItem('user_id') || null;
  
  // Add the user ID if available
  const reviewWithUser = {
    ...reviewData,
    userId: userId
  };
  
  try {
    // Get auth token
    const token = localStorage.getItem('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewWithUser),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to submit review:', error);
    throw error;
  }
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete review:', error);
    throw error;
  }
};