import React, { createContext, useState, useContext } from 'react';

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
  // Initialize orders from localStorage if available
  const [orders, setOrders] = useState(() => {
    try {
      const storedOrders = localStorage.getItem('woowFoodsOrders');
      return storedOrders ? JSON.parse(storedOrders) : [];
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      return [];
    }
  });

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

  const generateOrderNumber = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get existing orders from localStorage or use current orders
    const storedOrders = JSON.parse(localStorage.getItem('woowFoodsOrders') || '[]');
    
    // Filter orders from today
    const todayOrders = storedOrders.filter(order => {
      const orderDate = new Date(order.date).toISOString().split('T')[0];
      return orderDate === todayStr;
    });
    
    // Generate order number (0-indexed for today)
    const orderNumber = todayOrders.length;
    
    // Format: YYYYMMDD-XXX (e.g., 20240115-000)
    const dateStr = todayStr.replace(/-/g, '');
    return `${dateStr}-${String(orderNumber).padStart(3, '0')}`;
  };

  const placeOrder = (orderData) => {
    const orderId = generateOrderNumber();
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
      status: 'pending'
    };
    
    setOrders(prevOrders => {
      const updatedOrders = [order, ...prevOrders];
      // Store in localStorage for order number persistence
      localStorage.setItem('woowFoodsOrders', JSON.stringify(updatedOrders));
      return updatedOrders;
    });
    
    // Also update localStorage
    const storedOrders = JSON.parse(localStorage.getItem('woowFoodsOrders') || '[]');
    storedOrders.unshift(order);
    localStorage.setItem('woowFoodsOrders', JSON.stringify(storedOrders));
    
    clearCart();
    return order;
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
    orders
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
