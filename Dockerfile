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

# Create a simple server package
RUN npm init -y && \
    npm install express compression

# Copy built assets from builder stage
COPY --from=builder /app/dist ./public

# Create a simple Express server file
RUN echo 'const express = require("express");' > server.js && \
    echo 'const path = require("path");' >> server.js && \
    echo 'const compression = require("compression");' >> server.js && \
    echo '' >> server.js && \
    echo 'const app = express();' >> server.js && \
    echo 'const PORT = process.env.PORT || 3000;' >> server.js && \
    echo '' >> server.js && \
    echo 'console.log(`Starting server with PORT=${PORT}`);' >> server.js && \
    echo '' >> server.js && \
    echo 'app.use(compression());' >> server.js && \
    echo '' >> server.js && \
    echo '// Health check endpoint' >> server.js && \
    echo 'app.get("/health", (req, res) => {' >> server.js && \
    echo '  res.status(200).send("OK");' >> server.js && \
    echo '});' >> server.js && \
    echo '' >> server.js && \
    echo '// Serve static files' >> server.js && \
    echo 'app.use(express.static(path.join(__dirname, "public")));' >> server.js && \
    echo '' >> server.js && \
    echo '// For SPA routing' >> server.js && \
    echo 'app.get("*", (req, res) => {' >> server.js && \
    echo '  res.sendFile(path.join(__dirname, "public", "index.html"));' >> server.js && \
    echo '});' >> server.js && \
    echo '' >> server.js && \
    echo 'app.listen(PORT, "0.0.0.0", () => {' >> server.js && \
    echo '  console.log(`Server running on http://0.0.0.0:${PORT}`);' >> server.js && \
    echo '});'

# Start the Express server
CMD ["node", "server.js"] 