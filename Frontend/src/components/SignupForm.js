import React, { useState } from 'react';
import axios from 'axios';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // default role

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Send signup data to the backend
    axios.post('http://localhost:3001/signup', { name, email, password, role })
      .then((response) => {
        alert('Signup successful');
        console.log(response.data);
      })
      .catch((error) => {
        alert('Error signing up');
        console.error(error);
      });
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5">
            <div className="card-body">
              <h3 className="card-title text-center">Sign Up</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group mt-3">
                  <label>Email address</label>
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
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Confirm password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group mt-3">
                  <label>Select Role</label>
                  <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="customer">Customer</option>
                    <option value="salesman">Salesman</option>
                    <option value="storeManager">Store Manager</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-block mt-4">Sign Up</button>
              </form>
              <div className="text-center mt-3">
                <p>Already have an account? <a href="/login">Login here</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;