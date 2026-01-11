import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Wow Foods</h3>
          <p>Healthy, affordable, and delicious food for CPUT students and staff.</p>
          <p>Operating Hours: 7:30 AM - 7:30 PM</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/products">Menu</Link>
          <Link to="/catering">Catering Services</Link>
          <Link to="/about">About Us</Link>
        </div>
        
        <div className="footer-section">
          <h4>Locations</h4>
          <p>CPUT Cape Town Campus</p>
          <p>CPUT Bellville Campus</p>
          <p>CPUT D6 Campus</p>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@woowfoods.co.za</p>
          <p>Phone: +27 (0)21 XXX XXXX</p>
          <div className="social-links">
            <span>Follow us:</span>
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Twitter">Twitter</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Wow Foods. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
