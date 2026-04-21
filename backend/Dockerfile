# Use Node 20 official image as base
FROM node:20-alpine

WORKDIR /app

# Install Python 3 and scikit-learn dependencies
RUN apk add --no-cache python3 py3-pip \
    && pip3 install --no-cache-dir scikit-learn pandas numpy joblib

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/src ./src
COPY backend/ml ./ml

# Copy ML model if it exists
COPY backend/model.pkl ./model.pkl 2>/dev/null || true

# Compile TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
