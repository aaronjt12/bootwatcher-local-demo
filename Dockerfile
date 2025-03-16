# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY starter/package*.json ./
RUN npm install

COPY starter/ ./
RUN npm run build

# Production stage - using a simpler approach
FROM node:18-alpine

WORKDIR /app

# Copy package.json and server.js
COPY package.json .
COPY server.js .

# Install dependencies
RUN npm install

# Copy built assets from builder stage
COPY --from=builder /app/dist ./public

# Start the Express server
CMD ["node", "server.js"] 