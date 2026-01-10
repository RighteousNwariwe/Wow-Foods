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
    
    // Get existing orders from localStorage
    const storedOrders = JSON.parse(localStorage.getItem('woowFoodsOrders') || '[]');
    
    // Filter orders from today only
    const todayOrders = storedOrders.filter(order => {
      if (!order.date) return false;
      const orderDate = new Date(order.date).toISOString().split('T')[0];
      return orderDate === todayStr;
    });
    
    // Generate order number - this will be the next number (0-indexed)
    // e.g., if 3 orders exist today (0, 1, 2), the next will be 3
    const orderNumber = todayOrders.length;
    
    // Format: YYYYMMDD-XXX (e.g., 20240115-000, 20240115-001, etc.)
    const dateStr = todayStr.replace(/-/g, '');
    return `${dateStr}-${String(orderNumber).padStart(3, '0')}`;
  };

  const placeOrder = (orderData) => {
    // Generate order number BEFORE creating the order to ensure correct incrementing
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
      status: 'pending',
      verified: false,
      verifiedAt: null
    };
    
    // Update both state and localStorage atomically
    setOrders(prevOrders => {
      const updatedOrders = [order, ...prevOrders];
      localStorage.setItem('woowFoodsOrders', JSON.stringify(updatedOrders));
      return updatedOrders;
    });
    
    clearCart();
    return order;
  };

  const updateOrderStatus = (orderId, status, verified = null) => {
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => {
        if (order.id === orderId) {
          const updated = {
            ...order,
            status,
            ...(verified !== null && {
              verified,
              verifiedAt: verified ? new Date().toISOString() : null
            })
          };
          return updated;
        }
        return order;
      });
      localStorage.setItem('woowFoodsOrders', JSON.stringify(updatedOrders));
      return updatedOrders;
    });
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
    updateOrderStatus
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
