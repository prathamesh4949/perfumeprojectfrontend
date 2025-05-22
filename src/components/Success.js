import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import './Success.css';

const Success = () => {
  const { clearCart, setShouldFetchCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);
  const [message, setMessage] = useState('Processing your order...');

  useEffect(() => {
    const saveOrder = async () => {
      if (hasProcessed.current) {
        console.log('Order already processed, skipping.');
        return;
      }

      hasProcessed.current = true;

      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token'); // Removed extra parenthesis

      if (!user || !token) {
        setMessage('Please log in to continue.');
        navigate('/login');
        return;
      }

      console.log('User in Success.js:', user);
      console.log('Token in Success.js:', token);

      const sessionId = new URLSearchParams(location.search).get('session_id');
      if (!sessionId) {
        setMessage('Invalid payment session.');
        navigate('/checkout');
        return;
      }

      try {
        const sessionResponse = await fetch(`http://localhost:5000/api/payment/verify-session/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok) {
          if (sessionResponse.status === 403) {
            setMessage('Session verification failed: Unauthorized access. Please log in again.');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error(sessionData.error || 'Failed to verify payment session');
        }

        const sessionCartItems = JSON.parse(sessionData.metadata.cartItems);
        if (!sessionCartItems || sessionCartItems.length === 0) {
          throw new Error('No items found in payment session.');
        }

        const orderResponse = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: sessionCartItems.map(item => ({
              _id: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
            total: sessionCartItems.reduce((total, item) => total + item.price * item.quantity, 0),
          }),
        });

        const result = await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(result.message || 'Failed to save order');
        }

        setShouldFetchCart(false);
        await clearCart();
        setMessage('Order placed successfully! Thank you for your purchase.');
      } catch (err) {
        console.error('Error saving order:', err);
        setMessage(`Error: ${err.message}`);
        navigate('/checkout');
      }
    };

    saveOrder();
  }, [clearCart, setShouldFetchCart, navigate, location]);

  return (
    <div className="success-page">
      <h2>Payment Successful!</h2>
      <p>{message}</p>
      <button className="btn-continue" onClick={() => navigate('/')}>
        Continue Shopping
      </button>
    </div>
  );
};

export default Success;