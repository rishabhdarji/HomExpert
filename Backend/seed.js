// To generate reviews in the database using chatgpt 

const { MongoClient } = require('mongodb');
const { Client: ElasticClient } = require('@elastic/elasticsearch');
const axios = require('axios');

// ElasticSearch configuration
const mongoUri = 'mongodb://127.0.0.1:27017/myreview';
const dbName = 'productDB';
const collectionName = 'reviews';
const elasticUri = 'http://localhost:9200';
const elasticClient = new ElasticClient({ node: elasticUri });

// OpenAI API Key
const openAiKey = 'api-key-here'; // Replace with your OpenAI API key

// Product data
const productData = [
  { productName: "Smart Doorbell X", category: "advanced smart doorbells" },
  { productName: "Secure Lock Pro", category: "smart doorlock" },
  { productName: "Echo Smart", category: "smart speaker" },
  { productName: "Smart LED Pro", category: "smart lighting" },
  { productName: "Vision Video Pro", category: "video doorbell pro" },
];

// Generate reviews for a product
async function generateReviews(product) {
  const reviews = [];
  for (let i = 0; i < 5; i++) {
    const prompt = `
    Generate a ${i % 2 === 0 ? "positive" : "negative"} review for a ${
      product.category
    } product called "${product.productName}". Keep it concise.
    `;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini', // Cheaper model
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer api-key-here`, // Replace with your OpenAI API key
          'Content-Type': 'application/json',
        },
      }
    );
    reviews.push({
      productId: product.productName,
      productCategory: product.category,
      reviewText: response.data.choices[0].message.content.trim(),
    });
  }
  return reviews;
}

// Generate embeddings for text
async function generateEmbedding(text) {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      model: 'text-embedding-ada-002',
      input: text,
    },
    {
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.data[0].embedding;
}

// Store reviews in MongoDB
async function storeReviewsInMongo(reviews) {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  await collection.insertMany(reviews);
  console.log("Reviews stored in MongoDB.");
  await client.close();
}

// Store embeddings in ElasticSearch
async function storeEmbeddingsInElastic(reviews) {
  for (const review of reviews) {
    const embedding = await generateEmbedding(review.reviewText);
    await elasticClient.index({
      index: "review_embeddings",
      body: {
        productId: review.productId,
        productCategory: review.productCategory,
        reviewText: review.reviewText,
        embedding,
      },
    });
  }
  console.log("Reviews indexed in ElasticSearch.");
}

// Main function
async function main() {
  const allReviews = [];
  for (const product of productData) {
    const reviews = await generateReviews(product);
    allReviews.push(...reviews);
  }
  await storeReviewsInMongo(allReviews);
  await storeEmbeddingsInElastic(allReviews);
}

main()
  .then(() => console.log("Review generation and storage complete."))
  .catch((error) => console.error("Error:", error));
