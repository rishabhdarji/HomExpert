const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose"); // MongoDB integration
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const xml2js = require("xml2js");
const runSync = require("./generateData"); 
const multer = require("multer");
const axios = require("axios"); // Axios for HTTP requests

require("dotenv").config(); // Load environment variables from the .env file
const { v4: uuidv4 } = require("uuid"); // UUID for generating unique IDs
const path = require("path");

const app = express(); // Initialize the application

app.use(express.json());

// Middleware configuration
app.use(bodyParser.json());
app.use(cors());

const port = 3001;

// Establish a connection to the MySQL database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rishabh", // Use your MySQL root password
  database: "smarthome",
});

// Connect to MySQL and execute the setup processes
db.connect(async (err) => {
  if (err) {
    console.error("Unable to connect to MySQL database:", err.stack);
    return;
  }
  console.log("Successfully connected to the MySQL database");

  try {
    // Step 1: Generate product and review data
    console.log("Initiating data generation...");
    await runSync();
    console.log("Data generation process completed.");

    // Step 2: Generate embeddings for products
    console.log("Starting the embedding process for products...");
    await fetch("http://localhost:3001/generate-embeddings", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => console.log("Product embeddings updated successfully:", data))
      .catch((error) => {
        throw new Error("An error occurred during product embedding generation: " + error.message);
      });

    // Step 3: Generate embeddings for reviews
    console.log("Starting the embedding process for reviews...");
    await fetch("http://localhost:3001/generate-review-embeddings", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => console.log("Review embeddings updated successfully:", data))
      .catch((error) => {
        throw new Error("An error occurred during review embedding generation: " + error.message);
      });

    // Step 4: Run synchronization tasks
    console.log("Starting synchronization tasks...");
    // loadProductsFromXMLToHashMap(); // Uncomment and implement if required
    // syncHashMapWithMySQL(); // Uncomment and implement if required
    syncProductsToElasticSearch();
    syncReviewsToElasticSearch();
    console.log("Synchronization tasks completed successfully.");
  } catch (error) {
    console.error("An error occurred during initialization:", error.message);
  }
});




const { Client } = require("@elastic/elasticsearch");
const elasticClient = new Client({ 
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true
});



// Endpoint to register a new user
app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  // Encrypt the password before saving it to the database
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(query, [name, email, hashedPassword, role], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to register user",
        error: err,
      });
    }
    return res.status(200).json({ message: "User successfully registered" });
  });
});

// Endpoint to log in an existing user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate that both email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Query to find the user by their email address
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    // Check if a user exists with the given email
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    // Compare provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Successful login: return user details
      res.status(200).json({
        message: "Login successful",
        id: user.id, // Include the user ID
        role: user.role,
        email: user.email,
        name: user.name,
      });
    });
  });
});

// Endpoint to retrieve products, with optional filtering by category
app.get("/products", (req, res) => {
  const category = req.query.category;

  let query = "SELECT * FROM products";
  if (category) {
    query += " WHERE category = ?";
  }

  db.query(query, [category], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to retrieve products",
        error: err,
      });
    }

    // console.log("Products retrieved:", results); // Uncomment for debugging
    return res.status(200).json(results);
  });
});

// Endpoint to add a new product
app.post("/products", (req, res) => {
  const {
    name,
    price,
    description,
    category,
    accessories,
    image,
    discount,
    rebate,
    warranty,
  } = req.body;

  const query = `INSERT INTO products (name, price, description, category, accessories, image, discount, rebate, warranty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    query,
    [
      name,
      price,
      description,
      category,
      accessories,
      image,
      discount,
      rebate,
      warranty,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting product:", err);
        return res.status(500).json({ message: "Failed to add product" });
      }
      res.status(201).json({
        message: "Product added successfully",
        productId: result.insertId,
      });
    }
  );
});

// Endpoint to update an existing product by its ID
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, description, category, accessories, image } = req.body;

  const query = `
    UPDATE products 
    SET name = ?, price = ?, description = ?, category = ?, accessories = ?, image = ? 
    WHERE id = ?`;

  db.query(query, [name, price, description, category, accessories, image, id], (err, result) => {
    if (err) {
      console.error("Error while updating the product:", err);
      return res.status(500).json({ message: "Failed to update the product" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product updated successfully" });
  });
});

// Endpoint to delete a product by its ID
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;

  console.log("Request to delete product with ID:", id); // Log ID for debugging
  const query = `DELETE FROM products WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error while deleting the product:", err);
      return res.status(500).json({ message: "Failed to delete the product" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  });
});

// Endpoint to place an order
app.post("/place-order", (req, res) => {
  const {
    userId,
    totalPrice,
    deliveryMethod,
    storeLocation,
    deliveryDate,
    cartItems,
    address,
    creditCard,
  } = req.body;

  console.log("Order request payload:", req.body); // Log request data for debugging

  // Validate the presence of required order details
  if (!userId || !totalPrice || !deliveryMethod || !cartItems || !address || !creditCard) {
    return res.status(400).json({ message: "Required order details are missing" });
  }

  console.log("All required fields are present. Proceeding to database operations");

  // Query to insert a new order into the orders table
  const orderQuery = `
      INSERT INTO orders 
      (user_id, total_price, delivery_method, store_location, status, delivery_date, product_id, quantity)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)`;

  cartItems.forEach((item) => {
    console.log("Processing order for product ID:", item.product_id);

    // Insert each product in the cart as an individual order entry
    db.query(
      orderQuery,
      [
        userId,
        totalPrice,
        deliveryMethod,
        storeLocation,
        deliveryDate,
        item.product_id,
        item.quantity,
      ],
      (err, result) => {
        if (err) {
          console.error("Error while inserting into orders table:", err);
          return res
            .status(500)
            .json({ message: "Failed to place the order", error: err.message });
        }

        const orderId = result.insertId;
        console.log("New order created with ID:", orderId);

        // Reduce stock for the ordered product
        const stockUpdateQuery = `
            UPDATE products 
            SET stock = stock - ? 
            WHERE id = ?`;

        db.query(stockUpdateQuery, [item.quantity, item.product_id], (err) => {
          if (err) {
            console.error("Error while updating product stock:", err);
            return res.status(500).json({
              message: "Failed to update stock",
              error: err.message,
            });
          }

          console.log(`Stock updated for product ID: ${item.product_id}`);
        });

        // Insert order details into the CustomerOrder table
        const customerOrderQuery = `
            INSERT INTO CustomerOrder 
            (userName, orderName, orderPrice, userAddress, creditCardNo)
            VALUES ?`;

        const orderItems = [
          [
            userId, // Assuming `userId` maps to `userName`, adjust if needed
            item.name,
            item.price,
            address,
            creditCard,
          ],
        ];

        console.log("Order details for CustomerOrder table:", orderItems);

        db.query(customerOrderQuery, [orderItems], (err) => {
          if (err) {
            console.error(
              "Error while inserting into CustomerOrder table:",
              err
            );
            return res.status(500).json({
              message: "Failed to save order details",
              error: err.message,
            });
          }

          console.log("Order details successfully saved to CustomerOrder table");
        });
      }
    );
  });

  res.status(200).json({ message: "Order placed successfully" });
});



// Endpoint to retrieve past orders for a specific user
app.get("/past-orders/:userId", (req, res) => {
  const userId = req.params.userId; // Get the user ID from the request parameters

  const query = `
    SELECT id, total_price, delivery_method, status, delivery_date
    FROM orders
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Failed to fetch past orders:", err);
      return res.status(500).json({ message: "Could not retrieve past orders" });
    }

    res.status(200).json(results); // Return the retrieved orders as a JSON response
  });
});

// Endpoint to cancel an order by its ID
app.delete("/cancel-order/:orderId", (req, res) => {
  const orderId = req.params.orderId;
  console.log("Request received to delete order with ID:", orderId); // Log order ID for debugging purposes

  const query = `
    DELETE FROM orders
    WHERE id = ?
  `;

  db.query(query, [orderId], (err, result) => {
    if (err) {
      console.error("Error while deleting the order:", err);
      return res.status(500).json({ message: "Failed to delete the order" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order cancelled successfully" });
  });
});

// Endpoint to add a new customer
app.post("/customers", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Encrypt the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the customer details into the database
    const query =
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "customer")';
    db.query(query, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error while creating customer:", err);
        return res.status(500).json({ message: "Unable to create customer" });
      }
      res.status(201).json({ message: "Customer created successfully" });
    });
  } catch (error) {
    console.error("Error while hashing password:", error);
    return res.status(500).json({ message: "Password encryption failed" });
  }
});

// Endpoint to fetch a list of all customers
app.get("/customers", (req, res) => {
  const query = 'SELECT * FROM users WHERE role = "customer"';
  db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch customers:", err);
      return res.status(500).json({ message: "Could not fetch customers" });
    }
    res.status(200).json(results); // Send the list of customers as JSON
  });
});

// Endpoint to add a new order
app.post("/orders", (req, res) => {
  const {
    user_id,
    total_price,
    delivery_method,
    store_location,
    delivery_date,
  } = req.body;

  const query =
    "INSERT INTO orders (user_id, total_price, delivery_method, store_location, delivery_date) VALUES (?, ?, ?, ?, ?)";
  db.query(
    query,
    [user_id, total_price, delivery_method, store_location, delivery_date],
    (err, result) => {
      if (err) {
        console.error("Error while adding order:", err);
        return res.status(500).json({ message: "Unable to add order" });
      }
      res.status(201).json({ message: "Order created successfully" });
    }
  );
});

// Endpoint to fetch all orders
app.get("/orders", (req, res) => {
  const query = "SELECT * FROM orders";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to retrieve orders:", err);
      return res.status(500).json({ message: "Could not fetch orders" });
    }
    res.status(200).json(results); // Send the list of orders as a JSON response
  });
});

// Endpoint to update an existing order
app.put("/orders/:id", (req, res) => {
  const { id } = req.params;
  const { total_price, delivery_method, store_location, delivery_date } =
    req.body;

  const query = `
    UPDATE orders 
    SET total_price = ?, delivery_method = ?, store_location = ?, delivery_date = ? 
    WHERE id = ?`;

  db.query(
    query,
    [total_price, delivery_method, store_location, delivery_date, id],
    (err, result) => {
      if (err) {
        console.error("Error while updating order:", err);
        return res.status(500).json({ message: "Failed to update order" });
      }
      res.status(200).json({ message: "Order updated successfully" });
    }
  );
});

// Endpoint to delete an order by ID
app.delete("/orders/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM orders WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error while deleting order:", err);
      return res.status(500).json({ message: "Failed to delete order" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  });
});

// Endpoint to fetch details of a specific product by ID
app.get("/products/:id", (req, res) => {
  const productId = req.params.id;

  const query = "SELECT * FROM products WHERE id = ?";
  db.query(query, [productId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Could not fetch product details",
        error: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(result[0]); // Return the product details in the response
  });
});

// Endpoint to get the top five zip codes with the highest product sales
app.get("/trending/top-zipcodes", async (req, res) => {
  try {
    const query = `
      SELECT store_location, COUNT(store_location) AS totalOrders 
      FROM orders 
      GROUP BY store_location 
      ORDER BY totalOrders DESC 
      LIMIT 5`;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error while executing query for top zip codes:", err);
        return res.status(500).json({
          message: "Could not retrieve top zip codes",
          error: err.message,
        });
      }
      console.log("Top zip codes result:", results); // Log the query results
      res.status(200).json(results); // Send the top zip codes as a response
    });
  } catch (err) {
    console.error("Unexpected error occurred:", err); // Log unexpected errors
    res.status(500).json({
      message: "An error occurred while fetching top zip codes",
      error: err.message,
    });
  }
});

// Endpoint to get the top five most sold products
app.get("/trending/most-sold", async (req, res) => {
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
        console.error("Error while fetching most sold products:", err);
        return res.status(500).json({
          message: "Unable to fetch most sold products",
          error: err.message,
        });
      }
      console.log("Most sold products result:", results); // Log results for debugging
      res.status(200).json(results);
    });
  } catch (err) {
    console.error("Unexpected error occurred:", err); // Log unexpected errors
    res.status(500).json({
      message: "Error while fetching most sold products",
      error: err.message,
    });
  }
});

// Endpoint to retrieve store locations
app.get("/store-locations", (req, res) => {
  const query = "SELECT * FROM store_locations"; // Replace with the correct table name for store locations

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error while retrieving store locations:", err);
      return res
        .status(500)
        .json({ message: "Unable to fetch store locations" });
    }
    res.status(200).json(results); // Return the store locations
  });
});

// Endpoint to fetch accessories for a specific product
app.get("/accessories", (req, res) => {
  const productId = req.query.productId; // Extract productId from query parameters

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const query = "SELECT * FROM accessories WHERE product_id = ?";
  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Error while fetching accessories:", err);
      return res
        .status(500)
        .json({ message: "Unable to fetch accessories", error: err.message });
    }
    res.status(200).json(results); // Return the accessories data
  });
});

// Endpoint to fetch all products with their stock levels
app.get("/inventory/products", (req, res) => {
  const query = `
    SELECT name, price, stock 
    FROM products
    ORDER BY name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error while retrieving inventory data:", err);
      return res
        .status(500)
        .json({ message: "Unable to fetch inventory data", error: err.message });
    }
    res.status(200).json(results); // Return the inventory data
  });
});

// Endpoint to fetch product names and stock levels for a bar chart
app.get("/inventory/products/bar-chart", (req, res) => {
  const query = `
    SELECT name, stock 
    FROM products
    ORDER BY name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error while fetching data for bar chart:", err);
      return res
        .status(500)
        .json({ message: "Unable to fetch bar chart data", error: err.message });
    }
    res.status(200).json(results); // Return the data for visualization
  });
});

// Endpoint to fetch all products currently on sale (with a discount)
app.get("/inventory/products/sale", (req, res) => {
  const query = `
    SELECT name, price, discount
    FROM products
    WHERE discount IS NOT NULL
    ORDER BY name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch products on sale:", err);
      return res.status(500).json({
        message: "Unable to retrieve products on sale",
        error: err.message,
      });
    }
    res.status(200).json(results); // Send the list of discounted products
  });
});

// Endpoint to fetch all products with manufacturer rebates
app.get("/inventory/products/rebates", (req, res) => {
  const query = `
    SELECT name, price, rebate
    FROM products
    WHERE rebate IS NOT NULL
    ORDER BY name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch products with rebates:", err);
      return res.status(500).json({
        message: "Unable to retrieve products with rebates",
        error: err.message,
      });
    }
    res.status(200).json(results); // Return products with rebates
  });
});

// Endpoint to fetch product sales report (name, price, items sold, and total sales)
app.get("/sales-report/products-sold", (req, res) => {
  const query = `
    SELECT p.name, p.price, COUNT(o.id) AS items_sold, 
           SUM(o.total_price) AS total_sales
    FROM orders o
    JOIN products p ON o.product_id = p.id
    GROUP BY p.name, p.price
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch sold product data:", err);
      return res.status(500).json({
        message: "Unable to retrieve product sales data",
        error: err.message,
      });
    }
    res.status(200).json(results); // Return sales report for products
  });
});

// Endpoint to fetch product sales chart data (product names and total sales)
app.get("/sales-report/products-sales-chart", (req, res) => {
  const query = `
    SELECT p.name, SUM(o.total_price) AS total_sales
    FROM orders o
    JOIN products p ON o.product_id = p.id
    GROUP BY p.name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch sales chart data:", err);
      return res.status(500).json({
        message: "Unable to retrieve sales chart data",
        error: err.message,
      });
    }
    res.status(200).json(results); // Send data for sales chart visualization
  });
});

// Endpoint to fetch total daily sales transactions
app.get("/sales-report/daily-sales", (req, res) => {
  const query = `
    SELECT DATE(o.order_date) AS date, SUM(o.total_price) AS total_sales
    FROM orders o
    GROUP BY DATE(o.order_date)
    ORDER BY date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch daily sales data:", err);
      return res.status(500).json({
        message: "Unable to retrieve daily sales data",
        error: err.message,
      });
    }
    res.status(200).json(results); // Send daily sales data as JSON
  });
});

// Endpoint for search auto-completion
app.get("/autocomplete", (req, res) => {
  const searchTerm = req.query.q; // Extract the search term from query parameters

  // Query to fetch matching product names
  const query = `
    SELECT id, name 
    FROM products 
    WHERE name LIKE ? 
    LIMIT 10
  `;

  db.query(query, [`%${searchTerm}%`], (err, results) => {
    if (err) {
      console.error("Failed to fetch autocomplete suggestions:", err);
      return res.status(500).json({
        message: "Unable to retrieve autocomplete suggestions",
        error: err.message,
      });
    }
    res.json(results); // Return product id and name in the response
  });
});

// Ticket-related functionality starts here

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create the upload directory if it doesn't exist
    }
    cb(null, uploadDir); // Set the upload destination
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`; // Generate a unique name for the uploaded file
    cb(null, uniqueName);
  },
});
const upload = multer({ storage }); // Initialize Multer with the configured storage

// Utility function to encode an image file as a base64 string
function encodeImage(imagePath) {
  const image = fs.readFileSync(imagePath); // Read the image file from the given path
  return image.toString("base64"); // Convert the image to base64 format
}

// POST route for creating a new ticket
app.post("/tickets", upload.single("image"), async (req, res) => {
  const { name, email, category, description } = req.body;
  const image = req.file;
  const ticketNumber = "TICKET-" + uuidv4();

  // Ensure all required fields are provided
  if (!name || !email || !category || !description || !image) {
    return res.status(400).json({
      message: "All fields, including an image, are required",
    });
  }

  const imagePath = path.join("uploads", image.filename);
  const base64Image = encodeImage(imagePath);

  try {
    // Send the image to OpenAI for processing and generating a description
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe the image." },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // Replace with your OpenAI API key
          "Content-Type": "application/json",
        },
      }
    );

    const imageDescription = response.data.choices[0].message.content.trim();

    // Generate a decision based on the image description
    const decisionPrompt = `Given the following image description: "${imageDescription}", determine the appropriate action.`;

    const decisionResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: decisionPrompt },
        ],
        max_tokens: 50,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // Replace with your OpenAI API key
          "Content-Type": "application/json",
        },
      }
    );

    const decision = decisionResponse.data.choices[0].message.content.trim();

    let status = "Undetermined";
    if (decision.includes("Refund Order")) status = "Refund Order";
    else if (decision.includes("Replace Order")) status = "Replace Order";
    else if (decision.includes("Escalate to Human Agent"))
      status = "Escalate to Human Agent";

    // Insert the ticket details into the database
    const query = `INSERT INTO tickets (name, email, category, description, image, ticket_number, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      query,
      [name, email, category, description, imagePath, ticketNumber, status],
      (err, result) => {
        if (err) {
          console.error("Error creating ticket:", err);
          return res.status(500).json({ message: "Failed to create ticket" });
        }
        res.status(201).json({
          message: "Ticket created successfully",
          ticketNumber,
          status,
        });
      }
    );
  } catch (error) {
    console.error("Error processing image or decision with OpenAI:", error);
    res.status(500).json({
      message: "Failed to process the image or make a decision",
    });
  }
});

// GET route to fetch ticket details and status
app.get("/tickets/status/:ticketNumber", (req, res) => {
  const ticketNumber = req.params.ticketNumber;

  const query = "SELECT * FROM tickets WHERE ticket_number = ?";

  db.query(query, [ticketNumber], (err, results) => {
    if (err) {
      console.error("Error retrieving ticket:", err);
      return res.status(500).json({ message: "Failed to fetch ticket details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const ticket = results[0];
    res.status(200).json({
      message: "Ticket details retrieved successfully",
      decision: ticket.status, // Matches the expected field for frontend
      ticketDetails: ticket,
    });
  });
});



// Assignment 5 from here 
// Endpoint to generate semantic embeddings for products
app.post("/generate-embeddings", async (req, res) => {
  try {
    // Query to retrieve products that do not yet have embeddings
    const fetchProductsQuery = `SELECT id, name, description FROM products WHERE embedding IS NULL`;
    db.query(fetchProductsQuery, async (dbError, products) => {
      if (dbError) {
        console.error("Database error while fetching product data:", dbError);
        return res
          .status(500)
          .json({ error: "Unable to fetch product data from the database." });
      }

      const processedVectors = [];
      for (const product of products) {
        const { id: productId, name: productName, description: productDescription } = product;
        const contentForEmbedding = `${productName}. ${productDescription}`;

        try {
          // Send a request to OpenAI to generate embeddings
          const embeddingResponse = await axios.post(
            "https://api.openai.com/v1/embeddings",
            {
              input: contentForEmbedding,
              model: "text-embedding-3-small",
            },
            {
              headers: {
                Authorization: `Bearer YOUR_API_KEY`, // Replace with your OpenAI API key
                "Content-Type": "application/json",
              },
            }
          );

          const embeddingVector = embeddingResponse.data.data[0].embedding;
          const vectorString = embeddingVector.join(",");

          // Update the product's embedding in the database
          db.query(
            `UPDATE products SET embedding = ? WHERE id = ?`,
            [vectorString, productId],
            (updateError) => {
              if (updateError) {
                console.error(
                  `Failed to update embedding for product ID ${productId}:`,
                  updateError.message
                );
              }
            }
          );

          processedVectors.push({ productId, embedding: embeddingVector });
        } catch (apiError) {
          console.error(
            `Error generating embedding for product ID ${productId}:`,
            apiError.message
          );
        }
      }

      res
        .status(200)
        .json({
          message: "Embeddings generated successfully.",
          vectors: processedVectors,
        });
    });
  } catch (error) {
    console.error("An error occurred during the embedding generation process:", error.message);
    res.status(500).json({ error: "Failed to generate embeddings." });
  }
});



// POST endpoint for product recommendations
app.post("/recommend-products", async (req, res) => {
  const { query } = req.body;

  // Validate the presence of the query parameter
  if (!query) {
    return res.status(400).json({ error: "A search query is required." });
  }

  try {
    // Generate an embedding for the user's query using OpenAI API
    const openAIResponse = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        input: query,
        model: "text-embedding-3-small",
      },
      {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // Replace with your OpenAI API key
          "Content-Type": "application/json",
        },
      }
    );

    const userQueryEmbedding = openAIResponse.data.data[0].embedding;

    // Use the generated embedding to search in Elasticsearch
    const elasticsearchResponse = await axios.post(
      "http://localhost:9200/products/_search",
      {
        size: 10, // Limit the number of returned results
        query: {
          bool: {
            must: [
              {
                script_score: {
                  query: { match_all: {} }, // Match all products
                  script: {
                    source:
                      "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                    params: { query_vector: userQueryEmbedding },
                  },
                },
              },
            ],
            should: [
              {
                match: {
                  name: {
                    query, // Boost results matching the name
                    boost: 2.0,
                  },
                },
              },
              {
                match: {
                  description: {
                    query, // Boost results matching the description
                    boost: 1.5,
                  },
                },
              },
            ],
          },
        },
        collapse: {
          field: "id", // Ensure unique results by collapsing on product ID
        },
        sort: [{ _score: "desc" }], // Sort by relevance score
        _source: ["id", "name", "description", "category", "price"], // Return only specific fields
      }
    );

    // Process results to remove duplicates
    const uniqueResults = new Set();
    const recommendations = elasticsearchResponse.data.hits.hits
      .map((hit) => ({
        id: hit._source.id,
        name: hit._source.name,
        description: hit._source.description,
        category: hit._source.category,
        price: hit._source.price,
        score: hit._score,
      }))
      .filter((result) => {
        const isDuplicate = uniqueResults.has(result.id);
        uniqueResults.add(result.id);
        return !isDuplicate;
      });

    // Respond with the recommendations
    res.status(200).json({
      recommendations,
      total: recommendations.length,
      query,
    });
  } catch (err) {
    console.error(
      "Error during product recommendation generation:",
      err.response?.data || err.message
    );
    res.status(500).json({
      error: "Failed to generate product recommendations",
      details: err.response?.data || err.message,
    });
  }
});

// MongoDB connection setup
const mongoURI = "mongodb://127.0.0.1:27017/myreview"; // MongoDB connection string
mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// MongoDB schema for reviews
const reviewSchema = new mongoose.Schema({
  productId: Number,
  productModelName: String,
  productCategory: String,
  productPrice: Number,
  storeID: String,
  storeZip: String,
  storeCity: String,
  storeState: String,
  productOnSale: Boolean, // Boolean for products on sale
  manufacturerName: String,
  manufacturerRebate: Boolean, // Boolean for manufacturer rebates
  userID: String,
  userAge: Number,
  userGender: String,
  userOccupation: String,
  reviewRating: Number,
  reviewDate: Date,
  reviewText: String,
  embedding: { type: [Number], default: null }, // Store embedding as an array
});

// MongoDB model for reviews
const Review = mongoose.model("Review", reviewSchema);


// MongoDB Schema for Tickets
const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  decision: {
    type: String,
    enum: ["Refund Order", "Replace Order", "Escalate to Human Agent"], // Possible decision options
    default: "Pending",
  },
});

// Create a Ticket model from the schema
const Ticket = mongoose.model("Ticket", ticketSchema);

// API to handle submission of reviews
app.post("/reviews", async (req, res) => {
  try {
    const reviewData = req.body;

    // Set default values for boolean fields if not provided
    reviewData.productOnSale = reviewData.productOnSale || false;
    reviewData.manufacturerRebate = reviewData.manufacturerRebate || false;

    // Generate an embedding for the review text using OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        input: reviewData.reviewText,
        model: "text-embedding-3-small",
      },
      {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // Replace with your OpenAI API key
          "Content-Type": "application/json",
        },
      }
    );

    const embedding = response.data.data[0].embedding;

    // Attach the generated embedding to the review data
    reviewData.embedding = embedding;

    // Create a new review instance using the provided data
    const newReview = new Review(reviewData);

    // Save the new review to the database
    const savedReview = await newReview.save();

    res.status(201).json({
      message: "Review submitted successfully",
      review: savedReview,
    });
  } catch (err) {
    console.error("Error while saving the review:", err.message);
    res.status(500).json({
      message: "Failed to save the review",
      error: err.message,
    });
  }
});

// API to retrieve reviews for a specific product
app.get("/reviews", async (req, res) => {
  const productId = Number(req.query.productId); // Convert productId to a numeric type

  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid productId provided" });
  }

  try {
    const reviews = await Review.find({ productId: productId });
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error while fetching reviews:", err.message);
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: err.message,
    });
  }
});

// Endpoint to fetch the top five most liked products
app.get("/trending/most-liked", async (req, res) => {
  try {
    const topLikedProducts = await Review.aggregate([
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$reviewRating" },
        },
      },
      { $sort: { averageRating: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json(topLikedProducts);
  } catch (error) {
    console.error("Error retrieving most liked products:", error.message);
    res.status(500).json({
      message: "Unable to fetch most liked products",
      error: error.message,
    });
  }
});

// Function to synchronize reviews to ElasticSearch
const syncReviewsToElasticSearch = async () => {
  try {
    console.log("Beginning review synchronization...");

    // Fetch reviews from MongoDB that have not been synced yet
    const reviews = await Review.find({ synced: { $ne: true } });

    for (const review of reviews) {
      try {
        const {
          reviewText,
          productId,
          productModelName,
          productCategory,
          productPrice,
          storeID,
          storeZip,
          storeCity,
          storeState,
          productOnSale,
          manufacturerName,
          manufacturerRebate,
          userID,
          userAge,
          userGender,
          userOccupation,
          reviewRating,
          reviewDate,
        } = review;

        // Generate an embedding for the review text if it exists
        let embedding = [];
        if (reviewText) {
          const embeddingResponse = await axios.post(
            "https://api.openai.com/v1/embeddings",
            {
              model: "text-embedding-ada-002",
              input: reviewText,
            },
            {
              headers: {
                Authorization: `Bearer YOUR_API_KEY`, // Replace with your OpenAI API key
              },
            }
          );
          embedding = embeddingResponse.data.data[0].embedding;
        }

        // Prepare the review document for ElasticSearch
        const reviewDocument = {
          productId: productId || null,
          productModelName: productModelName || null,
          productCategory: productCategory || null,
          productPrice: productPrice || null,
          storeID: storeID || null,
          storeZip: storeZip || null,
          storeCity: storeCity || null,
          storeState: storeState || null,
          productOnSale: productOnSale || null,
          manufacturerName: manufacturerName || null,
          manufacturerRebate: manufacturerRebate || null,
          userID: userID || null,
          userAge: userAge || null,
          userGender: userGender || null,
          userOccupation: userOccupation || null,
          reviewRating: reviewRating || null,
          reviewDate: reviewDate || null,
          reviewText: reviewText || null,
          embedding,
        };

        const elasticResponse = await axios.post(
          `https://localhost:9202/reviews/_doc/${review._id}`,
          reviewDocument,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${Buffer.from(
                "elastic:YourElasticPassword"
              ).toString("base64")}`,
            },
            httpsAgent: new require("https").Agent({
              rejectUnauthorized: false,
            }),
          }
        );

        if (elasticResponse.status === 201 || elasticResponse.status === 200) {
          // Mark the review as synced in MongoDB
          await Review.updateOne(
            { _id: review._id },
            { $set: { synced: true } }
          );
          console.log(`Review ID ${review._id} synced successfully.`);
        }
      } catch (error) {
        console.error(
          `Error syncing review ID ${review._id}:`,
          error.message
        );
      }
    }

    console.log("Review synchronization process completed.");
  } catch (error) {
    console.error(
      "Error occurred during review synchronization to ElasticSearch:",
      error.message
    );
  }
};


// Function to synchronize products from MySQL to ElasticSearch
const syncProductsToElasticSearch = async () => {
  try {
    console.log("Fetching products from the MySQL database...");

    // SQL query to fetch products with embeddings
    const query =
      "SELECT id, name, description, embedding FROM PRODUCTS WHERE embedding IS NOT NULL";
    db.query(query, async (err, results) => {
      if (err) {
        console.error("Error while retrieving products from MySQL:", err.message);
        return;
      }

      console.log(`Retrieved ${results.length} products. Starting sync to ElasticSearch...`);

      for (const product of results) {
        try {
          // Prepare data for ElasticSearch
          const { id, name, description, embedding } = product;
          const embeddingArray = embedding.split(",").map(Number); // Convert embedding string to an array of numbers

          const payload = {
            id,
            name,
            description,
            embedding: embeddingArray,
          };

          // Upload the product to ElasticSearch
          await axios.post("http://localhost:9200/products/_doc", payload);
          console.log(`Successfully synced product ID ${id} to ElasticSearch`);
        } catch (uploadError) {
          console.error(
            `Failed to sync product ID ${product.id} to ElasticSearch:`,
            uploadError.message
          );
        }
      }

      console.log("Product synchronization to ElasticSearch completed.");
    });
  } catch (error) {
    console.error("Error occurred during product sync:", error.message);
  }
};

// Route to search for reviews using similarity
app.post("/search-reviews", async (req, res) => {
  const { query } = req.body;

  // Validate input
  if (!query) {
    return res.status(400).json({ message: "Search query is required." });
  }

  try {
    // Generate an embedding for the search query using OpenAI
    const embeddingResponse = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        model: "text-embedding-ada-002",
        input: query,
      },
      {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // Replace with your OpenAI API key
        },
      }
    );

    const queryEmbedding = embeddingResponse.data.data[0].embedding;

    // Search ElasticSearch for reviews with similar embeddings
    const elasticResponse = await axios.post(
      "https://localhost:9202/reviews/_search",
      {
        knn: {
          field: "embedding",
          query_vector: queryEmbedding,
          k: 5, // Return top 5 similar reviews
          num_candidates: 100, // Candidate pool size
        },
        _source: [
          "productId",
          "productModelName",
          "productCategory",
          "productPrice",
          "storeID",
          "storeZip",
          "storeCity",
          "storeState",
          "productOnSale",
          "manufacturerName",
          "manufacturerRebate",
          "userID",
          "userAge",
          "userGender",
          "userOccupation",
          "reviewRating",
          "reviewDate",
          "reviewText",
          "embedding",
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
        auth: {
          username: "elastic",
          password: "YOUR_ELASTIC_PASSWORD", // Replace with your ElasticSearch password
        },
      }
    );

    // Format the results for the response
    const results = elasticResponse.data.hits.hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source, // Include all source fields
    }));

    res.status(200).json({ results });
  } catch (error) {
    console.error("Error while searching reviews:", error.message);
    res.status(500).json({ message: "Failed to search reviews." });
  }
});




// Endpoint to generate embeddings for reviews
app.post("/generate-review-embeddings", async (req, res) => {
  try {
    // Retrieve all reviews that do not yet have embeddings
    const reviewsWithoutEmbedding = await Review.find({ embedding: null });

    if (reviewsWithoutEmbedding.length === 0) {
      return res.status(200).json({
        message: "All reviews already have embeddings.",
      });
    }

    for (const review of reviewsWithoutEmbedding) {
      try {
        // Request embedding generation from OpenAI API
        const response = await axios.post(
          "https://api.openai.com/v1/embeddings",
          {
            input: review.reviewText,
            model: "text-embedding-3-small",
          },
          {
            headers: {
              Authorization: `Bearer YOUR_API_KEY`, // Replace with your OpenAI API key
              "Content-Type": "application/json",
            },
          }
        );

        const embedding = response.data.data[0].embedding;

        // Save the generated embedding to the review
        review.embedding = embedding;
        await review.save();
      } catch (error) {
        console.error(
          `Error generating embedding for review ID ${review._id}:`,
          error.message
        );
      }
    }

    res.status(200).json({
      message: "Embeddings successfully generated for reviews.",
    });
  } catch (error) {
    console.error("Error during review embedding generation:", error.message);
    res.status(500).json({
      message: "Failed to generate embeddings",
      error: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

