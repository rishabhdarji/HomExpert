import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import '../Css/customerservice.css';

const TicketStatus = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate(); // Initialize navigate for redirection

  const checkStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/tickets/status/${ticketNumber}`);
      
      if (!response.ok) {
        throw new Error("Ticket not found or network error");
      }

      const data = await response.json();
      setStatus(data.Decision || data.status); // Use the correct field from the backend response
    } catch (error) {
      console.error("Error fetching ticket status:", error);
      setStatus("Error retrieving ticket status");
    }
  };

  return (
    <div id="ticketstatus">
      <input
        value={ticketNumber}
        onChange={(e) => setTicketNumber(e.target.value)}
        placeholder="Enter Ticket Number"
      />
      <button onClick={checkStatus}>Check Status</button>
      {status && <p>Status: {status}</p>}
      <button onClick={() => navigate("/customer-service")}>Back Button</button>
    </div>
  );
};

export default TicketStatus;
