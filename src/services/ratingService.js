import { ref, set, get, update, remove, onValue } from 'firebase/database';
import { database } from '../config/firebase';

class RatingService {
  // Get product ratings
  async getProductRatings(productId) {
    try {
      const ratingRef = ref(database, `productRatings/${productId}`);
      const snapshot = await get(ratingRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      return {
        productId: productId,
        ratings: {},
        averageRating: 0,
        totalRatings: 0
      };
    } catch (error) {
      console.error('Error getting product ratings:', error);
      return {
        productId: productId,
        ratings: {},
        averageRating: 0,
        totalRatings: 0
      };
    }
  }

  // Add or update a user's rating for a product
  async rateProduct(productId, userId, rating, userName) {
    try {
      const ratingRef = ref(database, `productRatings/${productId}`);
      const snapshot = await get(ratingRef);
      
      let ratingData;
      
      if (snapshot.exists()) {
        ratingData = snapshot.val();
        
        // Update or add user rating
        ratingData.ratings[userId] = {
          userId,
          userName,
          rating,
          timestamp: new Date().toISOString()
        };
      } else {
        // Create new rating document
        ratingData = {
          productId,
          ratings: {
            [userId]: {
              userId,
              userName,
              rating,
              timestamp: new Date().toISOString()
            }
          }
        };
      }
      
      // Calculate average rating
      const ratingsArray = Object.values(ratingData.ratings);
      const totalRating = ratingsArray.reduce((sum, r) => sum + r.rating, 0);
      ratingData.averageRating = totalRating / ratingsArray.length;
      ratingData.totalRatings = ratingsArray.length;
      
      // Save to Realtime Database
      await set(ratingRef, ratingData);
      
      return ratingData;
    } catch (error) {
      console.error('Error rating product:', error);
      throw error;
    }
  }

  // Get a user's rating for a specific product
  async getUserRating(productId, userId) {
    try {
      const ratingData = await this.getProductRatings(productId);
      const userRating = ratingData.ratings[userId];
      
      return userRating ? userRating.rating : 0;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return 0;
    }
  }

  // Get all ratings by a user
  async getUserRatings(userId) {
    try {
      // This would require a more complex query in a real app
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      console.error('Error getting user ratings:', error);
      return [];
    }
  }

  // Delete a user's rating for a product
  async removeUserRating(productId, userId) {
    try {
      const ratingRef = ref(database, `productRatings/${productId}/ratings/${userId}`);
      await remove(ratingRef);
      
      // Recalculate average rating
      const productRef = ref(database, `productRatings/${productId}`);
      const snapshot = await get(productRef);
      
      if (snapshot.exists()) {
        const ratingData = snapshot.val();
        const ratingsArray = Object.values(ratingData.ratings || {});
        
        if (ratingsArray.length > 0) {
          const totalRating = ratingsArray.reduce((sum, r) => sum + r.rating, 0);
          ratingData.averageRating = totalRating / ratingsArray.length;
        } else {
          ratingData.averageRating = 0;
        }
        ratingData.totalRatings = ratingsArray.length;
        
        await update(productRef, {
          averageRating: ratingData.averageRating,
          totalRatings: ratingData.totalRatings
        });
        
        return ratingData;
      }
      
      return null;
    } catch (error) {
      console.error('Error removing user rating:', error);
      throw error;
    }
  }

  // Listen for real-time updates to product ratings
  onProductRatingsChange(productId, callback) {
    const ratingRef = ref(database, `productRatings/${productId}`);
    
    return onValue(ratingRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : {
        productId: productId,
        ratings: {},
        averageRating: 0,
        totalRatings: 0
      };
      callback(data);
    });
  }
}

export default new RatingService();
