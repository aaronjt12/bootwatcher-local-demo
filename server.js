const express = require('express');
const path = require('path');
const compression = require('compression');
const fs = require('fs');

const app = express();

// Railway typically sets PORT to a specific value
const PORT = process.env.PORT || process.env.RAILWAY_PORT || 8080;

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

// Error route - serve the error page for specific error paths
app.get('/error', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'error.html'));
});

// Maps error route - serve the maps-error page
app.get('/maps-error', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'maps-error.html'));
});

// Middleware to inject environment variables into the HTML
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    const filePath = req.path === '/' 
      ? path.join(__dirname, 'public', 'index.html')
      : path.join(__dirname, 'public', req.path);
    
    if (fs.existsSync(filePath)) {
      let html = fs.readFileSync(filePath, 'utf8');
      
      // Inject environment variables as a global object
      const envVars = {
        VITE_MAPS_API_KEY: process.env.VITE_MAPS_API_KEY || '',
        VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || '',
        VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        VITE_FIREBASE_DATABASE_URL: process.env.VITE_FIREBASE_DATABASE_URL || '',
        VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || '',
        VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || ''
      };
      
      // Insert the environment variables script before the closing </head> tag
      const envScript = `<script>window.env = ${JSON.stringify(envVars)};</script>`;
      html = html.replace('</head>', `${envScript}</head>`);
      
      res.send(html);
      return;
    }
  }
  next();
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
  console.log('- /error - Error page');
  console.log('- /maps-error - Google Maps error help page');
  console.log('- /* - Static files and SPA routing');
}); 