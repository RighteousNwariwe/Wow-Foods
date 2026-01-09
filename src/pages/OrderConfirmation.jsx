import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="no-order">
            <h1>No Order Found</h1>
            <p>It seems there was an issue with your order. Please try again.</p>
            <Link to="/products" className="btn btn-primary">
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
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

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-content">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p className="confirmation-message">
            Thank you for your order. We've received it and will start preparing your food shortly.
          </p>
          
          <div className="order-details">
            <div className="order-info-card">
              <h2>Order Details</h2>
              
              <div className="detail-row">
                <span className="detail-label">Order Number:</span>
                <span className="detail-value">#{order.id}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Order Date:</span>
                <span className="detail-value">{formatDate(order.date)}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value status-pending">{order.status}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Total Amount:</span>
                <span className="detail-value total-amount">R{order.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="delivery-info-card">
              <h2>Delivery Information</h2>
              
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{order.name}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{order.email}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{order.phone}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Campus:</span>
                <span className="detail-value">{order.campus}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{order.address}</span>
              </div>
              
              {order.specialInstructions && (
                <div className="detail-row full-width">
                  <span className="detail-label">Special Instructions:</span>
                  <span className="detail-value">{order.specialInstructions}</span>
                </div>
              )}
            </div>
            
            <div className="items-card">
              <h2>Order Items</h2>
              <div className="order-items-list">
                {order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">Quantity: {item.quantity}</span>
                    </div>
                    <span className="item-price">R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="items-total">
                <span>Total:</span>
                <span>R{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="next-steps">
            <h2>What's Next?</h2>
            <p>We'll send you an email confirmation shortly. Your order will be prepared and delivered to the specified location.</p>
            <p className="estimated-time">Estimated delivery time: 30-45 minutes</p>
          </div>
          
          <div className="action-buttons">
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
