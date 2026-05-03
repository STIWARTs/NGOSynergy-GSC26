# Use Node 20 official image as base
FROM node:20-alpine

WORKDIR /app

# Install Python 3 and scikit-learn dependencies
RUN apk add --no-cache python3 py3-pip \
    && pip3 install --no-cache-dir --break-system-packages scikit-learn pandas numpy joblib

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY ml ./ml

# Copy ML model if it exists (optional - fail silently if not present)
RUN if [ -f model.pkl ]; then cp model.pkl ./model.pkl; fi || true

# Compile TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
