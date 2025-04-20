# Use Node.js LTS (Long Term Support) version
FROM node:20-alpine

# Set working directory in container
WORKDIR /app

COPY .env /app/.env
# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your service runs on (assuming default 3000, adjust if different)
EXPOSE 5002

# Start the service
CMD ["node", "index.js"] 