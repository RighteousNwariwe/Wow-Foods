import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore } from '../config/firebase';

class RatingService {
  // Get product ratings
  async getProductRatings(productId) {
    try {
      const ratingDoc = await getDoc(doc(firestore, 'productRatings', productId.toString()));
      
      if (ratingDoc.exists()) {
        return ratingDoc.data();
      }
      
      return {
        productId: productId,
        ratings: [],
        averageRating: 0,
        totalRatings: 0
      };
    } catch (error) {
      console.error('Error getting product ratings:', error);
      return {
        productId: productId,
        ratings: [],
        averageRating: 0,
        totalRatings: 0
      };
    }
  }

  // Add or update a user's rating for a product
  async rateProduct(productId, userId, rating, userName) {
    try {
      const ratingRef = doc(firestore, 'productRatings', productId.toString());
      const ratingDoc = await getDoc(ratingRef);
      
      let ratingData;
      
      if (ratingDoc.exists()) {
        ratingData = ratingDoc.data();
        
        // Check if user has already rated this product
        const existingRatingIndex = ratingData.ratings.findIndex(
          r => r.userId === userId
        );
        
        if (existingRatingIndex !== -1) {
          // Update existing rating
          ratingData.ratings[existingRatingIndex] = {
            userId,
            userName,
            rating,
            timestamp: new Date().toISOString()
          };
        } else {
          // Add new rating
          ratingData.ratings.push({
            userId,
            userName,
            rating,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // Create new rating document
        ratingData = {
          productId,
          ratings: [{
            userId,
            userName,
            rating,
            timestamp: new Date().toISOString()
          }]
        };
      }
      
      // Calculate average rating
      const totalRating = ratingData.ratings.reduce((sum, r) => sum + r.rating, 0);
      ratingData.averageRating = totalRating / ratingData.ratings.length;
      ratingData.totalRatings = ratingData.ratings.length;
      
      // Save to Firestore
      await setDoc(ratingRef, ratingData);
      
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
      const userRating = ratingData.ratings.find(r => r.userId === userId);
      
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
      const ratingRef = doc(firestore, 'productRatings', productId.toString());
      const ratingDoc = await getDoc(ratingRef);
      
      if (!ratingDoc.exists()) {
        return null;
      }
      
      const ratingData = ratingDoc.data();
      ratingData.ratings = ratingData.ratings.filter(r => r.userId !== userId);
      
      // Recalculate average rating
      if (ratingData.ratings.length > 0) {
        const totalRating = ratingData.ratings.reduce((sum, r) => sum + r.rating, 0);
        ratingData.averageRating = totalRating / ratingData.ratings.length;
      } else {
        ratingData.averageRating = 0;
      }
      ratingData.totalRatings = ratingData.ratings.length;
      
      await setDoc(ratingRef, ratingData);
      
      return ratingData;
    } catch (error) {
      console.error('Error removing user rating:', error);
      throw error;
    }
  }
}

export default new RatingService();
