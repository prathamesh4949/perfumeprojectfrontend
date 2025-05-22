import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleShopNow = () => {
    navigate('/products');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload(); // Refresh to update UI
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        {/* Background Video */}
        <video autoPlay loop muted playsInline className="background-video">
          <source
            src="https://ombrelamar.com/wp-content/uploads/2024/12/Lamis-3840x2160-1.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div className="overlay"></div>

        {/* Hero Content */}
        <div className="hero-content">
          <h1>Welcome to Perfume Paradise</h1>
          <p>Discover the essence of luxury and elegance</p>
          <button onClick={handleShopNow}>Shop Now</button>
        </div>
      </div>

      {/* Offers Section */}
      <div className="offers-section">
        <h2>🌟 Special Offers</h2>
        <ul>
          <li>🔥 20% off on your first purchase</li>
          <li>🎁 Free shipping on orders above ₹1500</li>
          <li>💖 Buy 2 Get 1 Free on select perfumes</li>
        </ul>
      </div>

      {/* Auth Links */}
      <div className="auth-links">
        {user ? (
          <>
            <h3>👋 Welcome, {user.name}!</h3>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <h3>Already have an account?</h3>
            <a href="/login">Login</a> | <a href="/signup">Sign Up</a>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
