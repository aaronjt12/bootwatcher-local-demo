# Use the official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Build the app
RUN npm run build

# Use a lightweight web server for production
RUN npm install -g serve

# Expose the port your app runs on
EXPOSE 3000

# Command to run the app
CMD ["serve", "-s", "build", "-l", "3000"]