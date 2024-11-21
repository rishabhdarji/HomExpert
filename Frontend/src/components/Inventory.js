import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import '../Css/Inventory.css'; // Include the CSS file for styling

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [rebateItems, setRebateItems] = useState([]);

  useEffect(() => {
    // Fetch all products
    axios.get('http://localhost:3001/inventory/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Failed to fetch products:', error));

    // Fetch bar chart data
    axios.get('http://localhost:3001/inventory/products/bar-chart')
      .then(response => setChartData(response.data))
      .catch(error => console.error('Error fetching chart data:', error));

    // Fetch discounted products
    axios.get('http://localhost:3001/inventory/products/sale')
      .then(response => setDiscountedProducts(response.data))
      .catch(error => console.error('Error fetching discounted products:', error));

    // Fetch rebate products
    axios.get('http://localhost:3001/inventory/products/rebates')
      .then(response => setRebateItems(response.data))
      .catch(error => console.error('Error fetching rebate items:', error));
  }, []);

  return (
    <div className="inventory-container">
      <h1 className="title">Inventory Management</h1>

      {/* All products table */}
      <section>
        <h2>Products Overview</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price ($)</th>
              <th>Available Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Bar chart of product stock */}
      <section>
        <h2>Stock Levels</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stock" fill="#6a82fb" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Discounted products */}
      <section>
        <h2>Discounted Products</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price ($)</th>
              <th>Discount ($)</th>
            </tr>
          </thead>
          <tbody>
            {discountedProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.discount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Rebate products */}
      <section>
        <h2>Rebate Items</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price ($)</th>
              <th>Rebate ($)</th>
            </tr>
          </thead>
          <tbody>
            {rebateItems.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.rebate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Inventory;
