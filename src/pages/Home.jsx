import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Home.css';

const Home = () => {
  const { addToCart } = useCart();

  const featuredProducts = [
    {
      id: 1,
      name: 'Kota',
      price: 45,
      image: 'https://www.sandwichtribunal.com/wp-content/uploads/2022/08/IMG_6502.jpg',
      description: 'Traditional Cape Town kotas with chips, polony, Russian, cheese, and egg.'
    },
    {
      id: 4,
      name: 'Gatsby',
      price: 55,
      image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400',
      description: 'Iconic Cape Town gatsby with chips, meat, and sauce in a long roll.'
    },
    {
      id: 5,
      name: 'Classic Burger',
      price: 35,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce.'
    }
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Woow Foods</h1>
          <p className="hero-subtitle">
            Healthy, Affordable & Delicious Food for CPUT Students and Staff
          </p>
          <p className="hero-description">
            Located in CPUT campuses across Cape Town, we bring you fresh, healthier alternatives 
            to street food with exceptional customer service.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">
              View Menu
            </Link>
            <Link to="/catering" className="btn btn-secondary">
              Catering Services
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose Woow Foods?</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🍔</div>
              <h3>Quality Food</h3>
              <p>Fresh ingredients, home-cooked meals, and traditional Cape Town favorites.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💰</div>
              <h3>Affordable Prices</h3>
              <p>Price-sensitive options that won't break your student budget.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⭐</div>
              <h3>Excellent Service</h3>
              <p>Fast, friendly service with a focus on customer satisfaction.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📍</div>
              <h3>Convenient Locations</h3>
              <p>Located in CPUT cafeterias across Cape Town, Bellville, and D6 campuses.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <h2>Featured Items</h2>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <div key={product.id} className="featured-product-card">
                <img src={product.image} alt={product.name} />
                <div className="featured-product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="featured-product-footer">
                    <span className="price">R{product.price.toFixed(2)}</span>
                    <button
                      className="btn btn-primary"
                      onClick={() => addToCart(product, 1)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all">
            <Link to="/products" className="btn btn-outline">
              View All Items
            </Link>
          </div>
        </div>
      </section>

      <section className="operating-hours">
        <div className="container">
          <h2>Operating Hours</h2>
          <div className="hours-content">
            <div className="hours-info">
              <h3>Daily: 7:30 AM - 7:30 PM</h3>
              <p>Weekend catering services available</p>
              <p>Located in CPUT student cafeterias</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
