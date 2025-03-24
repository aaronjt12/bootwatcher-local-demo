# Build stage
FROM node:18-alpine AS builder

# Set working directory to root initially
WORKDIR /app

# Copy only the starter directory
COPY starter/ ./starter/

# Change to the starter directory
WORKDIR /app/starter

# Install dependencies
RUN npm install

# Run the build
RUN npm run build

# Since no Nginx, we just need the dist/ folder for Railway
# Final stage is minimal, just copying the output
FROM scratch AS export
COPY --from=builder /app/starter/dist /