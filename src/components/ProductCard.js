import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img
        src={product.images?.[0] || '/placeholder.jpg'}
        alt={product.name}
        className="product-img"
      />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="desc">{product.description}</p>
        <span className="price">{product.price}</span>
        <div className="review-stars">
          {[...Array(5)].map((_, index) => {
            const rating = product.averageRating || 0;
            const starPercentage = Math.min(Math.max((rating - index) * 100, 0), 100);
            return (
              <div key={index} className="star-container">
                <svg className="star empty" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <svg
                  className="star filled"
                  viewBox="0 0 24 24"
                  style={{ clipPath: `inset(0 ${100 - starPercentage}% 0 0)` }}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
            );
          })}
          <span className="review-count">({product.reviews?.length || 0})</span>
        </div>
        <div className="card-footer">
          <Link to={`/product/${product._id}`} className="btn-view">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;