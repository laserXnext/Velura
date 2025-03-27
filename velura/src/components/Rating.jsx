import React from 'react';
import PropTypes from 'prop-types';
import '../css/rating.css';

const Rating = ({ value, onChange, readOnly, size = 'medium' }) => {
  const stars = [1, 2, 3, 4, 5];
  
  const handleClick = (rating) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={`rating-container size-${size}`}>
      {stars.map((star) => (
        <i
          key={star}
          className={`fi ${value >= star ? 'fi-rr-star' : 'fi-rr-star'} 
                      ${value >= star ? 'filled' : 'empty'}
                      ${!readOnly ? 'interactive' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={!readOnly ? () => {} : undefined}
          aria-label={`${star} stars`}
        ></i>
      ))}
      {readOnly && value > 0 && (
        <span className="rating-text">{value.toFixed(1)}</span>
      )}
    </div>
  );
};

Rating.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

Rating.defaultProps = {
  readOnly: false,
  size: 'medium'
};

export default Rating;