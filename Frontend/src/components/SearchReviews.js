import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import mojs from '@mojs/core';

const SearchReviews = () => {
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a review query.');
      return;
    }

    setLoading(true); // Start loading spinner

    try {
      const response = await axios.post('http://localhost:3001/search-reviews', { query: searchQuery });
      setResults(response.data.results || []); // Ensure results are set
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const handleRedirect = (productId) => {
    // Navigate to the product page
    navigate(`/products/${productId}`);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '0 20px' }}>
      <h1>Search Reviews</h1>
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
          placeholder="Enter product name or keyword"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginBottom: '10px', // Space between input and button
          }}
        />
        <button
          onClick={handleSearch}
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
          {loading ? 'Searching...' : 'Search Reviews'}
        </button>
      </div>
      {loading && (
        <div id="spinner" style={{ margin: '20px auto', height: '50px' }}></div>
      )}
      <div style={{ marginTop: '30px' }}>
        {results.length === 0 && !loading && (
          <p style={{ color: '#777', fontSize: '18px' }}>
            {searchQuery
              ? 'No reviews found from your search.'
              : 'Search for reviews by entering any keyword you would like to search.'}
          </p>
        )}
        {results.length > 0 && (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {results.map((review, index) => (
              <li
                key={index}
                onClick={() => handleRedirect(review.productId)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  padding: '15px',
                  margin: '10px auto',
                  maxWidth: '600px',
                  textAlign: 'left',
                  backgroundColor: '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
              >
                <strong>Rating:</strong> {review.reviewRating}/5
                <br />
                <small style={{ color: '#555' }}>
                  <strong>Review:</strong> {review.reviewText}
                </small>
                <br />
                <small style={{ color: '#555' }}>
                  <strong>Name:</strong> {review.productModelName}
                </small>
                <br />
                <small style={{ color: '#555' }}>
                  <strong>Category:</strong> {review.productCategory}
                </small>
                <br />
                <small style={{ color: '#999' }}>
                  <strong>Date:</strong> {new Date(review.reviewDate).toLocaleDateString()}
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

export default SearchReviews;
