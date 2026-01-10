import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { getCartItemCount } = useCart();
  const location = useLocation();
  const cartItemCount = getCartItemCount();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/logo.jpeg" alt="Woow Foods Logo" className="logo-image" />
          <div className="logo-text">
            <h1>Woow Foods</h1>
            <p>Healthy & Affordable Food</p>
          </div>
        </Link>
        
        <nav className="nav">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            Home
          </Link>
          <Link to="/products" className={isActive('/products') ? 'active' : ''}>
            Menu
          </Link>
          <Link to="/catering" className={isActive('/catering') ? 'active' : ''}>
            Catering
          </Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>
            About
          </Link>
          <Link to="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>
            Admin
          </Link>
          <Link to="/cart" className={`cart-link ${isActive('/cart') ? 'active' : ''}`}>
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
