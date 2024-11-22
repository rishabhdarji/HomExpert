# Use Node.js for building React app
FROM node:16 as build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Build the React app
RUN npm run build

# Use Nginx to serve the built app
FROM nginx:stable-alpine

# Copy built app to Nginx directory
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Copy nginx configuration (if needed)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
