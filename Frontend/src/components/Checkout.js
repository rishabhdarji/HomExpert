import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ cartItems }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [creditCard, setCreditCard] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('homeDelivery');
  const [storeLocation, setStoreLocation] = useState('');
  const [storeLocations, setStoreLocations] = useState([]);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [pickupDate, setPickupDate] = useState('');

  const navigate = useNavigate();

  // Fetch store locations from the API
  useEffect(() => {
    fetch('http://localhost:3001/store-locations') // Adjust port as necessary
      .then(response => response.json())
      .then(data => setStoreLocations(data))
      .catch(error => console.error('Error fetching store locations:', error));
  }, []);

  const generateConfirmationNumber = () => {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
  };

  const generateDeliveryDate = () => {
    const today = new Date();
    const deliveryDate = new Date(today.setDate(today.getDate() + 14)); // 2 weeks from today
    return deliveryDate.toDateString();
  };

  const subtotal = cartItems.reduce((total, item) => total + Number(item.price), 0);
  const taxRate = 0.12;
  const estimatedTax = subtotal * taxRate;
  const totalPrice = subtotal + estimatedTax;

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('You must be logged in to place an order.');
      navigate('/login');
      return;
    }

    const confirmationNum = generateConfirmationNumber();
    const deliveryDate = generateDeliveryDate();
    const formattedDeliveryDate = new Date(deliveryDate).toISOString().split('T')[0];

    // Update cartItems to include product_id and quantity
    const updatedCartItems = cartItems.map(item => ({
      product_id: item.id,  // Assuming 'id' is the product_id from the cart item
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1  // Default quantity to 1 if not provided
    }));

    const orderDetails = {
      userId,
      totalPrice: totalPrice.toFixed(2),
      deliveryMethod,
      storeLocation: deliveryMethod === 'inStorePickup' ? storeLocation : null,
      deliveryDate: formattedDeliveryDate,
      cartItems: updatedCartItems, // Pass updated cartItems with product_id and quantity
      address: `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}`,
      creditCard
    };

    // Send order to the server
    fetch('http://localhost:3001/place-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDetails),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Order placed successfully') {
          alert(`Order confirmed! Your confirmation number is ${confirmationNum}`);
          navigate('/');
        } else {
          alert(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error placing order');
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Checkout</h2>

      {/* Display cart items */}
      <div className="row mb-4">
        {cartItems.map(item => (
          <div className="col-md-4 mb-4" key={item.id}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">{item.description}</p>
                <p className="card-text"><strong>Price:</strong> ${item.price}</p>
                <p className="card-text"><strong>Accessories:</strong> {item.accessories}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="card p-3">
        <h5 className="card-title">Order Summary</h5>
        <table className="table">
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td>${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Estimated Tax (12%)</td>
              <td>${estimatedTax.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Total Price</th>
              <th>${totalPrice.toFixed(2)}</th>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Personal Information Form */}
      <form onSubmit={handleCheckout} className="mt-4">
        {/* Customer Info */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Address Info */}
        <div className="mb-3">
          <label htmlFor="street" className="form-label">Street</label>
          <input
            type="text"
            className="form-control"
            id="street"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            required
          />
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="city" className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              id="city"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="state" className="form-label">State</label>
            <input
              type="text"
              className="form-control"
              id="state"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="zipCode" className="form-label">Zip Code</label>
            <input
              type="text"
              className="form-control"
              id="zipCode"
              value={address.zipCode}
              onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Credit Card Info */}
        <div className="mb-3">
          <label htmlFor="creditCard" className="form-label">Credit Card</label>
          <input
            type="text"
            className="form-control"
            id="creditCard"
            value={creditCard}
            onChange={(e) => setCreditCard(e.target.value)}
            required
          />
        </div>

        {/* Delivery Method */}
        <div className="mb-3">
          <label className="form-label">Delivery Method</label>
          <div>
            <input
              type="radio"
              id="homeDelivery"
              name="deliveryMethod"
              value="homeDelivery"
              checked={deliveryMethod === 'homeDelivery'}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            />
            <label htmlFor="homeDelivery" className="ms-2">Home Delivery</label>
          </div>
          <div>
            <input
              type="radio"
              id="inStorePickup"
              name="deliveryMethod"
              value="inStorePickup"
              checked={deliveryMethod === 'inStorePickup'}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            />
            <label htmlFor="inStorePickup" className="ms-2">In-Store Pickup</label>
          </div>
        </div>

        {/* Store Locations Dropdown (for In-Store Pickup) */}
        {deliveryMethod === 'inStorePickup' && (
          <div className="mb-3">
            <label htmlFor="storeLocation" className="form-label">Select Store Location</label>
            <select
              className="form-control"
              id="storeLocation"
              value={storeLocation}
              onChange={(e) => setStoreLocation(e.target.value)}
              required
            >
              <option value="">Select a store</option>
              {storeLocations.map((store) => (
                <option key={store.StoreID} value={store.street}>
                  {store.street}, {store.city}, {store.state} - {store.zip_code}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block">
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;