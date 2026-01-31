import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, placeOrder } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    campus: '',
    address: '',
    deliveryOption: 'pickup', // 'pickup' or 'delivery'
    specialInstructions: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);

  // Check if user is logged in and load their data
  useEffect(() => {
    if (!currentUser) {
      // Redirect to login with return URL
      navigate('/login', {
        state: { from: '/checkout' },
        replace: true
      });
      return;
    }

    // Load user data from Firestore
    const loadUserData = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData(prev => ({
            ...prev,
            name: userData.displayName || '',
            email: currentUser.email || '',
            phone: userData.phoneNumber || '',
            address: userData.location || ''
          }));
        } else {
          // Fallback to basic user data
          setFormData(prev => ({
            ...prev,
            email: currentUser.email || '',
            name: currentUser.displayName || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to basic user data
        setFormData(prev => ({
          ...prev,
          email: currentUser.email || '',
          name: currentUser.displayName || ''
        }));
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [currentUser, navigate]);

  const subtotal = getCartTotal();
  // Delivery fee only applies if delivery is selected AND order is less than R100
  // Only D6 and Mowbray are delivery locations
  const isDeliveryLocation = formData.campus === 'd6' || formData.campus === 'mowbray';
  const deliveryFee = (formData.deliveryOption === 'delivery' && isDeliveryLocation && subtotal < 100) ? 25 : 0;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      // More strict email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        // Check for common email domain issues
        const domain = formData.email.split('@')[1];
        if (!domain || !domain.includes('.')) {
          newErrors.email = 'Please enter a valid email address';
        }
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Validate South African phone number
      // Accepts formats: +27XXXXXXXXX, 0XXXXXXXXX, 27XXXXXXXXX
      const phoneRegex = /^(\+?27|0)[1-9]\d{8}$/;
      const cleanedPhone = formData.phone.replace(/\s|-/g, '');
      if (!phoneRegex.test(cleanedPhone)) {
        newErrors.phone = 'Please enter a valid South African phone number (e.g., +27 12 345 6789 or 012 345 6789)';
      }
    }

    if (!formData.campus) {
      newErrors.campus = 'Please select your campus';
    }

    // Address is required only for delivery
    if (formData.deliveryOption === 'delivery' && !formData.address.trim()) {
      newErrors.address = 'Delivery address is required for delivery orders';
    }

    // Validate delivery location
    if (formData.deliveryOption === 'delivery' && !isDeliveryLocation) {
      newErrors.campus = 'Delivery is only available for D6 and Mowbray campuses';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Place order directly (old payment system)
    try {
      const order = await placeOrder({
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        status: 'confirmed' // Direct confirmation
      });

      setIsSubmitting(false);
      // Redirect to order confirmation directly
      navigate('/order-confirmation', { state: { order } });
    } catch (error) {
      console.error('Error placing order:', error);
      setIsSubmitting(false);

      // More detailed error message
      let errorMessage = 'There was an error placing your order. ';
      if (error.message) {
        errorMessage += error.message;
      } else if (error.code) {
        errorMessage += `Error code: ${error.code}. `;
        if (error.code === 'PERMISSION_DENIED') {
          errorMessage += 'Please check Firebase database permissions.';
        } else if (error.code === 'UNAVAILABLE') {
          errorMessage += 'Database is temporarily unavailable. Please check your internet connection and try again.';
        }
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }

      alert(errorMessage);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart">
            <h1>Your Cart is Empty</h1>
            <p>Add some items to your cart before checkout.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/products')}
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingUserData) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="loading">
            <h1>Loading your information...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-content">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Delivery Information</h2>

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your full name"
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@example.com"
                required
                disabled // Email is disabled as it comes from authenticated user
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
              <small className="form-hint">Email cannot be changed. Contact support if needed.</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="+27 12 345 6789"
                required
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="deliveryOption">Order Type *</label>
              <select
                id="deliveryOption"
                name="deliveryOption"
                value={formData.deliveryOption}
                onChange={handleChange}
                className={errors.deliveryOption ? 'error' : ''}
                required
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
              {errors.deliveryOption && <span className="error-message">{errors.deliveryOption}</span>}
              {formData.deliveryOption === 'delivery' && (
                <p className="form-hint">Delivery is only available for D6 and Mowbray campuses</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="campus">CPUT Campus *</label>
              <select
                id="campus"
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                className={errors.campus ? 'error' : ''}
                required
              >
                <option value="">Select your campus</option>
                <option value="d6">D6 Campus</option>
                <option value="mowbray">Mowbray Campus</option>
              </select>
              {errors.campus && <span className="error-message">{errors.campus}</span>}
            </div>

            {formData.deliveryOption === 'delivery' && (
              <div className="form-group">
                <label htmlFor="address">Delivery Location *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="School building or block (e.g., Engineering Block, Room 201)"
                  rows="3"
                  required
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
            )}

            {formData.deliveryOption === 'pickup' && (
              <div className="form-group">
                <label htmlFor="address">Pickup Location (Optional)</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Specific pickup location or instructions (optional)"
                  rows="3"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                placeholder="Any special delivery instructions or dietary requirements"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : `Place Order - R${total.toFixed(2)}`}
            </button>
          </form>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cartItems.map(item => (
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
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              {formData.deliveryOption === 'delivery' && (
                <>
                  <div className="total-row">
                    <span>Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="free-delivery">Free!</span>
                      ) : (
                        `R${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {subtotal < 100 && deliveryFee > 0 && (
                    <div className="delivery-note">
                      Spend R{(100 - subtotal).toFixed(2)} more for free delivery!
                    </div>
                  )}
                </>
              )}
              <div className="total-row final-total">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
