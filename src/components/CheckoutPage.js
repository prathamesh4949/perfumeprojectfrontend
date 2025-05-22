import React, { useState } from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import './CheckoutPage.css';

console.log('Stripe Publishable Key:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51QBIT3Fhq5GgAyUbAzsdaM2f0ZU3GmElTdUOJA4ItBIHcOcTgehGAGybCL9MoNjsDfDS1AGqO0CrJztwKCQbZVos00cOg9SYUk';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const { cart, getTotal } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  console.log('CheckoutPage received cart:', JSON.stringify(cart, null, 2)); // Debug log

  const handleCheckout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    // Retrieve user and token from localStorage
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // Log the raw user string for debugging
    console.log('Raw user string from localStorage:', userString);

    let user;
    try {
      user = userString ? JSON.parse(userString) : null;
    } catch (err) {
      console.error('Error parsing user from localStorage:', err.message);
      user = null;
    }

    // Log the parsed user object
    console.log('Parsed user object:', user);

    if (!user || !token) {
      alert('Please log in to checkout.');
      localStorage.removeItem('user'); // Clear invalid user data
      localStorage.removeItem('token'); // Clear token
      setIsProcessing(false);
      navigate('/login');
      return;
    }

    if (!user._id) {
      console.error('User object does not have _id:', user);
      alert('User data is invalid. Please log in again.');
      localStorage.removeItem('user'); // Clear invalid user data
      localStorage.removeItem('token'); // Clear token
      setIsProcessing(false);
      navigate('/login');
      return;
    }

    if (!cart || cart.length === 0) {
      alert('No items to checkout.');
      setIsProcessing(false);
      return;
    }

    try {
      const cartResponse = await fetch('http://localhost:5000/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: cart }),
      });

      if (!cartResponse.ok) {
        const errorData = await cartResponse.json();
        throw new Error(errorData.message || 'Failed to sync cart with backend');
      }

      const response = await fetch('http://localhost:5000/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, user }),
      });

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        alert('Failed to redirect to checkout. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      alert(err.message || 'Checkout error.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      {!cart || cart.length === 0 ? (
        <p>No items to checkout.</p>
      ) : (
        <>
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            {cart.map((item) => (
              <div key={item._id} className="checkout-item">
                <div className="checkout-item-details">
                  <p>{item.name || 'Unknown Product'}</p>
                  <p>Brand: {item.brand || 'Generic'}</p>
                  <p>Size: {item.size || '100ml'}</p>
                  <p>Quantity: {item.quantity || 1}</p>
                </div>
                <p>₹{(item.price || 0) * (item.quantity || 1)}</p>
              </div>
            ))}
            <h3>Total: ₹{getTotal()}</h3>
          </div>
          <button
            className="btn-confirm"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Confirm Order'}
          </button>
        </>
      )}
    </div>
  );
};

export default CheckoutPage;