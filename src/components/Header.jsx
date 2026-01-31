import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { getCartItemCount } = useCart();
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cartItemCount = getCartItemCount();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/logo.jpeg" alt="Wow Foods Logo" className="logo-image" />
          <div className="logo-text">
            <h1>Wow Foods</h1>
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
          <Link to="/track-order" className={isActive('/track-order') ? 'active' : ''}>
            Track Order
          </Link>

          {/* Admin link - only visible to admin users */}
          {isAdmin && (
            <Link to="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>
              Admin
            </Link>
          )}

          <Link to="/cart" className={`cart-link ${isActive('/cart') ? 'active' : ''}`}>
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>

          {/* User authentication section */}
          {currentUser ? (
            <div className="user-menu">
              <button onClick={handleProfileClick} className="profile-button">
                <span className="user-name">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </span>
                <img
                  src={currentUser.photoURL || '/default-avatar.png'}
                  alt="Profile"
                  className="user-avatar"
                />
              </button>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
