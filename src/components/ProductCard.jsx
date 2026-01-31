import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import ratingService from '../services/ratingService';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [productRating, setProductRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductRatings();
  }, [product.id, currentUser]);

  const loadProductRatings = async () => {
    try {
      setLoading(true);
      const ratingData = await ratingService.getProductRatings(product.id);
      setProductRating(ratingData.averageRating || 0);

      if (currentUser) {
        const userProductRating = await ratingService.getUserRating(product.id, currentUser.uid);
        setUserRating(userProductRating);
      }
    } catch (error) {
      console.error('Error loading product ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleRatingChange = async (productId, newRating) => {
    if (!currentUser) {
      alert('Please login to rate products');
      return;
    }

    try {
      const ratingData = await ratingService.rateProduct(
        productId,
        currentUser.uid,
        newRating,
        currentUser.displayName || currentUser.email.split('@')[0]
      );

      setProductRating(ratingData.averageRating);
      setUserRating(newRating);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating. Please try again.');
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        {!product.inStock && (
          <div className="out-of-stock">Out of Stock</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        {/* Star Rating */}
        <div className="product-rating">
          {loading ? (
            <div className="rating-loading">Loading rating...</div>
          ) : (
            <StarRating
              productId={product.id}
              initialRating={userRating || productRating}
              onRatingChange={handleRatingChange}
              readonly={!currentUser}
              showRating={true}
            />
          )}
        </div>

        <div className="product-footer">
          <span className="product-price">R{product.price.toFixed(2)}</span>
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
