import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ 
  productId, 
  initialRating = 0, 
  onRatingChange, 
  readonly = false, 
  showRating = true 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(null);

  const handleStarClick = (starValue) => {
    if (readonly) return;
    
    setRating(starValue);
    setUserRating(starValue);
    
    if (onRatingChange) {
      onRatingChange(productId, starValue);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = userRating || rating;
    
    for (let i = 1; i <= 5; i++) {
      const starClass = i <= (hover || displayRating) ? 'star filled' : 'star';
      
      stars.push(
        <span
          key={i}
          className={starClass}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          ★
        </span>
      );
    }
    
    return stars;
  };

  return (
    <div className="star-rating">
      <div className="stars">
        {renderStars()}
      </div>
      {showRating && (
        <span className="rating-text">
          {userRating || rating > 0 ? `${userRating || rating}.0` : 'Not rated'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
