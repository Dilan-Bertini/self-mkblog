#* Builder Stage *#
FROM node:18-alpine AS builder

# Install dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

#* Production Stage *#
FROM node:18-alpine

# Install git and ssh
RUN apk add --no-cache git openssh

# Create app directory and set working directory
RUN mkdir -p /usr/src/app/data/html
RUN mkdir -p /usr/src/app/data/static
RUN chown -R node:node /usr/src/app
RUN chown -R node:node /usr/src/app/data/html
RUN chown -R node:node /usr/src/app/data/static
RUN chmod -R 744 /usr/src/app
RUN chmod -R 755 /usr/src/app/data/html
RUN chmod -R 755 /usr/src/app/data/static

WORKDIR /usr/src/app

COPY build-data/hbs /home/node/hbs
RUN chown -R node:node /home/node/hbs && \
    chmod 744 /home/node/hbs

# Copy only production files from builder
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node package.json ./

# After the chown and chmod to avoid long build time
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules

# Setup SSH keys
COPY build-data/ssh /home/node/.ssh
RUN chown -R node:node /home/node/.ssh && \
    chmod 700 /home/node/.ssh && \
    chmod 600 /home/node/.ssh/*

# Switch to non-root user for security
USER node

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]