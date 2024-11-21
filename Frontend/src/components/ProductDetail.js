import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../Css/ProductDetails.css'; // Import the CSS for styling

const ProductDetails = ({ addToCart }) => {
  const { id } = useParams(); // Get product ID from URL
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch product details
    axios.get(`http://localhost:3001/products/${id}`)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching product:', error);
        setLoading(false);
      });

    // Fetch accessories
    axios.get(`http://localhost:3001/accessories?productId=${id}`)
      .then(response => setAccessories(response.data || []))
      .catch(error => console.error('Error fetching accessories:', error));

    // Fetch reviews
    axios.get(`http://localhost:3001/reviews?productId=${id}`)
      .then(response => setReviews(response.data || []))
      .catch(error => console.error('Error fetching reviews:', error));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found.</div>;

  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.name} has been added to your cart!`);
    navigate('/cart');
  };

  const handleWriteReview = () => {
    navigate(`/write-review/${id}`, { state: { product, productId: id } });
  };

  return (
    <div className="product-details-container">
      {/* Product Information */}
      <div className="product-card">
        <div className="product-card-body">
          <h2 className="product-title">{product.name}</h2>
          <p>{product.description}</p>
          <p className="product-price">Price: ${product.price}</p>
          {product.discount && <p>Discount: ${product.discount}</p>}
          {product.rebate && <p>Rebate: ${product.rebate}</p>}
          {product.warranty && <p>Warranty: Included</p>}
          <button className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button>
          <button className="btn btn-secondary" onClick={handleWriteReview}>Write a Review</button>
        </div>
      </div>

      {/* Accessories */}
      <div className="accessories-section">
        <h3>Accessories</h3>
        {accessories.length > 0 ? (
          <div className="accessories-grid">
            {accessories.map(accessory => (
              <div className="accessory-card" key={accessory.id}>
                <h5>{accessory.name}</h5>
                <p>{accessory.description}</p>
                <p>Price: ${accessory.price}</p>
              </div>
            ))}
          </div>
        ) : <p>No accessories available.</p>}
      </div>

      {/* Customer Reviews */}
      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        {reviews.length > 0 ? (
          <div className="reviews-grid">
            {reviews.map(review => (
              <div className="review-card" key={review._id}>
                <h5>Rating: {review.reviewRating}/5</h5>
                <p><strong>{review.userOccupation}, {review.userAge} years</strong></p>
                <p>{review.reviewText}</p>
                <p>Reviewed on: {new Date(review.reviewDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : <p>No reviews yet. Be the first to write a review!</p>}
      </div>
    </div>
  );
};

export default ProductDetails;
