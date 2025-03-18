# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY starter/package*.json ./
RUN npm install

COPY starter/ ./

# We're not hard-coding any environment variables here
# Let Railway provide them at runtime
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

# Expose port
EXPOSE 8080

# Start the Express server
# All environment variables from Railway will be available here
CMD ["node", "server.js"] 