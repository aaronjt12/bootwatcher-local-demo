#!/bin/bash

# Default values
DEFAULT_MAPS_API_KEY="AIzaSyCR5TmTpYUEo2ozdmbyGV1VYj1Exhqmlk0"
DEFAULT_FIREBASE_API_KEY="AIzaSyCR5TmTpYUEo2ozdmbyGV1VYj1Exhqmlk0"
DEFAULT_FIREBASE_AUTH_DOMAIN="bootwatcher-demo.firebaseapp.com"
DEFAULT_FIREBASE_DATABASE_URL="https://bootwatcher-demo-default-rtdb.firebaseio.com"
DEFAULT_FIREBASE_PROJECT_ID="bootwatcher-demo"
DEFAULT_FIREBASE_STORAGE_BUCKET="bootwatcher-demo.appspot.com"
DEFAULT_FIREBASE_MESSAGING_SENDER_ID="123456789012"
DEFAULT_FIREBASE_APP_ID="1:123456789012:web:abc123def456"

# Get API keys from command line arguments or use defaults
MAPS_API_KEY=${1:-$DEFAULT_MAPS_API_KEY}
FIREBASE_API_KEY=${2:-$DEFAULT_FIREBASE_API_KEY}
FIREBASE_AUTH_DOMAIN=${3:-$DEFAULT_FIREBASE_AUTH_DOMAIN}
FIREBASE_DATABASE_URL=${4:-$DEFAULT_FIREBASE_DATABASE_URL}
FIREBASE_PROJECT_ID=${5:-$DEFAULT_FIREBASE_PROJECT_ID}
FIREBASE_STORAGE_BUCKET=${6:-$DEFAULT_FIREBASE_STORAGE_BUCKET}
FIREBASE_MESSAGING_SENDER_ID=${7:-$DEFAULT_FIREBASE_MESSAGING_SENDER_ID}
FIREBASE_APP_ID=${8:-$DEFAULT_FIREBASE_APP_ID}

echo "Building Docker image with:"
echo "- Google Maps API Key: $MAPS_API_KEY"
echo "- Firebase API Key: $FIREBASE_API_KEY"
echo "- Firebase Database URL: $FIREBASE_DATABASE_URL"
echo "- Firebase Project ID: $FIREBASE_PROJECT_ID"

# Build the Docker image with the provided environment variables
docker build \
  --build-arg VITE_MAPS_API_KEY=$MAPS_API_KEY \
  --build-arg VITE_FIREBASE_API_KEY=$FIREBASE_API_KEY \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN \
  --build-arg VITE_FIREBASE_DATABASE_URL=$FIREBASE_DATABASE_URL \
  --build-arg VITE_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID \
  --build-arg VITE_FIREBASE_APP_ID=$FIREBASE_APP_ID \
  -t bootwatcher-app:latest .

echo "Docker image built successfully!"
echo ""
echo "To run the container locally:"
echo "docker run -p 8080:8080 bootwatcher-app:latest"
echo ""
echo "To deploy to Railway:"
echo "railway up" 