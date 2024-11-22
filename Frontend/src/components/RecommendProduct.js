import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import mojs from '@mojs/core';

const RecommendProduct = () => {
  const [productPreference, setProductPreference] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  let spinner;

  useEffect(() => {
    if (loading) {
      // Initialize spinner using mojs
      spinner = new mojs.Shape({
        parent: '#spinner',
        shape: 'circle',
        stroke: '#007bff',
        strokeDasharray: '125, 125',
        strokeDashoffset: { '0': '-125' },
        strokeWidth: 4,
        fill: 'none',
        left: '50%',
        top: '50%',
        rotate: { '-90': '270' },
        radius: 20,
        isShowStart: true,
        duration: 2000,
        easing: 'ease.in.out',
      }).play();
    }
    return () => {
      if (spinner) spinner.stop(); // Cleanup spinner
    };
  }, [loading]);

  const handleRecommend = async () => {
    if (!productPreference.trim()) {
      alert('Please enter preferences or a category.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/recommend-products', {
        query: productPreference,
      });
      setResults(response.data.recommendations); // Updated to use recommendations array
    } catch (error) {
      console.error('Error fetching product recommendations:', error);
    } finally {
      setLoading(false);
    }
};

  const handleProductClick = (id) => {
    // Navigate to product details
    navigate(`/products/${id}`);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '0 20px' }}>
      <h1>Recommend Product</h1>
      <div
        style={{
          margin: '20px auto',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Enter preferences or category"
          value={productPreference}
          onChange={(e) => setProductPreference(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginBottom: '10px', // Added spacing between input and button
          }}
        />
        <button
          onClick={handleRecommend}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #007bff',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer',
          }}
          disabled={loading}
        >
          {loading ? 'Recommending...' : 'Recommend'}
        </button>
      </div>
      {loading && (
        <div id="spinner" style={{ margin: '20px auto', height: '50px' }}></div>
      )}
      <div style={{ marginTop: '30px' }}>
        {results.length === 0 && !loading && (
          <p style={{ color: '#777', fontSize: '18px' }}>
            {productPreference
              ? 'No recommendations found. Try different preferences.'
              : 'Enter your preferences to get product recommendations.'}
          </p>
        )}
        {results.length > 0 && (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {results.map((product, index) => (
              <li
                key={index}
                onClick={() => handleProductClick(product.id)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  padding: '15px',
                  margin: '10px auto',
                  maxWidth: '600px',
                  textAlign: 'left',
                  backgroundColor: '#f9f9f9',
                  cursor: 'pointer',
                }}
              >
                <strong>Product:</strong> {product.name}
                <br />
                <small style={{ color: '#555' }}>
                  <strong>Description:</strong> {product.description}
                  <br />
                  <strong>Category:</strong> {product.category}
                  <br />
                  <strong>Price:</strong> ${product.price}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() => navigate('/service')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#6c757d',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Back
      </button>
    </div>
  );
};

export default RecommendProduct;
