import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import '../Css/SalesReport.css'; // New CSS file for modern design

const SalesReport = () => {
  const [soldItems, setSoldItems] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dailyTransactions, setDailyTransactions] = useState([]);

  useEffect(() => {
    // Fetch all sold products
    axios.get('http://localhost:3001/sales-report/products-sold')
      .then((response) => {
        setSoldItems(response.data);
      })
      .catch((error) => {
        console.error('Error fetching sold products:', error);
      });

    // Fetch sales data for the bar chart
    axios.get('http://localhost:3001/sales-report/products-sales-chart')
      .then((response) => {
        setChartData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching sales chart data:', error);
      });

    // Fetch daily sales transactions
    axios.get('http://localhost:3001/sales-report/daily-sales')
      .then((response) => {
        setDailyTransactions(response.data);
      })
      .catch((error) => {
        console.error('Error fetching daily transactions:', error);
      });
  }, []);

  // Calculate maximum total sales for Y-axis scaling
  const getMaxSalesValue = () => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map(item => item.total_sales)) + 500; // Adding buffer for readability
  };

  return (
    <div className="sales-container">
      <h1 className="main-title">Sales Overview</h1>

      {/* Products Sold Table */}
      <section>
        <h2>Products Sold</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price ($)</th>
              <th>Units Sold</th>
              <th>Total Sales ($)</th>
            </tr>
          </thead>
          <tbody>
            {soldItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.items_sold}</td>
                <td>{item.total_sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Product Sales Bar Chart */}
      <section>
        <h2>Sales Chart</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, getMaxSalesValue()]} />
            <Tooltip />
            <Bar dataKey="total_sales" fill="#6a82fb" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Daily Sales Table */}
      <section>
        <h2>Daily Sale</h2>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Sales ($)</th>
            </tr>
          </thead>
          <tbody>
            {dailyTransactions.map((transaction) => (
              <tr key={transaction.date}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.total_sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SalesReport;
