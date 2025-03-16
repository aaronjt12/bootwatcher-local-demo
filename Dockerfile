# Build stage
FROM node:18-alpine as build

# Set environment variables for build optimization
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV VITE_DISABLE_ESLINT_PLUGIN=true
ENV NODE_ENV=production

WORKDIR /app

# Copy package files first
COPY starter/package.json ./
COPY starter/package-lock.json ./

# Install dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install

# Copy the rest of the application
COPY starter/ ./

# Build the app with specific memory allocation
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY --from=build /app/dist ./dist

# Install serve for static file serving
RUN npm install -g serve

EXPOSE 3000

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

CMD ["serve", "-s", "dist", "-l", "3000"] 