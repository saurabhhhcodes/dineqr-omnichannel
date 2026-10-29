# Multi-stage production Dockerfile for DineQR Platform
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build frontend bundle
COPY . .
RUN npm run build

# Production runner image
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled frontend and server backend
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY postman ./postman

# Persistent volume for local SQLite database
VOLUME ["/app/data"]

EXPOSE 3001

CMD ["node", "server/index.js"]
