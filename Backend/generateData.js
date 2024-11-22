const axios = require("axios");

const openAiApiKey = "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"; // Replace with your OpenAI API key
const productApiUrl = "http://localhost:3001/products";
const reviewApiUrl = "http://localhost:3001/reviews";

const categories = [
  "Smart Doorbell",
  "Smart Doorlock",
  "Smart Thermostat",
  "Smart Lighting",
  "Smart Speaker",
];

// Store Locations Data
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

// Review Keywords
const reviewKeywords = {
  "Smart Doorbell": {
    positive: ["convenient", "secure", "real-time", "reliable", "clear video"],
    negative: ["glitchy", "slow alerts", "poor connection", "privacy concerns"],
  },
  "Smart Doorlock": {
    positive: ["secure", "convenient", "remote access", "easy install"],
    negative: ["battery drain", "app issues", "unreliable", "lock jams"],
  },
  "Smart Speaker": {
    positive: ["responsive", "good sound", "versatile", "user-friendly"],
    negative: ["poor privacy", "limited commands", "connectivity issues"],
  },
  "Smart Lighting": {
    positive: ["customizable", "energy-efficient", "remote control", "mood-enhancing"],
    negative: ["app problems", "delay", "connectivity issues", "limited brightness"],
  },
  "Smart Thermostat": {
    positive: ["energy-saving", "easy to use", "efficient", "remote control"],
    negative: ["difficult setup", "temperature inaccuracy", "app bugs", "connectivity issues"],
  },
};

// Function to Generate Accessories Using OpenAI
const generateAccessories = async (category) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant for generating product accessories." },
        {
          role: "user",
          content: `Generate a list of 2-3 unique accessories for a ${category}.`,
        },
      ],
      max_tokens: 50,
    },
    {
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.choices[0].message.content.trim();
};

const generateRandomProductName = async (category) => {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a creative assistant for generating unique product names." },
          {
            role: "user",
            content: `Generate a unique and catchy name for a product in the category "${category}". Keep it concise and engaging.`,
          },
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

const generateProducts = async () => {
    const products = [];
    for (const category of categories) {
      console.log(`Generating products for category: ${category}`);
      for (let i = 1; i <= 10; i++) {
        const name = await generateRandomProductName(category);
  
        // Generate product description using OpenAI API
        const descriptionResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4",
            messages: [
              { role: "system", content: "You are a helpful assistant for generating concise product descriptions." },
              { role: "user", content: `Write a concise, engaging product description in 45-50 words for a ${name}.` },
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
  
        // Use the exact ENUM value for the category
        const product = {
          name,
          price: (Math.random() * 1000).toFixed(2),
          description,
          category, 
          accessories,
          image: "https://via.placeholder.com/150",
          discount: Math.random() < 0.5 ? (Math.random() * 50).toFixed(2) : "0.00", // Default to "0.00" if null
          rebate: Math.random() < 0.5 ? (Math.random() * 30).toFixed(2) : "0.00",  // Default to "0.00" if null
          warranty: Math.random() < 0.5 ? 1 : 0,
        };
  
        try {
          const response = await axios.post(productApiUrl, product);
        //   console.log(`Added product: ${product.name}`);
          products.push({ id: response.data.productId, ...product });
        } catch (error) {
          console.error(`Error adding product: ${error.message}`);
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

