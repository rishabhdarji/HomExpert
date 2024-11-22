import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation


const Service = () => {
  const navigate = useNavigate();

  const handleSearchReviews = () => {
    navigate('/search-reviews'); // Replace with the actual route for search reviews
  };

  const handleRecommendProduct = () => {
    navigate('/recommend-product'); // Replace with the actual route for product recommendations
  };

  return (
    <div className="service-container">
      <h1>Service Page</h1>
      <div className="button-container">
        <button className="btn btn-primary" onClick={handleSearchReviews}>
          Search Reviews
        </button>
        <button className="btn btn-secondary" onClick={handleRecommendProduct}>
          Recommend Product
        </button>
      </div>
    </div>
  );
};

export default Service;
