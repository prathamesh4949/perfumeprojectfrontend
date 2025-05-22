import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Reviews from '../components/Reviews';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => setProduct(res.data));
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-detail">
      <h2>{product.name}</h2>
      <div className="gallery">
        {product.images.map((img, idx) => (
          <img key={idx} src={img} alt={`Gallery ${idx}`} />
        ))}
      </div>
      <p>{product.description}</p>
      <p>Available Sizes: {product.sizes.join(', ')}</p>
      <p className="price">${product.price}</p>
      <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`)}>Share</button>
      <Reviews productId={id} />
    </div>
  );
};

export default ProductPage;
