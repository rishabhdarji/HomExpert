import React from 'react';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const categories = [
    {
      id: 1,
      name: 'Advanced Smart Doorbells',
      description: 'Upgrade your home security with HD video, motion detection, and two-way audio capabilities.',
      link: '/products/doorbells'
    },
    {
      id: 2,
      name: 'Smart Doorlocks',
      description: 'Smart doorlocks with keyless entry and enhanced encryption for secure and easy access.',
      link: '/products/doorlocks'
    },
    {
      id: 3,
      name: 'Smart Speakers',
      description: 'Voice-activated smart speakers with built-in assistant and superior sound quality.',
      link: '/products/speakers'
    },
    {
      id: 4,
      name: 'Smart Lightings',
      description: 'Customizable smart lighting systems with voice and app control for ambiance creation.',
      link: '/products/lightings'
    },
    {
      id: 5,
      name: 'Video Doorbell Pro',
      description: 'High-end video doorbell with facial recognition, night vision, and cloud storage integration.',
      link: '/products/videodoorbellpro'
    }    
  ];

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Product Categories</h2>
      <div className="row">
        {categories.map(category => (
          <div className="col-md-4 mb-4" key={category.id}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{category.name}</h5>
                <p className="card-text">{category.description}</p>
                {/* Use Link to redirect to respective category */}
                <Link to={category.link} className="btn btn-secondary">
                  Shop {category.name}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;