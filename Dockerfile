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

# Create a startup script to handle the PORT environment variable
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'PORT_NUMBER=${PORT:-3000}' >> /app/start.sh && \
    echo 'echo "Starting server on port $PORT_NUMBER"' >> /app/start.sh && \
    echo 'serve -s dist -l $PORT_NUMBER' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start the server using the startup script
CMD ["/app/start.sh"] 