# Stage 1: Use to optimize image
FROM node:16.19.0-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install dependencies
RUN npm install

# Stage 2: Create production image
FROM node:16.19.0-alpine AS runner

# optimzing caching for install
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# copying the root folder into the workdir taking into account the .dockerignore file
COPY . .

CMD ["sh", "start.sh"]