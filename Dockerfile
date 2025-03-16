# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY starter/package*.json ./
RUN npm install

COPY starter/ ./
RUN npm run build

# Production stage - using a simpler approach with a standard web server
FROM node:18-alpine

WORKDIR /app

# Install a simple HTTP server
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production

# Start the server using the PORT environment variable
CMD serve -s dist -l ${PORT:-3000} 