# Build stage
FROM node:16-alpine as build

WORKDIR /app

# Copy package files first
COPY starter/package.json ./
COPY starter/package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY starter/ ./

# Build the app
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Set default port if not provided
ENV PORT=80

# Start nginx with environment variable substitution
CMD /bin/sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'" 