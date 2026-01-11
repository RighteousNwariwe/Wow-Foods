import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrderById, subscribeToOrder } from '../services/orderService';
import './TrackOrder.css';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previousStatus, setPreviousStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if orderId is in URL params
    const params = new URLSearchParams(window.location.search);
    const urlOrderId = params.get('orderId');
    const urlEmail = params.get('email');
    
    if (urlOrderId) {
      setOrderId(urlOrderId);
      if (urlEmail) {
        setEmail(urlEmail);
        handleTrackOrder(urlOrderId, urlEmail);
      }
    }
  }, []);

  // Subscribe to order changes for real-time updates
  useEffect(() => {
    if (order && order.id) {
      const unsubscribe = subscribeToOrder(order.id, (updatedOrder) => {
        if (updatedOrder) {
          // Check if status changed
          if (previousStatus && previousStatus !== updatedOrder.status) {
            showStatusChangeNotification(updatedOrder);
          }
          setPreviousStatus(updatedOrder.status);
          setOrder(updatedOrder);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [order, previousStatus]);

  const showStatusChangeNotification = (order) => {
    const statusMessages = {
      verified: '✅ Your order has been verified! Payment confirmed.',
      in_preparation: '👨‍🍳 Your order is being prepared!',
      ready_for_collection: '📦 Your order is ready for collection!',
      out_for_delivery: '🚚 Your order is out for delivery!',
      delivered: '🎉 Your order has been delivered!'
    };

    const message = statusMessages[order.status] || 'Your order status has been updated!';
    
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Order Status Update', {
        body: message,
        icon: '/logo.jpeg'
      });
    }
    
    // Also show alert
    alert(message);
  };

  const handleTrackOrder = async (trackOrderId, trackEmail) => {
    if (!trackOrderId || !trackEmail) {
      setError('Please enter both order number and email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const foundOrder = await getOrderById(trackOrderId);
      
      if (!foundOrder) {
        setError('Order not found. Please check your order number.');
        setIsLoading(false);
        return;
      }

      // Verify email matches
      if (foundOrder.email && foundOrder.email.toLowerCase() !== trackEmail.toLowerCase()) {
        setError('Email does not match this order. Please enter the correct email address.');
        setIsLoading(false);
        return;
      }

      setOrder(foundOrder);
      setPreviousStatus(foundOrder.status);
      setError('');
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('An error occurred while tracking your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrackOrder(orderId, email);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    const statusInfo = {
      pending: {
        icon: '⏳',
        label: 'Pending',
        description: 'Your order is pending verification. Please wait for payment confirmation.',
        color: '#ffc107'
      },
      verified: {
        icon: '✅',
        label: 'Verified',
        description: 'Payment verified! Your order is being prepared.',
        color: '#28a745'
      },
      in_preparation: {
        icon: '👨‍🍳',
        label: 'In Preparation',
        description: 'Your order is being prepared. It will be ready soon!',
        color: '#17a2b8'
      },
      ready_for_collection: {
        icon: '📦',
        label: 'Ready for Collection',
        description: 'Your order is ready! Please come to collect it.',
        color: '#ffc107'
      },
      out_for_delivery: {
        icon: '🚚',
        label: 'Out for Delivery',
        description: 'Your order is on the way! Our delivery person will arrive shortly.',
        color: '#007bff'
      },
      delivered: {
        icon: '🎉',
        label: 'Delivered',
        description: 'Your order has been delivered. Enjoy your meal!',
        color: '#28a745'
      }
    };

    return statusInfo[status] || statusInfo.pending;
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="track-order-page">
      <div className="container">
        <h1>📦 Track Your Order</h1>
        
        {!order ? (
          <div className="track-order-form-container">
            <form className="track-order-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="orderId">Order Number</label>
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g., 20240115-000"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  disabled={isLoading}
                />
                <p className="form-hint">Enter the email address you used when placing the order</p>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-track"
                disabled={isLoading}
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
          </div>
        ) : (
          <div className="order-details-container">
            <div className="order-status-card">
              <div className="status-header">
                <div className="status-icon-large" style={{ color: getStatusInfo(order.status).color }}>
                  {getStatusInfo(order.status).icon}
                </div>
                <div>
                  <h2>Order #{order.id}</h2>
                  <p className="order-date">{formatDate(order.date || order.createdAt)}</p>
                </div>
              </div>
              
              <div className="status-info">
                <h3 style={{ color: getStatusInfo(order.status).color }}>
                  {getStatusInfo(order.status).label}
                </h3>
                <p>{getStatusInfo(order.status).description}</p>
              </div>

              {order.verified && order.verifiedAt && (
                <div className="verification-badge">
                  ✅ Payment Verified on {formatDate(order.verifiedAt)}
                </div>
              )}
            </div>

            <div className="order-info-card">
              <h3>Order Details</h3>
              <div className="detail-section">
                <h4>👤 Customer Information</h4>
                <p><strong>Name:</strong> {order.name}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Campus:</strong> {order.campus}</p>
                <p><strong>Address:</strong> {order.address}</p>
              </div>

              <div className="detail-section">
                <h4>🛒 Order Items</h4>
                <div className="items-list">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <span>{item.name} x{item.quantity}</span>
                      <span>R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>💰 Order Summary</h4>
                {order.subtotal !== undefined && (
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>R{order.subtotal.toFixed(2)}</span>
                  </div>
                )}
                {order.deliveryFee !== undefined && (
                  <div className="summary-row">
                    <span>Delivery Fee:</span>
                    <span>
                      {order.deliveryFee === 0 ? 'Free' : `R${order.deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                )}
                <div className="summary-row total-row">
                  <span><strong>Total:</strong></span>
                  <span><strong>R{order.total.toFixed(2)}</strong></span>
                </div>
              </div>

              {order.specialInstructions && (
                <div className="detail-section">
                  <h4>📝 Special Instructions</h4>
                  <p>{order.specialInstructions}</p>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setOrder(null);
                  setOrderId('');
                  setEmail('');
                  setError('');
                }}
              >
                Track Another Order
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
