# Build stage
FROM node:16-alpine as build

WORKDIR /app

# Copy the entire starter directory
COPY starter/ ./

# Debug: Show contents and environment
RUN echo "Contents of /app:" && \
    ls -la && \
    echo "Environment:" && \
    env

# Install dependencies with verbose logging
RUN npm install --legacy-peer-deps --verbose

# Set build environment variables
ENV NODE_ENV=production
ENV VITE_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}

# Debug TypeScript configuration
RUN echo "TypeScript Config:" && cat tsconfig.json || echo "No tsconfig.json found"

# Debug Vite configuration
RUN echo "Vite Config:" && cat vite.config.js || echo "No vite.config.js found"

# Build the app with detailed error logging
RUN echo "Starting build process..." && \
    echo "Node version: $(node -v)" && \
    echo "NPM version: $(npm -v)" && \
    npm run build --verbose || { \
        echo "Build failed. Checking for common issues:"; \
        echo "1. Package.json contents:"; \
        cat package.json; \
        echo "2. Node modules:"; \
        ls -la node_modules; \
        echo "3. Environment variables:"; \
        env | grep VITE_; \
        echo "4. Build logs:"; \
        npm run build --verbose; \
        exit 1; \
    }

# Production stage
FROM nginx:alpine

# Copy built assets to nginx and verify
COPY --from=build /app/dist /usr/share/nginx/html
RUN echo "Contents of /usr/share/nginx/html:" && \
    ls -la /usr/share/nginx/html && \
    echo "Nginx configuration directory:" && \
    ls -la /etc/nginx/conf.d/

# Configure nginx with proper HTTP settings and MIME types
RUN echo 'worker_processes auto;' > /etc/nginx/nginx.conf && \
    echo 'events { worker_connections 1024; }' >> /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '    types {' >> /etc/nginx/nginx.conf && \
    echo '        application/javascript js;' >> /etc/nginx/nginx.conf && \
    echo '        application/javascript mjs;' >> /etc/nginx/nginx.conf && \
    echo '    }' >> /etc/nginx/nginx.conf && \
    echo '    default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '    sendfile on;' >> /etc/nginx/nginx.conf && \
    echo '    tcp_nopush on;' >> /etc/nginx/nginx.conf && \
    echo '    tcp_nodelay on;' >> /etc/nginx/nginx.conf && \
    echo '    keepalive_timeout 65;' >> /etc/nginx/nginx.conf && \
    echo '    types_hash_max_size 2048;' >> /etc/nginx/nginx.conf && \
    echo '    gzip on;' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/conf.d/*.conf;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Set default port if not provided
ENV PORT=80

# Start nginx with environment variable substitution and debugging
CMD /bin/sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && \
    echo 'Final nginx configuration:' && \
    cat /etc/nginx/conf.d/default.conf && \
    echo 'Starting nginx...' && \
    exec nginx -g 'daemon off;'" 