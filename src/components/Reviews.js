import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ user: '', comment: '', rating: 5 });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/reviews/${productId}`)
      .then(res => setReviews(res.data));
  }, [productId]);

  const handleSubmit = e => {
    e.preventDefault();
    axios.post(`http://localhost:5000/api/reviews/${productId}`, form)
      .then(res => setReviews([...reviews, res.data]));
  };

  return (
    <div className="reviews">
      <h3>Reviews</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} required />
        <textarea placeholder="Comment" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} required />
        <input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} />
        <button type="submit">Submit</button>
      </form>
      {reviews.map(r => (
        <div key={r._id}>
          <strong>{r.user}</strong> ({r.rating}/5): {r.comment}
        </div>
      ))}
    </div>
  );
};

export default Reviews;
