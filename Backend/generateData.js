const axios = require("axios");

// API Keys and URLs
const openAiApiKey = 'API key here';
const productApiUrl = "http://localhost:3001/products";
const reviewApiUrl = "http://localhost:3001/reviews";

// Categories for Product Generation
const categories = [
  "Smart Doorbell",
  "Smart Doorlock",
  "Smart Thermostat",
  "Smart Lighting",
  "Smart Speaker",
];

// Store Location Data
const storeLocations = [
  { storeID: "1", city: "Chicago", state: "Illinois", zip: "60616" },
  { storeID: "2", city: "New York", state: "New York", zip: "10001" },
  { storeID: "3", city: "Los Angeles", state: "California", zip: "90001" },
  { storeID: "4", city: "San Francisco", state: "California", zip: "94102" },
  { storeID: "5", city: "Houston", state: "Texas", zip: "77001" },
  { storeID: "6", city: "Austin", state: "Texas", zip: "73301" },
  { storeID: "7", city: "Miami", state: "Florida", zip: "33101" },
  { storeID: "8", city: "Orlando", state: "Florida", zip: "32801" },
  { storeID: "9", city: "Phoenix", state: "Arizona", zip: "85001" },
  { storeID: "10", city: "Denver", state: "Colorado", zip: "80201" },
  { storeID: "11", city: "Seattle", state: "Washington", zip: "98101" },
  { storeID: "12", city: "Portland", state: "Oregon", zip: "97201" },
  { storeID: "13", city: "Las Vegas", state: "Nevada", zip: "89101" },
  { storeID: "14", city: "Salt Lake City", state: "Utah", zip: "84101" },
  { storeID: "15", city: "Dallas", state: "Texas", zip: "75201" },
  { storeID: "16", city: "Atlanta", state: "Georgia", zip: "30301" },
  { storeID: "17", city: "Boston", state: "Massachusetts", zip: "02101" },
  { storeID: "18", city: "Philadelphia", state: "Pennsylvania", zip: "19101" },
  { storeID: "19", city: "Charlotte", state: "North Carolina", zip: "28201" },
  { storeID: "20", city: "Detroit", state: "Michigan", zip: "48201" },
];

// Keywords for Reviews
const reviewKeywords = {
  "Smart Doorbell": {
    positive: ["easy setup", "real-time alerts", "clear video feed", "user-friendly", "enhanced security"],
    negative: ["slow notifications", "connectivity issues", "privacy concerns", "expensive"],
  },
  "Smart Doorlock": {
    positive: ["secure", "reliable", "easy to install", "modern design"],
    negative: ["battery problems", "app malfunctions", "unlock delays", "jammed lock"],
  },
  "Smart Speaker": {
    positive: ["excellent sound quality", "responsive assistant", "customizable", "intuitive interface"],
    negative: ["limited functionality", "connection lags", "invasive privacy"],
  },
  "Smart Lighting": {
    positive: ["energy-efficient", "aesthetic design", "remote controllability", "customized brightness"],
    negative: ["setup difficulties", "delay in commands", "inconsistent connectivity"],
  },
  "Smart Thermostat": {
    positive: ["cost-saving", "responsive", "smart scheduling", "integrates with other devices"],
    negative: ["setup challenges", "temperature inaccuracies", "app issues"],
  },
};

// Function to Generate Accessories
const generateAccessories = async (category) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [
        { role: "system", content: "Generate accessories for a product in the specified category." },
        { role: "user", content: `Suggest 2-3 accessories for a ${category}.` },
      ],
      max_tokens: 50,
    },
    {
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.choices[0].message.content.trim();
};

// Function to Generate Product Names
const generateRandomProductName = async (category) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [
        { role: "system", content: "Provide unique product names for various categories." },
        { role: "user", content: `Create an engaging name for a product in the "${category}" category.` },
      ],
      max_tokens: 20,
    },
    {
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.choices[0].message.content.trim();
};

// Function to Generate Products
const generateProducts = async () => {
  const products = [];
  for (const category of categories) {
    console.log(`Creating products for: ${category}`);
    for (let i = 1; i <= 10; i++) {
      const name = await generateRandomProductName(category);

      // Generating product description
      const descriptionResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            { role: "system", content: "Craft product descriptions for marketing purposes." },
            { role: "user", content: `Describe the product "${name}" in 45-50 words.` },
          ],
          max_tokens: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${openAiApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const description = descriptionResponse.data.choices[0].message.content.trim();
      const accessories = await generateAccessories(category);

      const product = {
        name,
        price: (Math.random() * 1000).toFixed(2),
        description,
        category,
        accessories,
        image: "https://via.placeholder.com/150",
        discount: Math.random() < 0.5 ? (Math.random() * 50).toFixed(2) : "0.00",
        rebate: Math.random() < 0.5 ? (Math.random() * 30).toFixed(2) : "0.00",
        warranty: Math.random() < 0.5 ? 1 : 0,
      };

      try {
        const response = await axios.post(productApiUrl, product);
        products.push({ id: response.data.productId, ...product });
      } catch (error) {
        console.error(`Failed to add product: ${error.message}`);
      }
    }
  }
  return products;
};

// Function to Generate Reviews
const generateReviews = async (products) => {
  console.log("Generating reviews...");
  for (const product of products) {
    // console.log(`Generating reviews for product: ${product.name}`);
    for (let i = 1; i <= 5; i++) {
      const isPositive = Math.random() < 0.5;
      const keywords = isPositive
        ? reviewKeywords[product.category].positive
        : reviewKeywords[product.category].negative;
      const reviewType = isPositive ? "positive" : "negative";

      // Generate review text using OpenAI API
      const reviewResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a helpful assistant for generating product reviews." },
            {
              role: "user",
              content: `Write a concise, user-friendly ${reviewType} review in 45-50 words for the ${product.name}. Include keywords like ${keywords.join(", ")}.`,
            },
          ],
          max_tokens: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${openAiApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reviewText = reviewResponse.data.choices[0].message.content.trim();
      const location = storeLocations[Math.floor(Math.random() * storeLocations.length)];

      const review = {
        productId: product.id,
        productModelName: product.name,
        productCategory: product.category,
        productPrice: product.price,
        storeID: location.storeID,
        storeZip: location.zip,
        storeCity: location.city,
        storeState: location.state,
        productOnSale: Math.random() < 0.5,
        manufacturerName: `Manufacturer-${Math.floor(Math.random() * 100)}`,
        manufacturerRebate: Math.random() < 0.5,
        userID: `USER-${Math.floor(Math.random() * 10000)}`,
        userAge: Math.floor(Math.random() * 40) + 18,
        userGender: ["Male", "Female", "Other"][Math.floor(Math.random() * 3)],
        userOccupation: ["Engineer", "Teacher", "Student", "Artist", "Developer"][
          Math.floor(Math.random() * 5)
        ],
        reviewRating: Math.floor(Math.random() * 5) + 1,
        reviewDate: new Date(),
        reviewText,
      };

      await axios.post(reviewApiUrl, review);
    //   console.log(`Added review for product ID ${product.id}`);
    }
  }
};

// Main Function to Run the Script
const runSync = async () => {
  try {
    const products = await generateProducts();
    await generateReviews(products);
    console.log("Product and review generation completed.");
  } catch (error) {
    console.error("Error:", error.message);
  }
};

module.exports = runSync;

