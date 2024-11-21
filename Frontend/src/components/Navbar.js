import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Css/Navbar.css'; 



const Navbar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showPastOrders, setShowPastOrders] = useState(false);
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:3001/past-orders/${userId}`)
        .then(response => {
          if (response.data.length > 0) setShowPastOrders(true);
        })
        .catch(error => console.error('Error fetching past orders:', error));
    }
  }, [userId]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      axios.get(`http://localhost:3001/autocomplete?q=${value}`)
        .then(response => setSuggestions(response.data))
        .catch(error => console.error('Error fetching suggestions:', error));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    setSuggestions([]);
    navigate(`/products/${suggestion.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light custom-navbar">
      <nav className="navbar navbar-expand-lg navbar-light bg-light custom-navbar">
  <Link className="navbar-brand" to="/customer">
    <img src="/Logo-Homexpert.png" alt="HomeXpert Logo" width="200" height="50" className="d-inline-block align-text-top" />
    
  </Link>
  <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
  </button>
  <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
    {/* Remaining navbar items */}
  </div>
</nav>

      {/* <Link className="navbar-brand" to="/">HomeXpert</Link> */}
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
        <ul className="navbar-nav">
          {/* <li className="nav-item">
            <Link className="nav-link" to="/customer">Home</Link>
          </li> */}
          {userRole === 'customer' && (
            <>
              <li className="nav-item">
            <Link className="nav-link" to="/customer">Home</Link>
          </li>
              <li className="nav-item">
            <Link className="nav-link" to="/customer-service">Customer Service</Link>
          </li>
          </>
          )}
          {userRole === 'storeManager' && (
            <>
            <li className="nav-item">
            <Link className="nav-link" to="/store-manager">Home</Link>
            </li>
              <li className="nav-item">
                <Link className="nav-link" to="/store-manager">Manage Products</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/inventory">Inventory</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/sales-reports">Sales Reports</Link>
              </li>
              <li className="nav-item">
            <Link className="nav-link" to="/trending">Trending</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/customer-service">Customer Service</Link>
          </li>
            </>
          )}

          {userRole === 'salesman' && (
            <>
            <li className="nav-item">
              <Link className="nav-link" to="/salesman">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/salesman">Manage Customers</Link>
            </li>
            <li className="nav-item">
            <Link className="nav-link" to="/trending">Trending</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/customer-service">Customer Service</Link>
          </li>
            </>
          )}

          <li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" id="productsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Products
            </a>
            <ul className="dropdown-menu">
              <li><Link className="dropdown-item" to="/products/doorbells">Advanced Smart Doorbells</Link></li>
              <li><Link className="dropdown-item" to="/products/doorlocks">Smart Doorlocks</Link></li>
              <li><Link className="dropdown-item" to="/products/speakers">Smart Speakers</Link></li>
              <li><Link className="dropdown-item" to="/products/lightings">Smart Lightings</Link></li>
              <li><Link className="dropdown-item" to="/products/thermostats">Video Doorbell Pro</Link></li>
            </ul>
          </li>

          {showPastOrders && (
            <li className="nav-item">
              <Link className="nav-link" to="/past-orders">Order History</Link>
            </li>
          )}

          {userRole && (
            <li className="nav-item">
              <Link className="nav-link" to="/cart">Cart</Link>
            </li>
          )}

          {/* <li className="nav-item">
            <Link className="nav-link" to="/trending">Trending</Link>
          </li> */}
        </ul>

        <form className="d-flex search-bar">
  <input
    type="search"
    className="form-control"
    placeholder="Search..."
    value={query}
    onChange={handleSearchChange}
  />
  {suggestions.length > 0 && (
    <ul className="list-group position-absolute">
      {suggestions.map((suggestion, index) => (
        <li
          key={index}
          className="list-group-item list-group-item-action d-flex align-items-center"
          onClick={() => handleSuggestionClick(suggestion)}
        >
          <span className="me-2">
            <i className="fas fa-search"></i>
          </span>
          {suggestion.name}
        </li>
      ))}
    </ul>
  )}
</form>

        <div className="ml-auto user-info">
          {userRole ? (
            <div className="btn-group">
              <button type="button" className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                {userName}
              </button>
              <ul className="dropdown-menu dropdown-menu-right">
                <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          ) : (
            <>
              <Link className="btn btn-outline-primary mr-2" to="/login">Login</Link>
              <Link className="btn btn-primary" to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
