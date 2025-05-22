import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderPage.css';

const OrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !token) {
        alert('Please log in to view your orders.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleDeleteOrder = async (orderId, orderCreatedAt) => {
    const now = new Date();
    const orderDate = new Date(orderCreatedAt);
    const hoursDiff = (now - orderDate) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      alert("It's too late, we cannot delete it.");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete order');
      }

      setOrders(orders.filter((order) => order._id !== orderId));
      alert('Order deleted successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="order-page-loading">Loading your orders...</div>;
  }

  if (error) {
    return <div className="order-page-error">Error: {error}</div>;
  }

  return (
    <div className="order-page">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p className="no-orders">You have no orders yet.</p>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="order-row">
                    <td>{order._id}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</td>
                    <td>₹{order.total || 0}</td>
                    <td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                    <td>
                      <div className="order-actions">
                        <button
                          className="btn-details"
                          onClick={() => toggleOrderDetails(order._id)}
                        >
                          {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteOrder(order._id, order.createdAt)}
                        >
                          Delete Order
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr className="order-details-row">
                      <td colSpan="5">
                        <div className="order-details">
                          <h4>Order Details</h4>
                          <table className="items-table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.productId?.name || 'Product'}</td>
                                  <td>{item.quantity || 0}</td>
                                  <td>₹{item.price || 0}</td>
                                  <td>₹{(item.price || 0) * (item.quantity || 0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="order-total">Total: ₹{order.total || 0}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderPage;