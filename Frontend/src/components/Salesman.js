import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Salesman = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [newOrder, setNewOrder] = useState({
    user_id: '',
    total_price: '',
    delivery_method: 'homeDelivery',
    store_location: '',
    delivery_date: ''
  });
  const [editOrder, setEditOrder] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchOrders();
  }, []);

  // Fetch all customers
  const fetchCustomers = () => {
    axios.get('http://localhost:3001/customers')
      .then(response => {
        setCustomers(response.data);
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
      });
  };

  // Fetch all orders
  const fetchOrders = () => {
    axios.get('http://localhost:3001/orders')
      .then(response => {
        setOrders(response.data);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      });
  };

  // Handle customer creation
  const handleAddCustomer = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/customers', newCustomer)
      .then(response => {
        alert('Customer created successfully');
        fetchCustomers();
        setNewCustomer({
          name: '',
          email: '',
          password: '',
          role: 'customer'
        });
      })
      .catch(error => {
        console.error('Error creating customer:', error);
      });
  };

  // Handle order creation
  const handleAddOrder = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/orders', newOrder)
      .then(response => {
        alert('Order added successfully');
        fetchOrders();
        setNewOrder({
          user_id: '',
          total_price: '',
          delivery_method: 'homeDelivery',
          store_location: '',
          delivery_date: ''
        });
      })
      .catch(error => {
        console.error('Error adding order:', error);
      });
  };

  // Handle order update
  const handleUpdateOrder = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:3001/orders/${editOrder.id}`, editOrder)
      .then(response => {
        alert('Order updated successfully');
        fetchOrders();
        setEditOrder(null); // Reset the form
      })
      .catch(error => {
        console.error('Error updating order:', error);
      });
  };

  // Handle order deletion
  const handleDeleteOrder = (orderId) => {
    axios.delete(`http://localhost:3001/orders/${orderId}`)
      .then(response => {
        alert('Order deleted successfully');
        fetchOrders();
      })
      .catch(error => {
        console.error('Error deleting order:', error);
      });
  };

  // Handle input change for customers and orders
  const handleInputChange = (e, isOrderEdit = false, isCustomer = false) => {
    const { name, value } = e.target;

    if (isOrderEdit && editOrder) {
      setEditOrder({ ...editOrder, [name]: value });
    } else if (isCustomer) {
      setNewCustomer({ ...newCustomer, [name]: value });
    } else {
      setNewOrder({ ...newOrder, [name]: value });
    }
  };

  return (
    <div className="container mt-5">
      <h1>Salesman Dashboard</h1>

      {/* Add Customer Form */}
      <form onSubmit={handleAddCustomer} className="mb-4">
        <h3>Add New Customer</h3>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Customer Name"
            name="name"
            value={newCustomer.name}
            onChange={(e) => handleInputChange(e, false, true)} // Pass isCustomer as true
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Customer Email"
            name="email"
            value={newCustomer.email}
            onChange={(e) => handleInputChange(e, false, true)} // Pass isCustomer as true
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            name="password"
            value={newCustomer.password}
            onChange={(e) => handleInputChange(e, false, true)} // Pass isCustomer as true
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Customer</button>
      </form>

      {/* Add Order Form */}
      <form onSubmit={handleAddOrder} className="mb-4">
        <h3>Add New Order</h3>
        <div className="mb-3">
          <select
            className="form-select"
            name="user_id"
            value={newOrder.user_id}
            onChange={(e) => handleInputChange(e)}
            required
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} (ID: {customer.id})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <input
            type="number"
            className="form-control"
            placeholder="Total Price"
            name="total_price"
            value={newOrder.total_price}
            onChange={(e) => handleInputChange(e)}
            required
          />
        </div>
        <div className="mb-3">
          <select
            className="form-select"
            name="delivery_method"
            value={newOrder.delivery_method}
            onChange={handleInputChange}
            required
          >
            <option value="homeDelivery">Home Delivery</option>
            <option value="inStorePickup">In-store Pickup</option>
          </select>
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Store Location (only for in-store pickup)"
            name="store_location"
            value={newOrder.store_location}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <input
            type="date"
            className="form-control"
            name="delivery_date"
            value={newOrder.delivery_date}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Order</button>
      </form>

      {/* Orders Table */}
      <h3>Order List</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total Price</th>
            <th>Delivery Method</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.user_id}</td>
              <td>{order.total_price}</td>
              <td>{order.delivery_method}</td>
              <td>{order.status}</td>
              <td>
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => setEditOrder(order)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteOrder(order.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Update Order Form (Only if editing an order) */}
      {editOrder && (
        <form onSubmit={handleUpdateOrder} className="mb-4">
          <h3>Update Order</h3>
          <div className="mb-3">
            <input
              type="number"
              className="form-control"
              placeholder="Total Price"
              name="total_price"
              value={editOrder.total_price}
              onChange={(e) => handleInputChange(e, true)}
              required
            />
          </div>
          <div className="mb-3">
            <select
              className="form-select"
              name="delivery_method"
              value={editOrder.delivery_method}
              onChange={(e) => handleInputChange(e, true)}
              required
            >
              <option value="homeDelivery">Home Delivery</option>
              <option value="inStorePickup">In-store Pickup</option>
            </select>
          </div>
          <div className="mb-3">
            <input
              type="date"
              className="form-control"
              name="delivery_date"
              value={editOrder.delivery_date}
              onChange={(e) => handleInputChange(e, true)}
              required
            />
          </div>
          <button type="submit" className="btn btn-warning">Update Order</button>
        </form>
      )}
    </div>
  );
};

export default Salesman;