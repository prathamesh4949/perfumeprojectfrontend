import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { CartProvider } from './components/CartContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ProductGallery from './components/ProductGallery';
import ProductDetails from './components/ProductDetails';
import Login from './components/Login';
import SignUp from './components/SignUp';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import Success from './components/Success';
import OrderPage from './components/OrderPage';

const App = () => {
  console.log('App rendered with CartProvider');
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductGallery />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<Success />} />
          <Route path="/orders" element={<OrderPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;