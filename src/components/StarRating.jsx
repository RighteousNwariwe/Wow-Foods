import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ratingService from '../services/ratingService';
import './StarRating.css';

const StarRating = ({
  productId,
  readonly = false,
  showRating = true
}) => {
  const { currentUser } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();

    // Set up real-time listener for ratings
    const unsubscribe = ratingService.onProductRatingsChange(productId, (data) => {
      setAverageRating(data.averageRating || 0);
      setTotalRatings(data.totalRatings || 0);

      // Load user rating if logged in
      if (currentUser) {
        loadUserRating();
      }
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [productId, currentUser]);

  const loadRatings = async () => {
    try {
      const ratingData = await ratingService.getProductRatings(productId);
      setAverageRating(ratingData.averageRating || 0);
      setTotalRatings(ratingData.totalRatings || 0);

      if (currentUser) {
        const userRatingValue = await ratingService.getUserRating(productId, currentUser.uid);
        setUserRating(userRatingValue);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRating = async () => {
    if (!currentUser) return;

    try {
      const rating = await ratingService.getUserRating(productId, currentUser.uid);
      setUserRating(rating);
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleStarClick = async (starValue) => {
    if (readonly || !currentUser) return;

    try {
      setLoading(true);
      await ratingService.rateProduct(
        productId,
        currentUser.uid,
        starValue,
        currentUser.displayName || currentUser.email.split('@')[0]
      );
      setUserRating(starValue);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = readonly ? averageRating : (hover || userRating || 0);

    for (let i = 1; i <= 5; i++) {
      const starClass = i <= displayRating ? 'star filled' : 'star';

      stars.push(
        <span
          key={i}
          className={starClass}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          title={readonly ? `${averageRating.toFixed(1)} out of 5` : `Rate ${i} star${i > 1 ? 's' : ''}`}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="star-rating">
        <div className="loading">Loading ratings...</div>
      </div>
    );
  }

  return (
    <div className="star-rating">
      <div className="stars">
        {renderStars()}
      </div>
      {showRating && (
        <div className="rating-info">
          <span className="rating-text">
            {averageRating > 0
              ? `${averageRating.toFixed(1)} out of 5`
              : 'Not rated yet'
            }
          </span>
          {totalRatings > 0 && (
            <span className="total-ratings">
              ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
            </span>
          )}
          {currentUser && userRating > 0 && (
            <span className="your-rating">
              <br />
              <small>Your rating: {userRating}.0</small>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;
