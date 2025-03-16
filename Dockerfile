# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first
COPY starter/package.json ./
COPY starter/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY starter/ ./

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY --from=build /app/dist ./dist

# Install serve for static file serving
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"] 