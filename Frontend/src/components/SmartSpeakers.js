import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // Import Link for navigation
import axios from 'axios';

const SmartSpeakers = ({ addToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch products for the 'smart speaker' category
    axios.get('http://localhost:3001/products?category=smart speaker')
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
      });
  }, []);

  // Function to handle adding to cart and showing success message
  const handleAddToCart = (product) => {
    addToCart(product);  // Add product to the cart
    alert(`${product.name} has been added to your cart successfully!`);  // Show success message
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Smart Speaker</h2>
      <div className="row">
        {products.map(product => (
          <div className="col-md-4 mb-4" key={product.id}>
            <div className="card h-100 d-flex flex-column"> {/* Add d-flex flex-column */}
              <div className="card-body flex-grow-1" style={{ overflow: 'auto', maxHeight: '300px' }}>  {/* Add flex-grow-1 */}
                <Link to={`/products/${product.id}`} className="card-link" style={{ textDecoration: 'none', color: 'inherit' }}> {/* Remove underline and preserve text color */}
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">{product.description}</p>
                  <p className="card-text"><strong>Price:</strong> ${product.price}</p>
                  {/* <p className="card-text"><strong>Accessories:</strong> {product.accessories}</p> */}
                </Link>
              </div>
              <div className="card-footer bg-white border-0">  {/* Footer to keep button in place */}
                <button 
                  className="btn btn-primary w-100"
                  onClick={() => handleAddToCart(product)}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartSpeakers;