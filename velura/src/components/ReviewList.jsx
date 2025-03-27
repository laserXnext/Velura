import React from 'react';
import PropTypes from 'prop-types';
import Rating from './Rating';
import '../css/review-list.css';

const ReviewsList = ({ reviews, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="reviews-loading">
        <i className="fi fi-rr-spinner loading-spinner"></i>
        <p>Loading reviews...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="reviews-error">
        <i className="fi fi-rr-exclamation"></i>
        <p>Failed to load reviews. Please try again later.</p>
      </div>
    );
  }
  
  if (!reviews || reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="reviews-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          <div className="review-header">
            <div className="review-author">
              <span className="review-author-name">{review.name || 'Anonymous'}</span>
              <span className="review-date">{formatDate(review.date)}</span>
            </div>
            <Rating value={review.rating} readOnly />
          </div>
          
          {review.title && (
            <h4 className="review-title">{review.title}</h4>
          )}
          
          <p className="review-comment">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

ReviewsList.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      rating: PropTypes.number.isRequired,
      title: PropTypes.string,
      comment: PropTypes.string.isRequired,
      name: PropTypes.string,
      date: PropTypes.string.isRequired
    })
  ),
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

ReviewsList.defaultProps = {
  reviews: [],
  isLoading: false,
  error: ''
};

export default ReviewsList;