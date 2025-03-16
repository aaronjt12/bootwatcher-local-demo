const express = require('express');
const path = require('path');
const compression = require('compression');
const fs = require('fs');

const app = express();

// Railway typically sets PORT to a specific value
const PORT = process.env.PORT || process.env.RAILWAY_PORT || 3000;

// Print all environment variables for debugging
console.log('All environment variables:');
console.log(JSON.stringify(process.env, null, 2));
console.log(`Starting server with PORT=${PORT}`);

// Enable compression
app.use(compression());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Debug endpoint
app.get('/debug', (req, res) => {
  const debug = {
    env: process.env,
    port: PORT,
    cwd: process.cwd(),
    files: fs.readdirSync('./public')
  };
  res.json(debug);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// For SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Listen on all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Available routes:');
  console.log('- /health - Health check endpoint');
  console.log('- /debug - Debug information');
  console.log('- /* - Static files and SPA routing');
}); 