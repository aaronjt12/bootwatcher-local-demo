# Build stage
FROM node:16-alpine as build

WORKDIR /app

# Copy the entire starter directory
COPY starter/ ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Build the app
ENV NODE_ENV=production
RUN npm run build && \
    echo "Build completed. Contents of /app/dist:" && \
    ls -la dist/

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