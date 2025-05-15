# 1. Base image
FROM node:22

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the app
COPY . .

# 6. Expose the port (NotificationService will run on 5006)
EXPOSE 5006

# 7. Command to run the app
CMD ["npm", "start"]
