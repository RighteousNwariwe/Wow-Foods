import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, placeOrder } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    campus: '',
    address: '',
    specialInstructions: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 100 ? 0 : 25;
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
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
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
    
    // Simulate API call
    setTimeout(() => {
      const order = placeOrder({
        ...formData,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total
      });
      setIsSubmitting(false);
      navigate('/order-confirmation', { state: { order } });
    }, 1500);
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
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
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
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="campus">CPUT Campus *</label>
              <select
                id="campus"
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                className={errors.campus ? 'error' : ''}
              >
                <option value="">Select your campus</option>
                <option value="cape-town">Cape Town Campus</option>
                <option value="bellville">Bellville Campus</option>
                <option value="d6">D6 Campus</option>
                <option value="other">Other Location</option>
              </select>
              {errors.campus && <span className="error-message">{errors.campus}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Delivery Address *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'error' : ''}
                placeholder="Building name, room number, or specific location on campus"
                rows="3"
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
            
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
              {subtotal < 100 && (
                <div className="delivery-note">
                  Spend R{(100 - subtotal).toFixed(2)} more for free delivery!
                </div>
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
