# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY starter/package*.json ./
RUN npm install

COPY starter/ ./
RUN npm run build

# Production stage - using Express.js as a static server
FROM node:18-alpine

WORKDIR /app

# Create package.json for the server
RUN echo '{"name":"static-server","version":"1.0.0","type":"module"}' > package.json

# Install Express
RUN npm install express compression

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Create a simple Express server
RUN echo 'import express from "express";' > server.js && \
    echo 'import path from "path";' >> server.js && \
    echo 'import { fileURLToPath } from "url";' >> server.js && \
    echo 'import compression from "compression";' >> server.js && \
    echo '' >> server.js && \
    echo 'const __dirname = path.dirname(fileURLToPath(import.meta.url));' >> server.js && \
    echo 'const app = express();' >> server.js && \
    echo 'const PORT = process.env.PORT || 3000;' >> server.js && \
    echo '' >> server.js && \
    echo '// Enable compression' >> server.js && \
    echo 'app.use(compression());' >> server.js && \
    echo '' >> server.js && \
    echo '// Serve static files' >> server.js && \
    echo 'app.use(express.static(path.join(__dirname, "dist")));' >> server.js && \
    echo '' >> server.js && \
    echo '// For SPA routing - serve index.html for all routes' >> server.js && \
    echo 'app.get("*", (req, res) => {' >> server.js && \
    echo '  res.sendFile(path.join(__dirname, "dist", "index.html"));' >> server.js && \
    echo '});' >> server.js && \
    echo '' >> server.js && \
    echo 'app.listen(PORT, () => {' >> server.js && \
    echo '  console.log(`Server running on port ${PORT}`);' >> server.js && \
    echo '});'

# Set environment variables
ENV NODE_ENV=production

# Start the Express server
CMD ["node", "server.js"] 