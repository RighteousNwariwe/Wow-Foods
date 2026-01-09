import React, { useState } from 'react';
import './Catering.css';

const Catering = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    eventType: '',
    eventDate: '',
    numberOfGuests: '',
    location: '',
    specialRequirements: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to a backend API
    console.log('Catering request submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        eventType: '',
        eventDate: '',
        numberOfGuests: '',
        location: '',
        specialRequirements: ''
      });
    }, 3000);
  };

  return (
    <div className="catering-page">
      <div className="container">
        <div className="page-header">
          <h1>Catering Services</h1>
          <p>Let Woow Foods cater your next event, workshop, or gathering</p>
        </div>

        <div className="catering-content">
          <div className="catering-info">
            <h2>Why Choose Woow Foods Catering?</h2>
            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon">🎉</div>
                <h3>CPUT Events</h3>
                <p>We regularly cater for CPUT workshops, conferences, and events throughout the week.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🌙</div>
                <h3>Weekend Catering</h3>
                <p>Available for external events and organizations around Cape Town during weekends.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">👥</div>
                <h3>On-Site Staff</h3>
                <p>We provide on-site staff during events to ensure smooth service and customer satisfaction.</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🍽️</div>
                <h3>Customizable Menus</h3>
                <p>Tailored menus to suit your event size, budget, and dietary requirements.</p>
              </div>
            </div>

            <div className="catering-details">
              <h2>What We Offer</h2>
              <ul>
                <li>Full catering services for events of all sizes</li>
                <li>Traditional Cape Town favorites (kotas, gatsbys, vetkoeks, etc.)</li>
                <li>Beverages and refreshments</li>
                <li>Professional service staff</li>
                <li>Setup and cleanup services</li>
                <li>Flexible pricing based on event requirements</li>
              </ul>
            </div>
          </div>

          <div className="catering-form-section">
            <h2>Request a Quote</h2>
            <p>Fill out the form below and we'll get back to you with a customized quote for your event.</p>

            {submitted ? (
              <div className="success-message">
                <h3>✓ Request Submitted Successfully!</h3>
                <p>We've received your catering request and will contact you shortly with a quote.</p>
              </div>
            ) : (
              <form className="catering-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+27 12 345 6789"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="organization">Organization/Institution</label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="CPUT, UWC, Company Name, etc."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eventType">Type of Event *</label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select event type</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conference</option>
                    <option value="meeting">Meeting</option>
                    <option value="party">Party/Celebration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="eventDate">Event Date *</label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="numberOfGuests">Expected Number of Guests *</label>
                  <input
                    type="number"
                    id="numberOfGuests"
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="e.g., 50"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Event Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Address or venue name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="specialRequirements">Special Requirements or Dietary Needs</label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Any specific dietary requirements, menu preferences, or special instructions..."
                  />
                </div>

                <button type="submit" className="btn btn-primary submit-btn">
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catering;
