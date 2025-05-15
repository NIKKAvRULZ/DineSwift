# 1. Base image
FROM node:22

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# Copy the .env file into the container
COPY .env .env

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your app
COPY . .

# 6. Expose port (your PaymentService server port)
EXPOSE 5005

# 7. Command to run the app
# 7. Command to run the app with nodemon
CMD ["npx", "nodemon", "index.js"]

