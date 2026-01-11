import { ref, set, get, onValue, off, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../config/firebase';

// Save order to Firebase
export const saveOrderToFirebase = async (order) => {
  try {
    if (!database) {
      console.error('Firebase database not initialized');
      throw new Error('Database not initialized');
    }
    
    const orderRef = ref(database, `orders/${order.id}`);
    await set(orderRef, {
      ...order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Order saved successfully to Firebase:', order.id);
    return true;
  } catch (error) {
    console.error('Error saving order to Firebase:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      orderId: order?.id
    });
    throw error; // Re-throw to let caller handle it
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const orderRef = ref(database, `orders/${orderId}`);
    const snapshot = await get(orderRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error getting order from Firebase:', error);
    return null;
  }
};

// Get all orders
export const getAllOrders = async () => {
  try {
    if (!database) {
      console.error('Firebase database not initialized');
      return [];
    }
    
    const ordersRef = ref(database, 'orders');
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
      const orders = snapshot.val();
      return Object.values(orders).sort((a, b) => {
        try {
          const dateA = new Date(a.date || a.createdAt || 0);
          const dateB = new Date(b.date || b.createdAt || 0);
          return dateB - dateA;
        } catch (e) {
          console.warn('Error sorting orders by date:', e);
          return 0;
        }
      });
    }
    return [];
  } catch (error) {
    console.error('Error getting orders from Firebase:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code
    });
    // Return empty array on error so order can still be placed
    return [];
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, verified = null) => {
  try {
    const orderRef = ref(database, `orders/${orderId}`);
    const updates = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (verified !== null) {
      updates.verified = verified;
      if (verified) {
        updates.verifiedAt = new Date().toISOString();
      }
    }
    
    await update(orderRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// Update order with proof of payment
export const updateOrderProof = async (orderId, proofOfPayment) => {
  try {
    const orderRef = ref(database, `orders/${orderId}`);
    await update(orderRef, {
      proofOfPayment,
      proofSubmitted: true,
      proofSubmittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating order proof:', error);
    return false;
  }
};

// Listen to order changes (real-time)
export const subscribeToOrder = (orderId, callback) => {
  const orderRef = ref(database, `orders/${orderId}`);
  
  onValue(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  
  // Return unsubscribe function
  return () => {
    off(orderRef);
  };
};

// Listen to all orders (real-time)
export const subscribeToAllOrders = (callback) => {
  const ordersRef = ref(database, 'orders');
  
  onValue(ordersRef, (snapshot) => {
    if (snapshot.exists()) {
      const orders = snapshot.val();
      const ordersArray = Object.values(orders).sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0);
        const dateB = new Date(b.date || b.createdAt || 0);
        return dateB - dateA;
      });
      callback(ordersArray);
    } else {
      callback([]);
    }
  });
  
  // Return unsubscribe function
  return () => {
    off(ordersRef);
  };
};

// Get orders by email (for user tracking)
export const getOrdersByEmail = async (email) => {
  try {
    const ordersRef = ref(database, 'orders');
    const snapshot = await get(ordersRef);
    if (snapshot.exists()) {
      const orders = snapshot.val();
      const userOrders = Object.values(orders).filter(order => 
        order.email && order.email.toLowerCase() === email.toLowerCase()
      );
      return userOrders.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0);
        const dateB = new Date(b.date || b.createdAt || 0);
        return dateB - dateA;
      });
    }
    return [];
  } catch (error) {
    console.error('Error getting orders by email:', error);
    return [];
  }
};

// Listen to orders by email (real-time)
export const subscribeToOrdersByEmail = (email, callback) => {
  const ordersRef = ref(database, 'orders');
  
  onValue(ordersRef, (snapshot) => {
    if (snapshot.exists()) {
      const orders = snapshot.val();
      const userOrders = Object.values(orders).filter(order => 
        order.email && order.email.toLowerCase() === email.toLowerCase()
      );
      const sortedOrders = userOrders.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0);
        const dateB = new Date(b.date || b.createdAt || 0);
        return dateB - dateA;
      });
      callback(sortedOrders);
    } else {
      callback([]);
    }
  });
  
  // Return unsubscribe function
  return () => {
    off(ordersRef);
  };
};
