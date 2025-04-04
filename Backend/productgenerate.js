const axios = require('axios');
const mysql = require('mysql2/promise'); // Use MySQL with promises

const openAiKey = 'YOUR_OPENAI_API_KEY';

// MySQL Database Configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'rishabh',
    database: 'smarthome',
};

// Generate Product Descriptions
const generateProductDescriptions = async () => {
    const categories = [
        'advanced smart doorbells',
        'smart doorlock',
        'smart lighting',
        'smart speaker',
        'video doorbell pro',
    ];

    const generatedProducts = [];

    for (const category of categories) {
        const prompt = `
        Generate a detailed product description for a SmartHome product in the "${category}" category. 
        Include:
        1. Product Name (unique).
        2. Description (brief, 50 words max).
        3. Price (USD, $50 to $250).
        4. Discount (5-15%).
        5. Rebate (2-10%).
        6. Accessories (2 examples, comma-separated).
        7. Image file name (e.g., product_name.jpg).

        Format:
        Product Name: <name>
        Description: <description>
        Price: $<price>
        Discount: <discount>%
        Rebate: <rebate>%
        Accessories: <accessory1, accessory2>
        Image: <image_file_name>`;
        
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 100,
                    temperature: 0.7,
                },
                {
                    headers: { Authorization: `Bearer api-key here` },
                }
            );

            const result = response.data.choices[0]?.message?.content;

            if (result) {
                const lines = result.split('\n').filter(line => line.trim() !== '');
                const name = lines[0]?.replace('Product Name:', '').trim();
                const description = lines[1]?.replace('Description:', '').trim();
                const price = parseFloat(lines[2]?.replace('Price: $', '').trim());
                const discount = parseFloat(lines[3]?.replace('Discount:', '').trim());
                const rebate = parseFloat(lines[4]?.replace('Rebate:', '').trim());
                const accessories = lines[5]?.replace('Accessories:', '').trim();
                const image = lines[6]?.replace('Image:', '').trim();

                if (name && description && price && discount && rebate && accessories && image) {
                    generatedProducts.push({
                        name,
                        description,
                        price,
                        discount,
                        rebate,
                        category,
                        accessories,
                        image,
                        warranty: 1, // Default warranty
                        stock: Math.floor(Math.random() * 100) + 1, // Random stock
                        embedded: null, // Placeholder for embedding
                    });
                } else {
                    console.error('Incomplete product data in API response:', result);
                }
            } else {
                console.error('Unexpected response format:', response.data);
            }
        } catch (error) {
            console.error(`Error generating description for category "${category}":`, error.response?.data || error.message);
        }
    }

    return generatedProducts;
};

// Insert Products into MySQL
const insertProductsIntoDatabase = async (products) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const query = `
            INSERT INTO products (name, price, description, category, accessories, image, discount, rebate, warranty, stock, embedded)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const product of products) {
            await connection.execute(query, [
                product.name,
                product.price,
                product.description,
                product.category,
                product.accessories,
                product.image,
                product.discount,
                product.rebate,
                product.warranty,
                product.stock,
                product.embedded,
            ]);
        }

        console.log('Products inserted successfully into MySQL.');
        await connection.end();
    } catch (error) {
        console.error('Error inserting products into database:', error.message);
    }
};

// Main Function
const main = async () => {
    const products = await generateProductDescriptions();
    console.log('Generated Products:', products);

    if (products.length > 0) {
        await insertProductsIntoDatabase(products);
    } else {
        console.log('No products generated.');
    }
};

main().catch(console.error);
