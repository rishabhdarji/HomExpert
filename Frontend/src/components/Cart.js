import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = ({ cartItems, removeFromCart }) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Your Cart</h2>

      <div className="text-right mb-4">
        <button className="btn btn-success" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>

      <div className="row">
        {cartItems.length === 0 ? (
          <div className="col-md-12 text-center">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div className="col-md-4 mb-4" key={item.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{item.name}</h5>
                  <p className="card-text">{item.description}</p>
                  <p className="card-text"><strong>Price:</strong> ${item.price}</p>
                  <button 
                    className="btn btn-danger"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove from Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="text-right mt-4">
          <button className="btn btn-success" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;