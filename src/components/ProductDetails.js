import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import './ProductDetails.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        console.log('Product data:', data);
        setProduct(data);
        if (!data?.images?.length) {
          console.warn('No images found in product data');
        }
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Login first to add product to cart');
      navigate('/login');
      return;
    }

    console.log('Add to Cart button clicked for product:', product);
    if (product) {
      try {
        await addToCart(product);
        console.log('Product added to cart:', product);
        navigate('/cart');
      } catch (err) {
        console.error('Error adding to cart:', err.message);
      }
    } else {
      console.error('No product available to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      alert('Login first to proceed to checkout');
      navigate('/login');
      return;
    }

    console.log('Buy Now button clicked for product:', product);
    if (product) {
      try {
        await addToCart(product);
        console.log('Product added to cart for Buy Now:', product);
        navigate('/checkout');
      } catch (err) {
        console.error('Error during Buy Now:', err.message);
      }
    } else {
      console.error('No product available for Buy Now');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review.');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          username: user.username, // Include the username in the review payload
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProduct((prev) => ({
          ...prev,
          reviews: [...prev.reviews, data],
          averageRating: data.averageRating || prev.averageRating,
        }));
        setReviewForm({ rating: 5, comment: '' });
        setReviewError(null);
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError('Error submitting review');
      console.error('Review submission error:', err);
    }
  };

  const calculateRatingDistribution = () => {
    if (!product || !product.reviews || product.reviews.length === 0) {
      return Array(5).fill(0);
    }
    const distribution = Array(5).fill(0);
    product.reviews.forEach((review) => {
      const ratingIndex = Math.floor(review.rating) - 1;
      if (ratingIndex >= 0 && ratingIndex < 5) {
        distribution[ratingIndex]++;
      }
    });
    const totalReviews = product.reviews.length;
    return distribution.map((count) => (count / totalReviews) * 100);
  };

  const ratingDistribution = calculateRatingDistribution();

  if (loading) return <div className="product-loading"><p>Loading product...</p></div>;
  if (error) return <div className="product-error"><p>Error: {error}</p></div>;
  if (!product || !product.images || product.images.length === 0) {
    return <div className="product-error"><p>Product or images not found.</p></div>;
  }

  return (
    <div className="product-details">
      <div className="product-main-section">
        <div className="image-section">
          <div className="main-image-container">
            <Swiper
              modules={[Navigation, Autoplay, Thumbs]}
              navigation
              autoplay={{ delay: 3000, disableOnInteraction: true }}
              thumbs={{ swiper: thumbsSwiper }}
              className="main-swiper"
            >
              {product.images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    className="main-image zoom-on-hover"
                    src={img}
                    alt={`Slide ${index}`}
                    onError={() => console.error('Main image failed to load:', img)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="thumbnail-container">
            <Swiper
              onSwiper={setThumbsSwiper}
              slidesPerView={4}
              spaceBetween={10}
              modules={[Thumbs]}
              className="thumbs-swiper"
            >
              {product.images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    className="thumbnail"
                    src={img}
                    alt={`Thumbnail ${index}`}
                    onError={() => console.error('Thumbnail failed to load:', img)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <div className="product-info">
          <h2>{product.name}</h2>
          <div className="average-rating-container">
            <span className="average-rating">{product.averageRating || 0}</span>
            <div className="rating-stars">
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
            </div>
            <span className="review-count">({product.reviews?.length || 0} reviews)</span>
          </div>
          <p className="price">₹{product.price}</p>
          <p className="description">{product.description}</p>

          <div className="additional-info">
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Gender:</strong> {product.gender}</p>
            <p><strong>Size:</strong> {product.size}</p>
            <p><strong>Notes:</strong> {product.notes}</p>
            <p><strong>Longevity:</strong> {product.longevity}</p>
          </div>

          <div className="button-group">
            <button className="add-to-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className="buy-now" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h3>Customer Reviews & Ratings</h3>
        <div className="ratings-summary">
          <div className="ratings-overview">
            <div className="average-rating-large">{product.averageRating || 0}</div>
            <div className="rating-stars-large">
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
            </div>
            <div className="review-count-large">{product.reviews?.length || 0} reviews</div>
          </div>
          <div className="rating-distribution">
            {ratingDistribution.map((percentage, index) => (
              <div key={index} className="rating-bar">
                <span className="rating-label">{5 - index} star</span>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="rating-percentage">{Math.round(percentage)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="reviews-list">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-header">
                  <div className="user-info">
                    <strong className="username">{review.username}</strong>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => {
                        const starPercentage = Math.min(Math.max((review.rating - i) * 100, 0), 100);
                        return (
                          <div key={i} className="star-container">
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
                    </div>
                    <div className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <p>{review.comment}</p>
                <button className="helpful-button">Helpful?</button>
              </div>
            ))
          ) : (
            <p>No reviews yet. Be the first to review this product!</p>
          )}
        </div>

        <div className="review-form">
          <h4>Write a Review</h4>
          {user ? (
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label htmlFor="rating">Rating (1–5)</label>
                <input
                  type="number"
                  id="rating"
                  min="1"
                  max="5"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="comment">Your Review</label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your thoughts about this product..."
                  required
                />
              </div>
              {reviewError && <div className="error-message">{reviewError}</div>}
              <button type="submit" className="btn-submit-review">
                Submit Review
              </button>
            </form>
          ) : (
            <p>
              Please <a href="/login">log in</a> to submit a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;