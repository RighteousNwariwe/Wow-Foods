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
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get existing orders from Firebase
    const allOrders = await getAllOrders();
    
    // Filter orders from today only
    const todayOrders = allOrders.filter(order => {
      if (!order.date && !order.createdAt) return false;
      const orderDate = new Date(order.date || order.createdAt).toISOString().split('T')[0];
      return orderDate === todayStr;
    });
    
    // Generate order number - this will be the next number (0-indexed)
    // e.g., if 3 orders exist today (0, 1, 2), the next will be 3
    const orderNumber = todayOrders.length;
    
    // Format: YYYYMMDD-XXX (e.g., 20240115-000, 20240115-001, etc.)
    const dateStr = todayStr.replace(/-/g, '');
    return `${dateStr}-${String(orderNumber).padStart(3, '0')}`;
  };

  const placeOrder = async (orderData) => {
    // Generate order number BEFORE creating the order to ensure correct incrementing
    const orderId = await generateOrderNumber();
    
    // Use total from orderData if provided (includes delivery fee), otherwise use cart total
    const orderTotal = orderData.total !== undefined ? orderData.total : getCartTotal();
    const order = {
      id: orderId,
      items: [...cartItems],
      subtotal: orderData.subtotal !== undefined ? orderData.subtotal : getCartTotal(),
      deliveryFee: orderData.deliveryFee !== undefined ? orderData.deliveryFee : 0,
      total: orderTotal,
      ...orderData,
      date: new Date().toISOString(),
      status: 'pending',
      verified: false,
      verifiedAt: null
    };
    
    // Save to Firebase
    const saved = await saveOrderToFirebase(order);
    if (!saved) {
      console.error('Failed to save order to Firebase');
      // Still return order for local use, but show error
    }
    
    // Update local state (will be synced via real-time listener)
    setOrders(prevOrders => [order, ...prevOrders]);
    
    clearCart();
    return order;
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
