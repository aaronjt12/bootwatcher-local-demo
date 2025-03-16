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
COPY <<EOF /app/package.json
{
  "name": "static-server",
  "version": "1.0.0",
  "type": "module"
}
EOF

# Install Express
RUN npm install express compression

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Create a simple Express server
COPY <<EOF /app/server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// For SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
  console.log('Health check available at /health');
});
EOF

# Set environment variables
ENV NODE_ENV=production

# Start the Express server
CMD ["node", "server.js"] 