# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY starter/package*.json ./starter/

# Install dependencies
RUN npm install
RUN cd starter && npm install

# Copy the rest of the application
COPY . .

# Set environment variables for Firebase
ENV VITE_FIREBASE_API_KEY="AIzaSyCR5TmTpYUEo2ozdmbyGV1VYj1Exhqmlk0"
ENV VITE_FIREBASE_AUTH_DOMAIN="bootwatcher-demo.firebaseapp.com"
ENV VITE_FIREBASE_DATABASE_URL="https://bootwatcher-demo-default-rtdb.firebaseio.com"
ENV VITE_FIREBASE_PROJECT_ID="bootwatcher-demo"
ENV VITE_FIREBASE_STORAGE_BUCKET="bootwatcher-demo.appspot.com"
ENV VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
ENV VITE_FIREBASE_APP_ID="1:123456789012:web:abc123def456"
ENV VITE_MAPS_API_KEY="AIzaSyCR5TmTpYUEo2ozdmbyGV1VYj1Exhqmlk0"

# Build the application
RUN cd starter && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy built application from build stage
COPY --from=build /app/starter/dist ./starter/dist
COPY --from=build /app/public ./public
COPY server.js .
COPY nginx.conf .

# Expose port
EXPOSE 8080

# Start the Express server
CMD ["node", "server.js"] 