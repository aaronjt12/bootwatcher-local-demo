# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY starter/package*.json ./
RUN npm install

COPY starter/ ./
RUN npm run build

# Production stage
FROM nginx:alpine

# Install bash and debugging tools
RUN apk add --no-cache bash curl

# Create nginx runtime directories
RUN mkdir -p /var/cache/nginx && \
    mkdir -p /var/run && \
    mkdir -p /var/log/nginx

# Configure nginx
RUN echo 'worker_processes auto;' > /etc/nginx/nginx.conf && \
    echo 'error_log /dev/stdout info;' >> /etc/nginx/nginx.conf && \
    echo 'pid /var/run/nginx.pid;' >> /etc/nginx/nginx.conf && \
    echo 'events { worker_connections 1024; }' >> /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '    access_log /dev/stdout;' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '    default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '    sendfile on;' >> /etc/nginx/nginx.conf && \
    echo '    tcp_nopush on;' >> /etc/nginx/nginx.conf && \
    echo '    tcp_nodelay on;' >> /etc/nginx/nginx.conf && \
    echo '    keepalive_timeout 65;' >> /etc/nginx/nginx.conf && \
    echo '    types_hash_max_size 2048;' >> /etc/nginx/nginx.conf && \
    echo '    gzip on;' >> /etc/nginx/nginx.conf && \
    echo '    gzip_disable "msie6";' >> /etc/nginx/nginx.conf && \
    echo '    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/conf.d/*.conf;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

ENV PORT=3000
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a script to handle startup with debugging
RUN echo '#!/bin/bash' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'echo "Current directory: $(pwd)"' >> /docker-entrypoint.sh && \
    echo 'echo "Directory contents:"' >> /docker-entrypoint.sh && \
    echo 'ls -la /usr/share/nginx/html' >> /docker-entrypoint.sh && \
    echo 'echo "Nginx configuration:"' >> /docker-entrypoint.sh && \
    echo 'cat /etc/nginx/nginx.conf' >> /docker-entrypoint.sh && \
    echo 'echo "Environment variables:"' >> /docker-entrypoint.sh && \
    echo 'env' >> /docker-entrypoint.sh && \
    echo 'echo "Substituting environment variables..."' >> /docker-entrypoint.sh && \
    echo 'envsubst "\$PORT" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "Final nginx configuration:"' >> /docker-entrypoint.sh && \
    echo 'cat /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'echo "Starting nginx..."' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"] 