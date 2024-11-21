import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../Css/customerservice.css';

const OpenTicket = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [ticketNumber, setTicketNumber] = useState('');
  const [name, setName] = useState("");  // Customer name
  const [email, setEmail] = useState("");  // Customer email
  const [category, setCategory] = useState("");  // Selected category

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("description", text); // renamed to match backend
    formData.append("image", image);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("category", category); // changed from product to category

    try {
      const response = await fetch("http://localhost:3001/tickets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setTicketNumber(data.ticketNumber);

    } catch (error) {
      console.error("Error submitting ticket:", error);
    }
  };

  return (
    <div id="openticket">
      {ticketNumber ? (
        <p>Your Ticket Number: {ticketNumber}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a Category</option>
            <option value="Advanced Smart Doorbells">Advanced Smart Doorbells</option>
            <option value="Smart Doorlocks">Smart Doorlocks</option>
            <option value="Smart Speakers">Smart Speakers</option>
            <option value="Smart Lightings">Smart Lightings</option>
            <option value="Video Doorbell Pro">Video Doorbell Pro</option>
          </select>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe the issue"
            required
          />
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
          <button type="submit">Submit Ticket</button>
        </form>
      )}
      <button onClick={() => navigate("/customer-service")}>
        Back Button
      </button>
    </div>
  );
};

export default OpenTicket;
