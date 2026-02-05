import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/databaseService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
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
    saveCard: false,
    paymentProof: null,
    paymentProofPreview: null
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState(null);

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
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');

    // This should be replaced with a proper daily counter from the database
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `WF${dateStr}${randomNum}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{2})/g, '$1/').trim();
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, paymentProof: 'File size must be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentData(prev => ({
          ...prev,
          paymentProof: file,
          paymentProofPreview: reader.result
        }));
        setErrors(prev => ({ ...prev, paymentProof: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPaymentProof = async (file, orderId) => {
    try {
      const storageRef = ref(storage, `payment-proofs/${orderId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentData.paymentProof) {
      newErrors.paymentProof = 'Please upload payment proof';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Generate a temporary order ID for payment proof upload
      const tempOrderId = `TEMP-${Date.now()}`;
      let paymentProofUrl = '';

      // Upload payment proof if provided
      if (paymentData.paymentProof) {
        paymentProofUrl = await uploadPaymentProof(paymentData.paymentProof, tempOrderId);
      }

      // Create payment proof record without order number
      const paymentDataRecord = {
        ...order,
        customerEmail: currentUser.email,
        customerName: currentUser.displayName || currentUser.email.split('@')[0],
        userId: currentUser.uid,
        status: 'pending_payment',
        paymentProof: paymentProofUrl,
        paymentMethod: 'proof_upload',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tempId: tempOrderId
      };

      await ordersService.createOrder(paymentDataRecord);

      setSubmittedOrderId(tempOrderId);
      setShowWhatsAppModal(true);
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit payment proof. Please try again.'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Hello! I've just submitted payment proof for my order #${submittedOrderId}. Please check and confirm my payment. Thank you!`;
    const phoneNumber = '27612345678'; // Replace with actual business WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppModal(false);
    navigate('/order-confirmation', {
      state: {
        order: {
          ...order,
          id: submittedOrderId,
          status: 'pending_payment'
        }
      }
    });
  };

  const handleCloseModal = () => {
    setShowWhatsAppModal(false);
    navigate('/order-confirmation', {
      state: {
        order: {
          ...order,
          id: submittedOrderId,
          status: 'pending_payment'
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading">Loading payment information...</div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <h1>Payment Proof Submission</h1>
          <p>Upload your payment proof and we'll confirm your order</p>
        </div>

        <div className="payment-content">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>R{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="order-total">
              <strong>Total: R{order.total?.toFixed(2)}</strong>
            </div>
          </div>

          <div className="payment-form">
            <h2>Upload Payment Proof</h2>
            <form onSubmit={handleSubmitProof}>
              <div className="form-group">
                <label>Payment Proof *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="paymentProof"
                    accept="image/*,.pdf"
                    onChange={handleProofUpload}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="paymentProof"
                    className="file-upload-label"
                  >
                    {paymentData.paymentProofPreview ? (
                      <img
                        src={paymentData.paymentProofPreview}
                        alt="Payment proof preview"
                        className="proof-preview"
                      />
                    ) : (
                      <div className="upload-placeholder">
                        <span>📷</span>
                        <p>Click to upload payment proof</p>
                        <small>JPG, PNG, PDF (Max 5MB)</small>
                      </div>
                    )}
                  </label>
                </div>
                {errors.paymentProof && (
                  <span className="error">{errors.paymentProof}</span>
                )}
              </div>

              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <button
                type="submit"
                className="submit-proof-btn"
                disabled={isProcessing || !paymentData.paymentProof}
              >
                {isProcessing ? 'Submitting...' : 'Submit Proof of Payment'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Payment Proof Submitted!</h3>
              <button
                onClick={handleCloseModal}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Thank you! Your payment proof has been submitted successfully.</p>
              <p>Order ID: <strong>#{submittedOrderId}</strong></p>
              <p>Would you like to notify us via WhatsApp for faster processing?</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={handleWhatsAppShare}
                className="whatsapp-btn"
              >
                📱 Send WhatsApp Message
              </button>
              <button
                onClick={handleCloseModal}
                className="skip-btn"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
