# ===================================
# NestJS Backend Dockerfile
# ===================================

FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Make database init script executable
RUN chmod +x docker-init-db.sh

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npx nest build

# Check build output
RUN echo "Build completed, checking dist directory:" && \
    ls -la /app/ && \
    echo "Dist directory contents:" && \
    ls -la /app/dist/ && \
    echo "Src directory contents after build:" && \
    find /app -name "*.js" -type f | head -10

# Clean up dev dependencies after build
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S discordgym -u 1001 -G nodejs

# Change ownership of the app directory (including dist)
RUN chown -R discordgym:nodejs /app

# Verify dist directory exists
RUN ls -la /app/dist && echo "Main.js check:" && ls -la /app/dist/src/main.js || echo "main.js not found, searching for JS files:" && find /app -name "*.js" -type f | head -5

USER discordgym

# Expose port
EXPOSE 3000

# Start the application with database initialization
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma db push && npx prisma generate && node dist/src/main.js"]
