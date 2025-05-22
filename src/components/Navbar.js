import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const { cart } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">PerfumeShop</Link>
      <div className="navbar-links-container">
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          {user && (
            <li className="navbar-user">
              <span className="user-icon">👤</span>
              <span className="user-name">{user.name}</span>
            </li>
          )}
          <li className="dropdown">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              ⋮ <span className="dropdown-arrow"></span>
            </button>
            {isDropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/products" onClick={toggleDropdown}>Products</Link></li>
                {user ? (
                  <>
                    <li><Link to="/orders" onClick={toggleDropdown}>My Orders</Link></li>
                    <li>
                      <Link to="/cart" className="navbar-cart" onClick={toggleDropdown}>
                        My Cart
                        {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
                      </Link>
                    </li>
                    <li>
                      <button className="logout-button" onClick={() => { handleLogout(); toggleDropdown(); }}>
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" onClick={toggleDropdown}>Login</Link></li>
                    <li><Link to="/signup" onClick={toggleDropdown}>Sign Up</Link></li>
                  </>
                )}
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;