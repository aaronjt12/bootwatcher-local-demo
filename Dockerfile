# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY starter/package*.json ./
RUN npm install

COPY starter/ ./

# Set default Firebase configuration values for the build
ENV VITE_FIREBASE_API_KEY="AIzaSyDOCAbC123dEf456GhI789jKl01-MnO"
ENV VITE_FIREBASE_AUTH_DOMAIN="bootwatcher-demo.firebaseapp.com"
ENV VITE_FIREBASE_DATABASE_URL="https://bootwatcher-demo-default-rtdb.firebaseio.com"
ENV VITE_FIREBASE_PROJECT_ID="bootwatcher-demo"
ENV VITE_FIREBASE_STORAGE_BUCKET="bootwatcher-demo.appspot.com"
ENV VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
ENV VITE_FIREBASE_APP_ID="1:123456789012:web:abc123def456"

# Build the application
RUN npm run build

# Production stage - using a simpler approach
FROM node:18-alpine

WORKDIR /app

# Copy package.json and server.js
COPY package.json .
COPY server.js .
COPY Procfile .

# Install dependencies
RUN npm install

# Copy built assets from builder stage
COPY --from=builder /app/dist ./public

# Start the Express server
CMD ["node", "server.js"] 