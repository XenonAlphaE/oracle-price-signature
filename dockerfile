# Use official Node.js LTS (slim for smaller image)
FROM node:18-slim

# Set working directory inside container
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy rest of the app
COPY . .

# Create keys directory (if not already in code)
RUN mkdir -p keys

# Expose API port
EXPOSE 7001

# Run server
CMD ["node", "server.js"]
