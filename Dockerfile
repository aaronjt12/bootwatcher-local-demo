# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY starter/package*.json ./
RUN npm install

COPY starter/ ./
RUN npm run build

# Production stage
FROM nginx:alpine

ENV PORT=3000
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'" 