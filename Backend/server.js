const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');  // MongoDB connection
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const xml2js = require('xml2js');
let productMap = new Map();

const multer = require('multer');

const axios = require('axios');  // Add this line to import Axios
// const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config(); // Load environment variables from .env

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY // Use your API key securely
// });

// const openai = new OpenAIApi(configuration);



const { v4: uuidv4 } = require('uuid'); // Import the uuid library for generating unique IDs

const path = require('path'); 


const app = express();  // Initialize app first



app.use(express.json());



// const multer = require('multer');
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Save images to a specific directory (e.g., 'uploads')
//     const uploadDir = 'uploads';
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir); // Create directory if it doesn't exist
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
//   },
// });

// const upload = multer({ storage });







// All below code is perfect 

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

const port = 3001;

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rishabh',  // Replace with your MySQL root password
    database: 'smarthome'
});


// const loadProductsFromXML = () => {
//   const parser = new xml2js.Parser();
//   fs.readFile('path/to/ProductCatalog.xml', (err, data) => {
//       if (err) {
//           console.error('Error reading XML file:', err);
//           return;
//       }

//       parser.parseString(data, (err, result) => {
//           if (err) {
//               console.error('Error parsing XML:', err);
//               return;
//           }

//           const products = result.catalog.product;  // Assuming XML has <catalog><product> elements
//           products.forEach(product => {
//               productMap.set(product.id[0], {
//                   name: product.name[0],
//                   price: product.price[0],
//                   stock: product.stock[0]
//               });
//           });

//           console.log('Products loaded into productMap:', productMap);
//       });
//   });
// };

// Load products into the Map when the server starts
// loadProductsFromXML();

// // Function to sync MySQL with the productMap
// const syncProductToMySQL = (productId, productData) => {
//   const query = `INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)
//                  ON DUPLICATE KEY UPDATE name = ?, price = ?, stock = ?`;

//   db.query(query, [productId, productData.name, productData.price, productData.stock,
//                    productData.name, productData.price, productData.stock], (err, result) => {
//       if (err) {
//           console.error('Error syncing product to MySQL:', err);
//       }
//   });
// };

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// Register a new user
app.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';

    db.query(query, [name, email, hashedPassword, role], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error registering user', error: err });
        }
        return res.status(200).json({ message: 'User registered successfully' });
    });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Query to find the user by email
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // If no user is found with the provided email
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Assuming you're using bcrypt to hash passwords (adjust this if you're using plain text)
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Login is successful, return the user id and role
      res.status(200).json({
        message: ' successful',
        id: user.id,   // Include the user id in the response
        role: user.role,
        email: user.email,
        name: user.name
      });
    });
  });
});


app.get('/products', (req, res) => {
    const category = req.query.category;

    let query = 'SELECT * FROM products';
    if (category) {
        query += ' WHERE category = ?';
    }

    db.query(query, [category], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching products', error: err });
        }

        // console.log('Fetched products:', results);  // Add this to log the results
        return res.status(200).json(results);
    });
});

app.post('/products', (req, res) => {
  const { name, price, description, category, accessories, image, discount, rebate, warranty } = req.body;

  const query = `INSERT INTO products (name, price, description, category, accessories, image, discount, rebate, warranty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(query, [name, price, description, category, accessories, image, discount, rebate, warranty], (err, result) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).json({ message: 'Error adding product' });
    }
    res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  });
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, description, category, accessories, image } = req.body;

  const query = `UPDATE products SET name = ?, price = ?, description = ?, category = ?, accessories = ?, image = ? WHERE id = ?`;
  db.query(query, [name, price, description, category, accessories, image, id], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ message: 'Error updating product' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully' });
  });
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  console.log("Deleting product with ID:", id); // Log the ID
  const query = `DELETE FROM products WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ message: 'Error deleting product' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  });
});


app.post('/place-order', (req, res) => {
  const { userId, totalPrice, deliveryMethod, storeLocation, deliveryDate, cartItems, address, creditCard } = req.body;

  // Log the incoming request body to check for missing fields
  console.log('Request Body:', req.body);

  // Validate required fields
  if (!userId || !totalPrice || !deliveryMethod || !cartItems || !address || !creditCard) {
      return res.status(400).json({ message: 'Missing required order information' });
  }

  // Log that data validation has passed
  console.log('Validation passed, proceeding with database operations');

  // Insert into the orders table
  const orderQuery = `
      INSERT INTO orders (user_id, total_price, delivery_method, store_location, status, delivery_date, product_id, quantity)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
  `;
  
  cartItems.forEach((item) => {
    // Log each item to track the insertion process
    console.log('Inserting order for product ID:', item.product_id);

    // Insert each cart item as a separate order with its respective product_id and quantity
    db.query(orderQuery, [userId, totalPrice, deliveryMethod, storeLocation, deliveryDate, item.product_id, item.quantity], (err, result) => {
        if (err) {
            console.error('Error inserting into orders table:', err);  // Log the specific error
            return res.status(500).json({ message: 'Error placing order', error: err.message });
        }

        const orderId = result.insertId;
        console.log('Order inserted with ID:', orderId);

        // Deduct stock by 1 for each product in the cart
        const stockUpdateQuery = `
            UPDATE products
            SET stock = stock - ?
            WHERE id = ?
        `;
        
        db.query(stockUpdateQuery, [item.quantity, item.product_id], (err) => {
            if (err) {
                console.error('Error updating product stock:', err);  // Log the specific error
                return res.status(500).json({ message: 'Error updating product stock', error: err.message });
            }

            console.log(`Stock updated for product ID: ${item.product_id}`);
        });

        // Insert each item into the CustomerOrder table
        const customerOrderQuery = `
            INSERT INTO CustomerOrder (userName, orderName, orderPrice, userAddress, creditCardNo)
            VALUES ?
        `;
        const orderItems = [[
            userId,  // Assuming userId as userName, adjust this based on your schema
            item.name,
            item.price,
            address,
            creditCard
        ]];

        console.log('Order items to be inserted:', orderItems);

        db.query(customerOrderQuery, [orderItems], (err) => {
            if (err) {
                console.error('Error inserting order items into CustomerOrder table:', err);  // Log the specific error
                return res.status(500).json({ message: 'Error inserting order items', error: err.message });
            }

            console.log('Order items inserted successfully');
        });
    });
  });

  res.status(200).json({ message: 'Order placed successfully' });
});


// Route to get past orders for a specific user
app.get('/past-orders/:userId', (req, res) => {
  const userId = req.params.userId;  // Extract userId from request parameters

  const query = `
    SELECT id, total_price, delivery_method, status, delivery_date
    FROM orders
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching past orders:', err);
      return res.status(500).json({ message: 'Error fetching past orders' });
    }

    res.status(200).json(results);  // Send the orders back as a JSON response
  });
});

app.delete('/cancel-order/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  console.log('Deleting order with ID:', orderId); // Log the orderId for debugging

  const query = `
    DELETE FROM orders
    WHERE id = ?
  `;

  db.query(query, [orderId], (err, result) => {
    if (err) {
      console.error('Error deleting order:', err);
      return res.status(500).json({ message: 'Error deleting order' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  });
});


// API: Add a customer
app.post('/customers', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into the database with the hashed password
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "customer")';
    db.query(query, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error creating customer:', err);
        return res.status(500).json({ message: 'Error creating customer' });
      }
      res.status(201).json({ message: 'Customer created successfully' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    return res.status(500).json({ message: 'Error hashing password' });
  }
});

// API: Fetch all customers
app.get('/customers', (req, res) => {
  const query = 'SELECT * FROM users WHERE role = "customer"';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      return res.status(500).json({ message: 'Error fetching customers' });
    }
    res.status(200).json(results);
  });
});

// API: Add an order
app.post('/orders', (req, res) => {
  const { user_id, total_price, delivery_method, store_location, delivery_date } = req.body;
  const query = 'INSERT INTO orders (user_id, total_price, delivery_method, store_location, delivery_date) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [user_id, total_price, delivery_method, store_location, delivery_date], (err, result) => {
    if (err) {
      console.error('Error adding order:', err);
      return res.status(500).json({ message: 'Error adding order' });
    }
    res.status(201).json({ message: 'Order added successfully' });
  });
});

// API: Fetch all orders
app.get('/orders', (req, res) => {
  const query = 'SELECT * FROM orders';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ message: 'Error fetching orders' });
    }
    res.status(200).json(results);
  });
});

// API: Update an order
app.put('/orders/:id', (req, res) => {
  const { id } = req.params;
  const { total_price, delivery_method, store_location, delivery_date } = req.body;
  const query = 'UPDATE orders SET total_price = ?, delivery_method = ?, store_location = ?, delivery_date = ? WHERE id = ?';
  db.query(query, [total_price, delivery_method, store_location, delivery_date, id], (err, result) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ message: 'Error updating order' });
    }
    res.status(200).json({ message: 'Order updated successfully' });
  });
});

// API: Delete an order
app.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM orders WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting order:', err);
      return res.status(500).json({ message: 'Error deleting order' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  });
});

// Add this route to handle individual product details
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;

  const query = 'SELECT * FROM products WHERE id = ?';
  db.query(query, [productId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching product details', error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(result[0]);  // Send the product details as a response
  });
});

// Top five zip codes with maximum product sales
app.get('/trending/top-zipcodes', async (req, res) => {
  try {
    const query = `
      SELECT store_location, COUNT(store_location) AS totalOrders 
      FROM orders 
      GROUP BY store_location 
      ORDER BY totalOrders DESC 
      LIMIT 5
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing top zip codes query:', err);
        return res.status(500).json({ message: 'Error fetching top zip codes', error: err.message });
      }
      console.log('Top zip codes query results:', results);  // Add this log
      res.status(200).json(results);
    });
  } catch (err) {
    console.error('Unexpected error:', err);  // Log any unexpected errors
    res.status(500).json({ message: 'Error fetching top zip codes', error: err.message });
  }
});

// Top five most sold products
app.get('/trending/most-sold', async (req, res) => {
  try {
    const query = `
      SELECT orderName, COUNT(orderName) AS totalSold 
      FROM CustomerOrder 
      GROUP BY orderName 
      ORDER BY totalSold DESC 
      LIMIT 5
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing most sold query:', err);
        return res.status(500).json({ message: 'Error fetching most sold products', error: err.message });
      }
      console.log('Most sold products query results:', results);  // Add this log
      res.status(200).json(results);
    });
  } catch (err) {
    console.error('Unexpected error:', err);  // Log any unexpected errors
    res.status(500).json({ message: 'Error fetching most sold products', error: err.message });
  }
});

// Route to fetch store locations
app.get('/store-locations', (req, res) => {
  const query = 'SELECT * FROM store_locations';  // Replace with your actual store locations table name
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching store locations:', err);
      return res.status(500).json({ message: 'Error fetching store locations' });
    }
    res.status(200).json(results);
  });
});


app.get('/accessories', (req, res) => {
  const productId = req.query.productId;  // Get productId from query parameters
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  const query = 'SELECT * FROM accessories WHERE product_id = ?';
  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching accessories:', err);
      return res.status(500).json({ message: 'Error fetching accessories' });
    }
    res.status(200).json(results);
  });
});

// 1. API to get a table of all products and available stock
app.get('/inventory/products', (req, res) => {
  const query = `
    SELECT name, price, stock 
    FROM products
    ORDER BY name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching inventory:', err);
      return res.status(500).json({ message: 'Error fetching inventory', error: err });
    }
    return res.status(200).json(results);
  });
});

// 2. API to get data for Bar Chart (product names and stock levels)
app.get('/inventory/products/bar-chart', (req, res) => {
  const query = `
    SELECT name, stock 
    FROM products
    ORDER BY name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching bar chart data:', err);
      return res.status(500).json({ message: 'Error fetching bar chart data', error: err });
    }
    return res.status(200).json(results);
  });
});

// 3. API to get all products currently on sale (with a discount)
app.get('/inventory/products/sale', (req, res) => {
  const query = `
    SELECT name, price, discount
    FROM products
    WHERE discount IS NOT NULL
    ORDER BY name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products on sale:', err);
      return res.status(500).json({ message: 'Error fetching products on sale', error: err });
    }
    return res.status(200).json(results);
  });
});

// 4. API to get all products with manufacturer rebates
app.get('/inventory/products/rebates', (req, res) => {
  const query = `
    SELECT name, price, rebate
    FROM products
    WHERE rebate IS NOT NULL
    ORDER BY name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products with rebates:', err);
      return res.status(500).json({ message: 'Error fetching products with rebates', error: err });
    }
    return res.status(200).json(results);
  });
});

// API: Fetch product sales (name, price, total sales)
app.get('/sales-report/products-sold', (req, res) => {
  const query = `
    SELECT p.name, p.price, COUNT(o.id) AS items_sold, 
           SUM(o.total_price) AS total_sales
    FROM orders o
    JOIN products p ON o.product_id = p.id
    GROUP BY p.name, p.price
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sold products:', err);
      return res.status(500).json({ message: 'Error fetching sold products', error: err });
    }
    res.status(200).json(results);
  });
});

// API: Fetch product sales chart (product names and total sales)
app.get('/sales-report/products-sales-chart', (req, res) => {
  const query = `
    SELECT p.name, SUM(o.total_price) AS total_sales
    FROM orders o
    JOIN products p ON o.product_id = p.id
    GROUP BY p.name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sales chart data:', err);
      return res.status(500).json({ message: 'Error fetching sales chart data', error: err });
    }
    res.status(200).json(results);
  });
});

// API: Fetch total daily sales transactions
app.get('/sales-report/daily-sales', (req, res) => {
  const query = `
    SELECT DATE(o.order_date) AS date, SUM(o.total_price) AS total_sales
    FROM orders o
    GROUP BY DATE(o.order_date)
    ORDER BY date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching daily sales:', err);
      return res.status(500).json({ message: 'Error fetching daily sales', error: err });
    }
    res.status(200).json(results);
  });
});

// Create an endpoint for auto-completion search
app.get('/autocomplete', (req, res) => {
  const searchTerm = req.query.q;  // Get the search term from the query

  // Query the products table in MySQL for matching products
  const query = `
      SELECT id, name 
      FROM products 
      WHERE name LIKE ? 
      LIMIT 10
  `;

  db.query(query, [`%${searchTerm}%`], (err, results) => {
      if (err) {
          console.error('Error fetching autocomplete suggestions:', err);
          return res.status(500).json({ message: 'Error fetching autocomplete suggestions' });
      }

      // Ensure we return the full results, including id and name
      res.json(results);  // Return both id and name
  });
});

// from here tickets part is started 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Helper function to encode image to base64
function encodeImage(imagePath) {
  const image = fs.readFileSync(imagePath);
  return image.toString('base64');
}

// POST route to create a new ticket
app.post('/tickets', upload.single('image'), async (req, res) => {
  const { name, email, category, description } = req.body;
  const image = req.file;
  const ticketNumber = 'TICKET-' + uuidv4();

  if (!name || !email || !category || !description || !image) {
    return res.status(400).json({ message: 'All fields are required, including an image' });
  }

  const imagePath = path.join('uploads', image.filename);
  const base64Image = encodeImage(imagePath);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe the image.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            ],
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer your_api`, // Insert actual API key here
          'Content-Type': 'application/json',
        }
      }
    );

    const imageDescription = response.data.choices[0].message.content.trim();

    const decisionPrompt = `Based on the following image description: "${imageDescription}", decide which action should be taken...`;

    const decisionResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: decisionPrompt }
        ],
        max_tokens: 50,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer your-api`, // Insert actual API key here
          'Content-Type': 'application/json',
        }
      }
    );

    const decision = decisionResponse.data.choices[0].message.content.trim();

    let status = 'Undetermined';
    if (decision.includes('Refund Order')) status = 'Refund Order';
    else if (decision.includes('Replace Order')) status = 'Replace Order';
    else if (decision.includes('Escalate to Human Agent')) status = 'Escalate to Human Agent';

    const query = `INSERT INTO tickets (name, email, category, description, image, ticket_number, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, email, category, description, imagePath, ticketNumber, status], (err, result) => {
      if (err) {
        console.error('Error creating ticket:', err);
        return res.status(500).json({ message: 'Error creating ticket' });
      }
      res.status(201).json({ message: 'Ticket created successfully', ticketNumber, status });
    });
  } catch (error) {
    console.error('Error processing image with OpenAI:', error);
    res.status(500).json({ message: 'Error processing the image or decision' });
  }
});

// GET route to retrieve ticket details and status
app.get('/tickets/status/:ticketNumber', (req, res) => {
  const ticketNumber = req.params.ticketNumber;

  const query = 'SELECT * FROM tickets WHERE ticket_number = ?';

  db.query(query, [ticketNumber], (err, results) => {
    if (err) {
      console.error('Error fetching ticket:', err);
      return res.status(500).json({ message: 'Error fetching ticket' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const ticket = results[0];
    res.status(200).json({
      message: 'Ticket details retrieved successfully',
      decision: ticket.status, // Adjusted field name to match frontend
      ticketDetails: ticket,
    });
  });
});












// MongoDB setup
const mongoURI = 'mongodb://127.0.0.1:27017/myreview';  // Connect to the MongoDB database
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// MongoDB Review Schema
const reviewSchema = new mongoose.Schema({
  productId: Number,
  productModelName: String,
  productCategory: String,
  productPrice: Number,
  storeID: String,
  storeZip: String,
  storeCity: String,
  storeState: String,
  productOnSale: Boolean,  // Use Boolean for true/false values
  manufacturerName: String,
  manufacturerRebate: Boolean,  // Use Boolean for true/false values
  userID: String,
  userAge: Number,
  userGender: String,
  userOccupation: String,
  reviewRating: Number,
  reviewDate: Date,
  reviewText: String
});

const Review = mongoose.model('Review', reviewSchema);

// MongoDB Ticket Schema
const ticketSchema = new mongoose.Schema({
  ticketNumber: {
     type: Number,
     required: true,
     unique: true
  },
  description: {
     type: String,
     required: true
  },
  imagePath: {
     type: String,
     required: true
  },
  status: {
     type: String,
     default: 'Pending'
  },
  createdAt: {
     type: Date,
     default: Date.now
  },
  decision: {
     type: String,
     enum: ['Refund Order', 'Replace Order', 'Escalate to Human Agent'],  // Example options
     default: 'Pending'
  }
});

// Create a model from the schema
const Ticket = mongoose.model('Ticket', ticketSchema);


// API to handle review submission
app.post('/reviews', async (req, res) => {
  try {
    const reviewData = req.body;

    // Ensure boolean fields default to false if not provided
    reviewData.productOnSale = reviewData.productOnSale || false;
    reviewData.manufacturerRebate = reviewData.manufacturerRebate || false;

    // Create a new review instance
    const newReview = new Review(reviewData);

    // Save the review
    const savedReview = await newReview.save();

    // Return the saved review
    res.status(201).json({ message: 'Review submitted successfully', review: savedReview });
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ message: 'Error saving review', error: err.message });
  }
});

// API to fetch reviews for a specific product (if productId is stored as a number)
app.get('/reviews', async (req, res) => {
  const productId = Number(req.query.productId); // Convert productId to a number

  if (isNaN(productId)) {
    return res.status(400).json({ message: 'Invalid productId provided' });
  }

  try {
    const reviews = await Review.find({ productId: productId });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
});

// Top five most liked products
app.get('/trending/most-liked', async (req, res) => {
  try {
    const topLikedProducts = await Review.aggregate([
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$reviewRating" }
        }
      },
      { $sort: { averageRating: -1 } },
      { $limit: 5 }
    ]);
    res.status(200).json(topLikedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching most liked products', error });
  }
});















// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});