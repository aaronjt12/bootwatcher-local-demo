# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY starter/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY starter/ .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json .

# Install only production dependencies
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"] 