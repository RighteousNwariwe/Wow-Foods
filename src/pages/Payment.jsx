import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import './Payment.css';

const Payment = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { order } = location.state || {};

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/payment' } });
      return;
    }

    if (!order) {
      navigate('/cart');
      return;
    }

    setLoading(false);
  }, [currentUser, order, navigate]);

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `WF-${timestamp}-${randomStr}`.toUpperCase();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Format card number (add spaces every 4 digits)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').substring(0, 16);
      formattedValue = formattedValue.replace(/(.{4})/g, '$1 ').trim();
    }
    
    // Format expiry date (MM/YY)
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
      if (formattedValue.length >= 3) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
    }
    
    // Format CVV (numbers only, max 4 digits)
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePayment = () => {
    const newErrors = {};

    // Card number validation (16 digits)
    const cardNumberDigits = paymentData.cardNumber.replace(/\s/g, '');
    if (!cardNumberDigits || cardNumberDigits.length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    // Card name validation
    if (!paymentData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }

    // Expiry date validation (MM/YY format)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    } else {
      // Check if card is not expired
      const [month, year] = paymentData.expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiry < now) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation (3-4 digits)
    const cvvLength = paymentData.cvv.length;
    if (!paymentData.cvv || cvvLength < 3 || cvvLength > 4) {
      newErrors.cvv = 'Please enter a valid CVV (3-4 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulatePaymentProcessing = async () => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate payment success (90% success rate for demo)
    return Math.random() > 0.1;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validatePayment()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      const paymentSuccessful = await simulatePaymentProcessing();

      if (!paymentSuccessful) {
        throw new Error('Payment declined. Please check your card details and try again.');
      }

      // Generate order ID
      const orderId = generateOrderId();

      // Update order in Firestore with payment confirmation
      const orderRef = doc(firestore, 'orders', order.id);
      await updateDoc(orderRef, {
        orderId: orderId,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        paymentDate: new Date().toISOString(),
        confirmedAt: new Date().toISOString()
      });

      // Clear cart
      localStorage.removeItem('cartItems');

      // Redirect to order confirmation with order ID
      navigate('/order-confirmation', { 
        state: { 
          order: { 
            ...order, 
            orderId: orderId, 
            status: 'confirmed',
            paymentStatus: 'paid'
          } 
        } 
      });

    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ 
        general: error.message || 'Payment failed. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="loading">
            <h1>Loading payment information...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="error-message">
            <h1>Order Not Found</h1>
            <p>Please start your order again.</p>
            <button onClick={() => navigate('/cart')}>
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <h1>Secure Payment</h1>
        
        <div className="payment-content">
          <div className="payment-form-section">
            <form onSubmit={handlePayment} className="payment-form">
              <h2>Payment Details</h2>
              
              {errors.general && (
                <div className="error-message general-error">
                  {errors.general}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="cardNumber">Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleInputChange}
                  className={errors.cardNumber ? 'error' : ''}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
                {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="cardName">Cardholder Name *</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={paymentData.cardName}
                  onChange={handleInputChange}
                  className={errors.cardName ? 'error' : ''}
                  placeholder="John Doe"
                  required
                />
                {errors.cardName && <span className="error-message">{errors.cardName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date *</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleInputChange}
                    className={errors.expiryDate ? 'error' : ''}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                  {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handleInputChange}
                    className={errors.cvv ? 'error' : ''}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                  {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="saveCard"
                    checked={paymentData.saveCard}
                    onChange={handleInputChange}
                  />
                  Save card details for future purchases
                </label>
              </div>

              <button
                type="submit"
                className="pay-button"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Processing Payment...
                  </>
                ) : (
                  `Pay R${order.total.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          <div className="order-summary-section">
            <h2>Order Summary</h2>
            <div className="order-items">
              {order.items?.map(item => (
                <div key={item.id} className="order-item">
                  <div className="order-item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="item-total">R{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>R{order.subtotal?.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="total-row">
                  <span>Delivery Fee</span>
                  <span>R{order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="total-row final-total">
                <span>Total</span>
                <span>R{order.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="security-info">
              <h3>Secure Payment</h3>
              <ul>
                <li>🔒 SSL encrypted connection</li>
                <li>🛡️ PCI DSS compliant</li>
                <li>🔐 Your card details are secure</li>
                <li>✅ No card details stored on our servers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
