FROM node:20-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV DISABLE_RASA=true

# Expose the port the app runs on
EXPOSE 8080

# Run the production script
CMD ["node", "build/server/index.js"]