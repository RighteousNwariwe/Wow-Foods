import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { updateOrderProof } from '../services/orderService';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const order = location.state?.order;
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setProofOfPayment(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatOrderSummary = () => {
    const itemsList = order.items.map(item => 
      `• ${item.name} x${item.quantity} - R${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const subtotalLine = order.subtotal !== undefined ? `Subtotal: R${order.subtotal.toFixed(2)}` : '';
    const deliveryLine = order.deliveryFee !== undefined 
      ? `Delivery Fee: ${order.deliveryFee === 0 ? 'Free!' : `R${order.deliveryFee.toFixed(2)}`}`
      : '';

    return `📦 NEW ORDER RECEIVED

Order Number: #${order.id}
Date: ${formatDate(order.date)}

👤 Customer Details:
Name: ${order.name}
Email: ${order.email}
Phone: ${order.phone}
Campus: ${order.campus}
Address: ${order.address}
${order.specialInstructions ? `Special Instructions: ${order.specialInstructions}` : ''}

🛒 Order Items:
${itemsList}

💰 Order Summary:
${subtotalLine ? subtotalLine + '\n' : ''}${deliveryLine ? deliveryLine + '\n' : ''}Total Amount: R${order.total.toFixed(2)}

Status: ${order.status.toUpperCase()}`;
  };

  const sendViaWhatsApp = () => {
    if (!proofOfPayment) {
      alert('Please upload proof of payment first');
      return;
    }
    
    const message = formatOrderSummary() + '\n\n📎 Proof of payment image is ready. Please attach it manually after sending this message.';
    const whatsappNumber = '0680022727';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    setTimeout(() => {
      alert(
        'WhatsApp opened with your order details.\n\n' +
        'IMPORTANT: Please attach the proof of payment image:\n' +
        '1. Click the attachment icon (📎) in WhatsApp\n' +
        '2. Select "Photo" or "Gallery"\n' +
        '3. Select the proof of payment image\n' +
        '4. Send the message'
      );
      setSubmitted(true);
    }, 500);
  };

  const sendViaEmail = async () => {
    if (!proofOfPayment) {
      alert('Please upload proof of payment first');
      return;
    }
    
    setIsSubmitting(true);
    
    const subject = encodeURIComponent(`New Order #${order.id} - Woow Foods`);
    const body = encodeURIComponent(
      formatOrderSummary() + 
      '\n\nPlease attach the proof of payment image to this email.'
    );
    
    // Create mailto link
    const mailtoLink = `mailto:righteouonyedi@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    // Provide instructions
    setTimeout(() => {
      setIsSubmitting(false);
      alert(
        'Email client opened with your order details.\n\n' +
        'IMPORTANT: Please attach the proof of payment image:\n' +
        '1. Click "Attach" or the paperclip icon\n' +
        '2. Select the proof of payment image\n' +
        '3. Send the email\n\n' +
        'If you need to download the image first, use the "Download Proof" button.'
      );
      setSubmitted(true);
    }, 500);
  };

  const downloadProofImage = () => {
    if (!proofOfPayment) return;
    
    const link = document.createElement('a');
    link.href = proofPreview;
    link.download = `proof-payment-order-${order.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitProof = async () => {
    if (!proofOfPayment) {
      alert('Please upload proof of payment first');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format order summary
      const orderSummary = formatOrderSummary();
      
      // Save proof to Firebase
      await updateOrderProof(order.id, proofPreview);
      
      // Open WhatsApp with order summary
      const whatsappNumber = '0680022727';
      const encodedMessage = encodeURIComponent(
        orderSummary + 
        '\n\n📎 Proof of payment image is ready. Please attach it manually after sending this message.'
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
      
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Show instructions
      setTimeout(() => {
        alert(
          'WhatsApp opened with your order details.\n\n' +
          'IMPORTANT: Please attach the proof of payment image manually:\n' +
          '1. Click the attachment icon (📎) in WhatsApp\n' +
          '2. Select "Photo" or "Gallery"\n' +
          '3. Select the proof of payment image\n' +
          '4. Send the message\n\n' +
          'Alternatively, you can download the image and send it via email.'
        );
      }, 500);
    } catch (error) {
      console.error('Error submitting proof:', error);
      alert('There was an error. Please try again.');
      setIsSubmitting(false);
    }
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
              <div className="items-totals">
                {order.subtotal !== undefined && (
                  <div className="items-total-row">
                    <span>Subtotal:</span>
                    <span>R{order.subtotal.toFixed(2)}</span>
                  </div>
                )}
                {order.deliveryFee !== undefined && (
                  <div className="items-total-row">
                    <span>Delivery Fee:</span>
                    <span>
                      {order.deliveryFee === 0 ? (
                        <span className="free-delivery">Free!</span>
                      ) : (
                        `R${order.deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                )}
                <div className="items-total-row final-total-row">
                  <span>Total:</span>
                  <span>R{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="payment-instructions-card">
            <h2>💳 Payment Instructions</h2>
            <div className="payment-details">
              <p className="payment-notice">
                <strong>Please complete your payment via EFT to confirm your order:</strong>
              </p>
              <div className="bank-details">
                <div className="bank-detail-row">
                  <span className="bank-label">Bank:</span>
                  <span className="bank-value">TYMEBANK</span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-label">Account Number:</span>
                  <span className="bank-value">51041664159</span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-label">Reference:</span>
                  <span className="bank-value order-ref">#{order.id}</span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-label">Amount:</span>
                  <span className="bank-value">R{order.total.toFixed(2)}</span>
                </div>
              </div>
              <p className="payment-warning">
                ⚠️ <strong>Important:</strong> Use your order number <strong>#{order.id}</strong> as the payment reference.
              </p>
            </div>
          </div>

          {!submitted && (
            <div className="proof-of-payment-card">
              <h2>📸 Proof of Payment</h2>
              <p className="proof-instructions">
                Please upload a screenshot or photo of your proof of payment. This will be sent to the store owner for verification.
              </p>
              
              <div className="proof-upload-section">
                {!proofPreview ? (
                  <label className="file-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofUpload}
                      className="file-input"
                    />
                    <div className="file-upload-button">
                      <span>📎 Choose File</span>
                      <span className="file-hint">(Max 5MB, Image files only)</span>
                    </div>
                  </label>
                ) : (
                  <div className="proof-preview-section">
                    <div className="proof-preview">
                      <img src={proofPreview} alt="Proof of payment preview" />
                      <button
                        type="button"
                        className="remove-proof-btn"
                        onClick={() => {
                          setProofOfPayment(null);
                          setProofPreview(null);
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <div className="proof-actions">
                      <button
                        type="button"
                        className="btn btn-secondary download-proof-btn"
                        onClick={downloadProofImage}
                      >
                        📥 Download Proof
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary submit-proof-btn"
                        onClick={handleSubmitProof}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Send via WhatsApp'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="send-options">
                <p className="send-options-label">Or send manually:</p>
                <div className="send-buttons">
                  <button
                    type="button"
                    className="btn btn-whatsapp"
                    onClick={sendViaWhatsApp}
                  >
                    📱 Send via WhatsApp
                  </button>
                  <button
                    type="button"
                    className="btn btn-email"
                    onClick={sendViaEmail}
                    disabled={isSubmitting}
                  >
                    ✉️ Send via Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {submitted && (
            <div className="proof-submitted-card">
              <h2>✅ Proof of Payment Submitted</h2>
              <p>Thank you! Your proof of payment has been sent. We'll verify your payment and confirm your order shortly.</p>
            </div>
          )}

          <div className="next-steps">
            <h2>What's Next?</h2>
            <p>Once we receive and verify your payment, we'll start preparing your order.</p>
            <p className="estimated-time">Estimated delivery time: 30-45 minutes after payment confirmation</p>
          </div>
          
          <div className="action-buttons">
            <Link 
              to={`/track-order?orderId=${order.id}&email=${encodeURIComponent(order.email)}`} 
              className="btn btn-primary"
            >
              📦 Track Your Order
            </Link>
            <Link to="/products" className="btn btn-secondary">
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
