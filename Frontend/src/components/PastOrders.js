import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Css/Customer.css'; 

const PastOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isUpdating, setIsUpdating] = useState(null); // Track the order being updated
  const [updateStatus, setUpdateStatus] = useState(''); // Status for updating

  // Get the userId from localStorage
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Fetch all past orders for the logged-in user
    axios.get(`http://localhost:3001/past-orders/${userId}`)
      .then(response => {
        setOrders(response.data);
      })
      .catch(error => {
        console.error('Error fetching past orders:', error);
      });
  }, [userId]);

  // Handle cancel order
  const handleCancelOrder = (orderId) => {
    axios.delete(`http://localhost:3001/cancel-order/${orderId}`)  // Change to DELETE method
      .then(response => {
        alert('Order canceled successfully');
        // Reload orders after cancellation
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'cancelled' } : order));
      })
      .catch(error => {
        console.error('Error canceling order:', error);
        alert('Error canceling order');
      });
  };

  // Handle update order status
  const handleUpdateOrder = (orderId) => {
    if (updateStatus === '') {
      alert('Please enter a new status');
      return;
    }

    axios.put(`http://localhost:3001/update-order/${orderId}`, { status: updateStatus })
      .then(response => {
        alert('Order updated successfully');
        // Reload orders after update
        setOrders(orders.map(order => order.id === orderId ? { ...order, status: updateStatus } : order));
        setIsUpdating(null); // Exit update mode
      })
      .catch(error => {
        console.error('Error updating order:', error);
        alert('Error updating order');
      });
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Your Past Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center no-orders">You haven’t placed any orders yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Order ID</th>
                <th>Total Price</th>
                <th>Delivery Method</th>
                <th>Status</th>
                <th>Delivery Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className={order.status === 'cancelled' ? 'table-danger' : ''}>
                  <td>{order.id}</td>
                  <td>${order.total_price}</td>
                  <td>{order.delivery_method}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(order.delivery_date).toLocaleDateString()}</td>
                  <td>
                    {/* Show Cancel button only if order is not already cancelled */}
                    {order.status !== 'cancelled' && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PastOrders;
