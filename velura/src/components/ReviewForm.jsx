import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Rating from './Rating';
import '../css/review-form.css';

const ReviewForm = ({ productId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please enter a review comment');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const reviewData = {
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        name: name.trim() || 'Anonymous',
        date: new Date().toISOString()
      };
      
      await onSubmit(reviewData);
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setName('');
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Review submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Write a Review</h3>
      
      <div className="form-group">
        <label>Rating</label>
        <Rating 
          value={rating} 
          onChange={setRating} 
          size="large" 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="review-title">Review Title</label>
        <input
          type="text"
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="review-comment">Your Review</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike about this product?"
          rows={4}
          required
          maxLength={1000}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="review-name">Your Name</label>
        <input
          type="text"
          id="review-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anonymous"
        />
      </div>
      
      {error && <div className="review-error">{error}</div>}
      
      <div className="review-form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>Submitting <i className="fi fi-rr-spinner loading-spinner"></i></>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </form>
  );
};

ReviewForm.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ReviewForm;