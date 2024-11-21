import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Css/LoginSignupForm.css'; // Import the CSS file

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role selection
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Sending login data to the backend for validation
    axios.post('http://localhost:3001/login', { email, password })
      .then((response) => {
        // Checking for successful login and valid role
        if (response.status === 200 && response.data.role) {
          const userRole = response.data.role;
          const userEmail = response.data.email;
          const userName = response.data.name;

          // Storing user data in localStorage
          localStorage.setItem('userId', response.data.id);  // Storing user ID
          localStorage.setItem('userRole', userRole);  // Storing user role
          localStorage.setItem('userEmail', userEmail);  // Storing user email
          localStorage.setItem('userName', userName);  // Storing username

          // Navigate to the appropriate dashboard based on the user role
          if (userRole === 'storeManager') {
            navigate('/store-manager');
          } else if (userRole === 'salesman') {
            navigate('/salesman');
          } else {
            navigate('/customer');
          }
        } else {
          alert('Login failed: Role information missing');
        }
      })
      .catch((error) => {
        alert('Login failed');
        console.error('Error during login:', error);
      });
  };

  return (
    <div className="form-container"> {/* Using LoginSignupForm.css styles */}
      <h3 className="text-center">Login</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group mt-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group mt-3">
          <label>Select Role</label>
          <select
            className="form-control"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="customer">Customer</option>
            <option value="salesman">Salesman</option>
            <option value="storeManager">Store Manager</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-block mt-4">Login</button>
      </form>
      <div className="text-center mt-3">
        <p>Don't have an account? <a href="/signup">Sign up here</a></p>
      </div>
    </div>
  );
};

export default LoginForm;
