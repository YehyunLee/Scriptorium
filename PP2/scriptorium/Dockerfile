FROM node:18-slim

# Install required packages
RUN apt-get update && apt-get install -y \
    docker.io \
    sqlite3 \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Create app directory for the container
WORKDIR /app

# Copy all files
COPY . .

# Convert line endings and set permissions
RUN dos2unix startup.sh && chmod +x startup.sh \
    dos2unix utils/code_executor/scripts/setup.sh && chmod +x utils/code_executor/scripts/setup.sh

# Install dependencies and setup Docker images
RUN ./startup.sh

# Build for production
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]