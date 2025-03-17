#!/bin/bash

# Default values
DEFAULT_MAPS_API_KEY="AIzaSyCR5TmTpYUEo2ozdmbyGV1VYj1Exhqmlk0"
DEFAULT_FIREBASE_API_KEY="AIzaSyCR5TmTpYUEo2ozdmbyGV1VYj1Exhqmlk0"

# Get API keys from command line arguments or use defaults
MAPS_API_KEY=${1:-$DEFAULT_MAPS_API_KEY}
FIREBASE_API_KEY=${2:-$DEFAULT_FIREBASE_API_KEY}

echo "Building Docker image with:"
echo "- Google Maps API Key: $MAPS_API_KEY"
echo "- Firebase API Key: $FIREBASE_API_KEY"

# Build the Docker image with the provided API keys
docker build \
  --build-arg MAPS_API_KEY=$MAPS_API_KEY \
  --build-arg FIREBASE_API_KEY=$FIREBASE_API_KEY \
  -t bootwatcher-app:latest .

echo "Docker image built successfully!"
echo ""
echo "To run the container locally:"
echo "docker run -p 8080:8080 bootwatcher-app:latest"
echo ""
echo "To deploy to Railway:"
echo "railway up" 