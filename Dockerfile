# Multi-Vertical Brand Compiler Agent Container
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package metadata and install dependencies
COPY package.json ./
RUN npm install --production

# Copy CLI compiler script and source files
COPY brand-compiler-cli.js ./

# Create output volume mount directory
RUN mkdir -p /app/output

# Set non-root user for safe agent execution
USER node

# Default command to display help and usage
ENTRYPOINT ["node", "brand-compiler-cli.js"]
CMD ["--help"]
