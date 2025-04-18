const axios = require("axios");
const mongoose = require("mongoose");

const mongoURI = "mongodb://127.0.0.1:27017/myreview"; // Adjust the URI if needed
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");

    // Debugging: List all reviews in the collection
    mongoose.connection.on("connected", async () => {
      const db = mongoose.connection.db;
      const reviewsCollection = db.collection("reviews");
      console.log(
        "Existing reviews:",
        await reviewsCollection.find().toArray()
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if MongoDB connection fails
  });

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
  productOnSale: Boolean,
  manufacturerName: String,
  manufacturerRebate: Boolean,
  userID: String,
  userAge: Number,
  userGender: String,
  userOccupation: String,
  reviewRating: Number,
  reviewDate: Date,
  reviewText: String,
});

const Review = mongoose.model("Review", reviewSchema);

// Generate Reviews for Products
const generateReviews = async () => {
  try {
    const reviews = await Review.find(); // Fetch all reviews
    console.log("Fetched Reviews:", reviews);
    // Fetch product details (replace with your MongoDB product fetching logic)
    const products = await mongoose.connection.db
      .collection("reviews")
      .find()
      .toArray();

      for (const product of products) {
        for (let i = 0; i < 5; i++) { // Ensure exactly 5 reviews per product

        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `
                        Write a detailed product review for the following:
                        Product Name: ${product.productModelName}
                        Category: ${product.productCategory}
                        Price: $${product.productPrice}
                        Include:
                        - Feedback (do not include explicit sentiment like "positive" or "negative")
                        - A rating (1 to 5)
                        - The reviewer's age and occupation`,
              },
            ],
            max_tokens: 50,
            temperature: 0.7,
          },
          {
            headers: {
              // Authorization: `Bearer api-key-here`, // Replace with your OpenAI API key
            },
          }
        );

        const reviewText = response.data.choices[0].message.content.trim();

        // Create a random review data
        const newReview = new Review({
          productId: product.productId,
          productModelName: product.productModelName,
          productCategory: product.productCategory,
          productPrice: product.productPrice,
          storeID: product.storeID || "N/A",
          storeZip: product.storeZip || "N/A",
          storeCity: product.storeCity || "N/A",
          storeState: product.storeState || "N/A",
          productOnSale: product.productOnSale || false,
          manufacturerName: product.manufacturerName || "N/A",
          manufacturerRebate: product.manufacturerRebate || false,
          userID: `user_${Math.floor(Math.random() * 1000000)}`,
          userAge: Math.floor(Math.random() * 50) + 18,
          userGender: Math.random() > 0.5 ? "Male" : "Female",
          userOccupation: [
            "Engineer",
            "Teacher",
            "Designer",
            "Accountant",
            "Photographer",
          ][Math.floor(Math.random() * 5)],
          reviewRating: Math.floor(Math.random() * 5) + 1,
          reviewDate: new Date(),
          reviewText,
        });

        await newReview.save();
        console.log(`Saved review for product: ${product.productModelName}`);
      }
    }
    console.log("All reviews generated and saved.");
  } catch (error) {
    console.error(
      "Error generating reviews:",
      error.response?.data || error.message
    );
  }
};

// Run the script
generateReviews().then(() => mongoose.connection.close());
