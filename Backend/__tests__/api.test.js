const axios = require('axios');

const API_URL = 'http://localhost:3001';

describe('API Tests', () => {
  // Test data
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpass123',
    role: 'customer'
  };

  const testProduct = {
    name: 'Test Product',
    price: 99.99,
    description: 'Test description',
    category: 'Test Category',
    accessories: 'Test accessories',
    image: 'test.jpg',
    discount: 10,
    rebate: 5,
    warranty: 1
  };

  let userId;
  let productId;
  let orderId;
  let ticketNumber;

  // Authentication Tests
  describe('Authentication APIs', () => {
    test('POST /signup - Register new user', async () => {
      const response = await axios.post(`${API_URL}/signup`, testUser);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('User registered successfully');
    });

    test('POST /login - User login', async () => {
      const response = await axios.post(`${API_URL}/login`, {
        email: testUser.email,
        password: testUser.password
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe(' successful');
      userId = response.data.id;
    });
  });

  // Product Management Tests
  describe('Product Management APIs', () => {
    test('POST /products - Add new product', async () => {
      const response = await axios.post(`${API_URL}/products`, testProduct);
      expect(response.status).toBe(201);
      expect(response.data.message).toBe('Product added successfully');
      productId = response.data.productId;
    });

    test('GET /products - Get all products', async () => {
      const response = await axios.get(`${API_URL}/products`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('GET /products/:id - Get specific product', async () => {
      const response = await axios.get(`${API_URL}/products/${productId}`);
      expect(response.status).toBe(200);
      expect(response.data.name).toBe(testProduct.name);
    });

    test('PUT /products/:id - Update product', async () => {
      const updatedProduct = { ...testProduct, name: 'Updated Test Product' };
      const response = await axios.put(`${API_URL}/products/${productId}`, updatedProduct);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Product updated successfully');
    });

    test('GET /autocomplete - Get product suggestions', async () => {
      const response = await axios.get(`${API_URL}/autocomplete?q=Test`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  // Order Management Tests
  describe('Order Management APIs', () => {
    test('POST /place-order - Place new order', async () => {
      const orderData = {
        userId,
        totalPrice: 99.99,
        deliveryMethod: 'Standard',
        storeLocation: '12345',
        deliveryDate: new Date().toISOString(),
        cartItems: [{
          product_id: productId,
          quantity: 1,
          name: testProduct.name,
          price: testProduct.price
        }],
        address: '123 Test St',
        creditCard: '4111111111111111'
      };
      const response = await axios.post(`${API_URL}/place-order`, orderData);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Order placed successfully');
    });

    test('GET /past-orders/:userId - Get order history', async () => {
      const response = await axios.get(`${API_URL}/past-orders/${userId}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      if (response.data.length > 0) {
        orderId = response.data[0].id;
      }
    });

    test('GET /orders - Get all orders', async () => {
      const response = await axios.get(`${API_URL}/orders`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  // Customer Service Tests
  describe('Customer Service APIs', () => {
    test('POST /tickets - Create support ticket', async () => {
      const formData = new FormData();
      formData.append('name', testUser.name);
      formData.append('email', testUser.email);
      formData.append('category', 'Test Category');
      formData.append('description', 'Test ticket description');
      // Create a test image file
      const testImage = new File(['test image content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('image', testImage);

      const response = await axios.post(`${API_URL}/tickets`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      expect(response.status).toBe(201);
      expect(response.data.message).toBe('Ticket created successfully');
      ticketNumber = response.data.ticketNumber;
    });

    test('GET /tickets/status/:ticketNumber - Get ticket status', async () => {
      const response = await axios.get(`${API_URL}/tickets/status/${ticketNumber}`);
      expect(response.status).toBe(200);
      expect(response.data.ticketDetails).toBeDefined();
    });
  });

  // Review Management Tests
  describe('Review Management APIs', () => {
    test('POST /reviews - Submit product review', async () => {
      const reviewData = {
        productId: productId,
        productModelName: testProduct.name,
        productCategory: testProduct.category,
        productPrice: testProduct.price,
        storeID: '12345',
        storeZip: '12345',
        storeCity: 'Test City',
        storeState: 'TS',
        productOnSale: false,
        manufacturerName: 'Test Manufacturer',
        manufacturerRebate: false,
        userID: userId.toString(),
        userAge: 25,
        userGender: 'Other',
        userOccupation: 'Tester',
        reviewRating: 5,
        reviewDate: new Date().toISOString(),
        reviewText: 'This is a test review'
      };
      const response = await axios.post(`${API_URL}/reviews`, reviewData);
      expect(response.status).toBe(201);
      expect(response.data.message).toBe('Review submitted successfully');
    });

    test('GET /reviews - Get product reviews', async () => {
      const response = await axios.get(`${API_URL}/reviews?productId=${productId}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  // Cleanup Tests
  describe('Cleanup', () => {
    test('DELETE /products/:id - Delete test product', async () => {
      const response = await axios.delete(`${API_URL}/products/${productId}`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Product deleted successfully');
    });

    test('DELETE /orders/:id - Delete test order', async () => {
      if (orderId) {
        const response = await axios.delete(`${API_URL}/orders/${orderId}`);
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Order deleted successfully');
      }
    });
  });
});
