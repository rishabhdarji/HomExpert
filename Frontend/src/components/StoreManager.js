import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Css/StoreManager.css'; // Import the modern CSS

const StoreManager = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'smart doorbell',
    accessories: '',
    image: '',
    discount: '',
    rebate: '',
    warranty: 0,
  });
  const [editProduct, setEditProduct] = useState(null);

  // Fetch products when component mounts
  useEffect(() => {
    loadProducts();
  }, []);

  // Load product data from the API
  const loadProducts = () => {
    axios.get('http://localhost:3001/products')
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Failed to fetch products', error));
  };

  // Add a new product
  const addProduct = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/products', newProduct)
      .then(() => {
        alert('Product successfully added!');
        loadProducts(); // Refresh product list
        resetNewProduct();
      })
      .catch((error) => console.error('Failed to add product', error));
  };

  // Reset new product form after adding
  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      price: '',
      description: '',
      category: 'smart doorbell',
      accessories: '',
      image: '',
      discount: '',
      rebate: '',
      warranty: 0,
    });
  };

  // Update product
  const updateProduct = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:3001/products/${editProduct.id}`, editProduct)
      .then(() => {
        alert('Product successfully updated!');
        loadProducts();
        setEditProduct(null); // Reset edit form
      })
      .catch((error) => console.error('Failed to update product', error));
  };

  // Delete a product
  const deleteProduct = (id) => {
    axios.delete(`http://localhost:3001/products/${id}`)
      .then(() => {
        alert('Product deleted successfully!');
        loadProducts(); // Refresh product list
      })
      .catch((error) => console.error('Failed to delete product', error));
  };

  // Handle input changes for add and edit forms
  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    isEdit
      ? setEditProduct({ ...editProduct, [name]: value })
      : setNewProduct({ ...newProduct, [name]: value });
  };

  return (
    <div className="store-manager-container">
      <h1>Welcome to Store Manager Dashboard</h1>
      <p>Manage your product inventory - Add, Edit, or Remove products.</p>

      {/* Add Product Form */}
      <form onSubmit={addProduct} className="form-container">
        <h3>Add New Product</h3>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={newProduct.price}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={newProduct.description}
          onChange={handleInputChange}
        />
        <select
          name="category"
          value={newProduct.category}
          onChange={handleInputChange}
          required
        >
          <option value="smart doorbell">Smart Doorbell</option>
          <option value="smart doorlock">Smart Doorlock</option>
          <option value="smart lighting">Smart Lighting</option>
          <option value="smart speaker">Smart Speaker</option>
          <option value="video doorbell pro">Video Doorbell Pro</option>
        </select>
        <textarea
          name="accessories"
          placeholder="Accessories"
          value={newProduct.accessories}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={newProduct.image}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="discount"
          placeholder="Discount"
          value={newProduct.discount}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="rebate"
          placeholder="Rebate"
          value={newProduct.rebate}
          onChange={handleInputChange}
        />
        <select
          name="warranty"
          value={newProduct.warranty}
          onChange={handleInputChange}
        >
          <option value="0">No Warranty</option>
          <option value="1">Warranty Included</option>
        </select>
        <button type="submit">Add Product</button>
      </form>

      {/* Edit Product Form */}
      {editProduct && (
        <form onSubmit={updateProduct} className="form-container">
          <h3>Edit Product</h3>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={editProduct.name}
            onChange={(e) => handleInputChange(e, true)}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={editProduct.price}
            onChange={(e) => handleInputChange(e, true)}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={editProduct.description}
            onChange={(e) => handleInputChange(e, true)}
          />
          <select
            name="category"
            value={editProduct.category}
            onChange={(e) => handleInputChange(e, true)}
            required
          >
            <option value="smart doorbell">Smart Doorbell</option>
            <option value="smart doorlock">Smart Doorlock</option>
            <option value="smart lighting">Smart Lighting</option>
            <option value="smart speaker">Smart Speaker</option>
            <option value="video doorbell pro">Video Doorbell Pro</option>
          </select>
          <textarea
            name="accessories"
            placeholder="Accessories"
            value={editProduct.accessories}
            onChange={(e) => handleInputChange(e, true)}
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={editProduct.image}
            onChange={(e) => handleInputChange(e, true)}
          />
          <input
            type="number"
            name="discount"
            placeholder="Discount"
            value={editProduct.discount}
            onChange={(e) => handleInputChange(e, true)}
          />
          <input
            type="number"
            name="rebate"
            placeholder="Rebate"
            value={editProduct.rebate}
            onChange={(e) => handleInputChange(e, true)}
          />
          <select
            name="warranty"
            value={editProduct.warranty}
            onChange={(e) => handleInputChange(e, true)}
          >
            <option value="0">No Warranty</option>
            <option value="1">Warranty Included</option>
          </select>
          <button type="submit">Update Product</button>
        </form>
      )}

      {/* Product List */}
      <h3>Product List</h3>
      <table className="product-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Category</th>
            <th>Accessories</th>
            <th>Discount</th>
            <th>Rebate</th>
            <th>Warranty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.description}</td>
              <td>{product.category}</td>
              <td>{product.accessories}</td>
              <td>{product.discount}</td>
              <td>{product.rebate}</td>
              <td>{product.warranty === 1 ? 'Yes' : 'No'}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => setEditProduct(product)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteProduct(product.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StoreManager;
