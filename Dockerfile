# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install development dependencies for PostCSS
RUN npm install -D postcss postcss-loader tailwindcss autoprefixer

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]
