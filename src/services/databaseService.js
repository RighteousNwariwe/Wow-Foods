// Firebase Realtime Database Service
import { ref, push, set, get, update, remove, onValue } from 'firebase/database';
import { database } from '../config/firebase';

// Orders Service
export const ordersService = {
  // Create a new order
  async createOrder(orderData) {
    try {
      const ordersRef = ref(database, 'orders');
      const newOrderRef = push(ordersRef);
      const orderId = newOrderRef.key;

      const orderWithId = {
        id: orderId,
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(newOrderRef, orderWithId);
      return orderWithId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get all orders
  async getAllOrders() {
    try {
      const ordersRef = ref(database, 'orders');
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const orders = snapshot.val();
        return Object.keys(orders).map(key => ({
          id: key,
          ...orders[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  // Listen for real-time updates
  onOrdersChange(callback) {
    const ordersRef = ref(database, 'orders');
    return onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const orders = snapshot.val();
        const ordersArray = Object.keys(orders).map(key => ({
          id: key,
          ...orders[key]
        }));
        callback(ordersArray);
      } else {
        callback([]);
      }
    });
  },

  // Update order status
  async updateOrderStatus(orderId, status, additionalData = {}) {
    try {
      const orderRef = ref(database, `orders/${orderId}`);
      await update(orderRef, {
        status,
        ...additionalData,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Delete an order
  async deleteOrder(orderId) {
    try {
      const orderRef = ref(database, `orders/${orderId}`);
      await remove(orderRef);
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};

// Users Service
export const usersService = {
  // Create a new user
  async createUser(userData) {
    try {
      const usersRef = ref(database, 'users');
      const newUserRef = push(usersRef);
      const userId = newUserRef.key;

      const userWithId = {
        id: userId,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(newUserRef, userWithId);
      return userWithId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get all users
  async getAllUsers() {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        return Object.keys(users).map(key => ({
          id: key,
          ...users[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get user by UID
  async getUserByUid(uid) {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const userKey = Object.keys(users).find(key => users[key].uid === uid);

        if (userKey) {
          return { id: userKey, ...users[userKey] };
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by UID:', error);
      return null;
    }
  },

  // Update user
  async updateUser(userId, userData) {
    try {
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUser(userId) {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return { id: userId, ...snapshot.val() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const userRef = ref(database, `users/${userId}`);
      await remove(userRef);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Listen for real-time updates
  onUsersChange(callback) {
    const usersRef = ref(database, 'users');
    return onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        const usersArray = Object.keys(users).map(key => ({
          id: key,
          ...users[key]
        }));
        callback(usersArray);
      } else {
        callback([]);
      }
    });
  }
};

// Menu Service
export const menuService = {
  // Create a new menu item
  async createMenuItem(itemData) {
    try {
      const menuRef = ref(database, 'menu');
      const newItemRef = push(menuRef);
      const itemId = newItemRef.key;

      const itemWithId = {
        id: itemId,
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await set(newItemRef, itemWithId);
      return itemWithId;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  // Get all menu items
  async getAllMenuItems() {
    try {
      const menuRef = ref(database, 'menu');
      const snapshot = await get(menuRef);

      if (snapshot.exists()) {
        const menu = snapshot.val();
        return Object.keys(menu).map(key => ({
          id: key,
          ...menu[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  },

  // Update menu item
  async updateMenuItem(itemId, itemData) {
    try {
      const itemRef = ref(database, `menu/${itemId}`);
      await update(itemRef, {
        ...itemData,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  // Delete menu item
  async deleteMenuItem(itemId) {
    try {
      const itemRef = ref(database, `menu/${itemId}`);
      await remove(itemRef);
      return true;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },

  // Listen for real-time updates
  onMenuChange(callback) {
    const menuRef = ref(database, 'menu');
    return onValue(menuRef, (snapshot) => {
      if (snapshot.exists()) {
        const menu = snapshot.val();
        const menuArray = Object.keys(menu).map(key => ({
          id: key,
          ...menu[key]
        }));
        callback(menuArray);
      } else {
        callback([]);
      }
    });
  }
};
