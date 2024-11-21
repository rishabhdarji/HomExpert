import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [userDetails, setUserDetails] = useState({
    id: '',
    name: '',
    email: ''
  });

  // Get the user details from localStorage
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail'); // Make sure to store the email in localStorage during login
    const userRole = localStorage.getItem('userRole'); 

    setUserDetails({
      id: userId,
      name: userName,
      email: userEmail,
      role: userRole
    });
  }, []);

  return (
    <div className="container mt-5">
      <h2>Profile</h2>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">User Information</h5>
          <p><strong>ID:</strong> {userDetails.id}</p>
          <p><strong>Name:</strong> {userDetails.name}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;