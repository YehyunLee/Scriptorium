# Base image for Next.js
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port Render will use
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
