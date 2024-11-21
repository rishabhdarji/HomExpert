import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Tooltip as PieTooltip } from 'recharts';
import '../Css/Trending.css'; 

const COLOR_PALETTE = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF3333'];

const Trending = () => {
  const [zipCodeData, setZipCodeData] = useState([]);
  const [soldProductsData, setSoldProductsData] = useState([]);
  const [ratedProductsData, setRatedProductsData] = useState([]);

  useEffect(() => {
    const fetchTrendingInfo = async () => {
      try {
        const [zipCodesResponse, soldProductsResponse, ratedProductsResponse] = await Promise.all([
          fetch('http://localhost:3001/trending/top-zipcodes'),
          fetch('http://localhost:3001/trending/most-sold'),
          fetch('http://localhost:3001/trending/most-liked')
        ]);

        if (zipCodesResponse.ok) {
          const zipCodes = await zipCodesResponse.json();
          setZipCodeData(zipCodes);
        }

        if (soldProductsResponse.ok) {
          const soldProducts = await soldProductsResponse.json();
          setSoldProductsData(soldProducts);
        }

        if (ratedProductsResponse.ok) {
          const ratedProducts = await ratedProductsResponse.json();
          setRatedProductsData(ratedProducts);
        }
      } catch (error) {
        console.error('Error fetching trending data:', error);
      }
    };

    fetchTrendingInfo();
  }, []);

  // Data for the Pie Chart (Most Sold Products)
  const pieChartData = soldProductsData.map((product) => ({
    name: product.orderName,
    value: parseInt(product.totalSold, 10),
  }));

  // Data for the Bar Chart (Top Rated Products)
  const ratedBarData = ratedProductsData.map((product) => ({
    name: product._id,
    value: parseFloat(product.averageRating),
  }));

  return (
    <div className="trending-container">
      <section className="chart-section">
        <h2>Top Locations by Orders</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={zipCodeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="store_location" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalOrders" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-section">
        <h2>Most Sold Products</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
              ))}
            </Pie>
            <PieTooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-section">
        <h2>Highest Rated Products</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={ratedBarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default Trending;
