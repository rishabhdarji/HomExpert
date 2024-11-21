import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
// import '../Css/ReviewForm.css'; // Import the CSS for styling

const ReviewForm = () => {
    const { id } = useParams();  // Get the product ID from the URL
    const navigate = useNavigate();
    const location = useLocation();
    const { product } = location.state || {};  // Get product details from state

    const [review, setReview] = useState({
        productId: id,  // Store the product ID from MySQL
        productModelName: product ? product.name : '',
        productCategory: product ? product.category : '',
        productPrice: product ? product.price : '',
        storeID: '',
        storeZip: '',
        storeCity: '',
        storeState: '',
        productOnSale: false,  // Set default as false
        manufacturerName: '',
        manufacturerRebate: false,  // Set default as false
        userID: '',
        userAge: '',
        userGender: '',
        userOccupation: '',
        reviewRating: '',
        reviewDate: '',
        reviewText: ''
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setReview({ ...review, [name]: fieldValue });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Ensure boolean values are passed correctly
        const finalReview = {
            ...review,
            productOnSale: review.productOnSale || false,
            manufacturerRebate: review.manufacturerRebate || false
        };

        // Submit the review to the backend with the productId
        axios.post('http://localhost:3001/reviews', finalReview)
            .then(() => {
                alert('Review submitted successfully!');
                navigate(`/products/${id}`);  // Redirect back to the product page
            })
            .catch((error) => {
                console.error('Error submitting review:', error);
            });
    };

    const handleCancel = () => {
        navigate(`/products/${id}`);  // Redirect back to product page without submitting
    };

    return (
        <div className="container mt-4">
            <h2>Write a Review for {product ? product.name : 'Product'}</h2>
            <form onSubmit={handleSubmit}>
                {/* Add the form fields here as shown in the initial code */}
                <div className="mb-3">
                    <label className="form-label">Product Model Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="productModelName"
                        value={review.productModelName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Product Category</label>
                    <input
                        type="text"
                        className="form-control"
                        name="productCategory"
                        value={review.productCategory}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Product Price</label>
                    <input
                        type="number"
                        className="form-control"
                        name="productPrice"
                        value={review.productPrice}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Store ID</label>
                    <input
                        type="text"
                        className="form-control"
                        name="storeID"
                        value={review.storeID}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Store Zip</label>
                    <input
                        type="text"
                        className="form-control"
                        name="storeZip"
                        value={review.storeZip}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Store City</label>
                    <input
                        type="text"
                        className="form-control"
                        name="storeCity"
                        value={review.storeCity}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Store State</label>
                    <input
                        type="text"
                        className="form-control"
                        name="storeState"
                        value={review.storeState}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Product On Sale</label>
                    <select
                        className="form-select"
                        name="productOnSale"
                        value={review.productOnSale}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Manufacturer Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="manufacturerName"
                        value={review.manufacturerName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Manufacturer Rebate</label>
                    <select
                        className="form-select"
                        name="manufacturerRebate"
                        value={review.manufacturerRebate}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">User ID</label>
                    <input
                        type="text"
                        className="form-control"
                        name="userID"
                        value={review.userID}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">User Age</label>
                    <input
                        type="number"
                        className="form-control"
                        name="userAge"
                        value={review.userAge}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">User Gender</label>
                    <select
                        className="form-select"
                        name="userGender"
                        value={review.userGender}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">User Occupation</label>
                    <input
                        type="text"
                        className="form-control"
                        name="userOccupation"
                        value={review.userOccupation}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Review Rating</label>
                    <input
                        type="number"
                        className="form-control"
                        name="reviewRating"
                        value={review.reviewRating}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Review Date</label>
                    <input
                        type="date"
                        className="form-control"
                        name="reviewDate"
                        value={review.reviewDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Review Text</label>
                    <textarea
                        className="form-control"
                        name="reviewText"
                        value={review.reviewText}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success">Submit Review</button>
                <button type="button" className="btn btn-danger ms-2" onClick={handleCancel}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;