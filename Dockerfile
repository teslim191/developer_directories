# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the app port
EXPOSE 7000

# Command to run the app
CMD["node","index.js"]
