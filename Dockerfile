# Stage 1: Use to optimize image
FROM node:24.22.1-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package manifests to the working directory
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Stage 2: Create production image
FROM node:24.22.1-alpine AS runner

# optimzing caching for install
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# copying the root folder into the workdir taking into account the .dockerignore file
COPY . .

USER node

EXPOSE 5000

CMD ["sh", "start.sh"]