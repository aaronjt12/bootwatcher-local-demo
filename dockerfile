# Use Node.js as the base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Install a simple server to serve the static files
RUN npm install -g serve

# Expose the port that serve will use
EXPOSE 3000

# Start the serve server
CMD ["serve", "-s", "build", "-l", "3000"]