import React from 'react';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getTotal } = useCart();

  console.log('CartPage received cart:', JSON.stringify(cart, null, 2)); // Debug log

  if (!cart || cart.length === 0) {
    return (
      <div className="cart-empty">
        <p>Your cart is empty.</p>
        <Link to="/products" className="btn-view">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item._id} className="cart-item">
            <img
              src={item.images?.[0] || '/placeholder.jpg'}
              alt={item.name || 'Product'}
              className="cart-item-img"
              onError={(e) => (e.target.src = '/placeholder.jpg')}
            />
            <div className="cart-item-info">
              <h3>{item.name || 'Unknown Product'}</h3>
              <p className="cart-item-price">₹{item.price || 0}</p>
              <p className="cart-item-brand">{item.brand || 'Generic'}</p>
              <p className="cart-item-size">{item.size || '100ml'}</p>
              <div className="quantity-controls">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity || 1}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <p className="cart-item-subtotal">
                Subtotal: ₹{(item.price || 0) * (item.quantity || 1)}
              </p>
              <button
                className="btn-remove"
                onClick={() => removeFromCart(item._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total: ₹{getTotal()}</h3>
        <Link to="/checkout" className="btn-checkout">Proceed to Checkout</Link>
      </div>
    </div>
  );
};

export default CartPage;