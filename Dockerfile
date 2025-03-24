# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY starter/package*.json ./
RUN npm install

COPY starter/ ./

# Set up ARGs for build-time environment variables
ARG VITE_MAPS_API_KEY
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_DATABASE_URL
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_API_URL 

# Create .env file for build
RUN echo "VITE_MAPS_API_KEY=${VITE_MAPS_API_KEY}" > .env \
    && echo "VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}" >> .env \
    && echo "VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}" >> .env \
    && echo "VITE_FIREBASE_DATABASE_URL=${VITE_FIREBASE_DATABASE_URL}" >> .env \
    && echo "VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}" >> .env \
    && echo "VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}" >> .env \
    && echo "VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}" >> .env \
    && echo "VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}" >> .env \
    && echo "VITE_API_URL=${VITE_API_URL}" >> .env \
    && cat .env

# Build the application with the environment variables
RUN npm run build