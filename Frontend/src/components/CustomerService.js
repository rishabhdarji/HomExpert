import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate for navigation
import '../Css/customerservice.css'; 

const CustomerService = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate(); // Add useNavigate for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("text", text);
    formData.append("image", image);

    await fetch("http://localhost:3001/tickets", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div id="customerservice">
      {/* Buttons to navigate to Open Ticket and Check Ticket Status */}
      <button onClick={() => navigate("/customer-service/open-ticket")}>
        Open a Ticket
      </button>
      <button onClick={() => navigate("/customer-service/ticket-status")}>
        Check Ticket Status
      </button>
      <button onClick={() => navigate("/customer-service")}>
        Back Button
      </button>

      {/* The form for submitting a ticket */}
      {/* <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the issue"
        />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">Submit Ticket</button>
        
      </form> */}
    </div>
  );
};

export default CustomerService;
