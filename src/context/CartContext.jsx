import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveOrderToFirebase, getAllOrders, updateOrderStatus as updateOrderStatusFirebase, subscribeToAllOrders } from '../services/orderService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Subscribe to real-time orders updates
  useEffect(() => {
    setIsLoadingOrders(true);
    const unsubscribe = subscribeToAllOrders((ordersData) => {
      setOrders(ordersData);
      setIsLoadingOrders(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const generateOrderNumber = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      console.log('Generating order number for date:', todayStr);
      
      // Get existing orders from Firebase
      const allOrders = await getAllOrders();
      console.log('Total orders in Firebase:', allOrders.length);
      
      // Filter orders from today only
      const todayOrders = allOrders.filter(order => {
        if (!order.date && !order.createdAt) return false;
        try {
          const orderDate = new Date(order.date || order.createdAt).toISOString().split('T')[0];
          return orderDate === todayStr;
        } catch (e) {
          console.warn('Invalid date in order:', order);
          return false;
        }
      });
      
      console.log('Orders from today:', todayOrders.length);
      console.log('Today\'s order IDs:', todayOrders.map(o => o.id));
      
      // Generate order number - this will be the next number (0-indexed)
      // e.g., if 3 orders exist today (0, 1, 2), the next will be 3
      const orderNumber = todayOrders.length;
      
      // Format: YYYYMMDD-XXX (e.g., 20240115-000, 20240115-001, etc.)
      const dateStr = todayStr.replace(/-/g, '');
      const generatedId = `${dateStr}-${String(orderNumber).padStart(3, '0')}`;
      
      console.log('Generated order number:', generatedId);
      return generatedId;
    } catch (error) {
      console.error('Error generating order number:', error);
      // Fallback: use timestamp-based order number if Firebase fails
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const timestamp = Date.now().toString().slice(-6);
      const fallbackId = `${dateStr}-${timestamp}`;
      console.log('Using fallback order number:', fallbackId);
      return fallbackId;
    }
  };

  const placeOrder = async (orderData) => {
    try {
      console.log('Placing order with data:', orderData);
      
      // Generate order number BEFORE creating the order to ensure correct incrementing
      const orderId = await generateOrderNumber();
      console.log('Generated order ID:', orderId);
      
      // Use total from orderData if provided (includes delivery fee), otherwise use cart total
      const orderTotal = orderData.total !== undefined ? orderData.total : getCartTotal();
      const order = {
        id: orderId,
        items: [...cartItems],
        subtotal: orderData.subtotal !== undefined ? orderData.subtotal : getCartTotal(),
        deliveryFee: orderData.deliveryFee !== undefined ? orderData.deliveryFee : 0,
        deliveryOption: orderData.deliveryOption || 'pickup', // Store delivery option
        total: orderTotal,
        ...orderData,
        date: new Date().toISOString(),
        status: 'pending',
        verified: false,
        verifiedAt: null
      };
      
      console.log('Order object created:', order);
      
      // Save to Firebase
      await saveOrderToFirebase(order);
      console.log('Order saved to Firebase successfully');
      
      // Update local state (will be synced via real-time listener)
      setOrders(prevOrders => [order, ...prevOrders]);
      
      clearCart();
      return order;
    } catch (error) {
      console.error('Error in placeOrder:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error; // Re-throw to let Checkout handle it
    }
  };

  const updateOrderStatus = async (orderId, status, verified = null) => {
    // Update in Firebase
    await updateOrderStatusFirebase(orderId, status, verified);
    
    // Local state will be updated via real-time listener
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    placeOrder,
    orders,
    updateOrderStatus,
    isLoadingOrders
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
