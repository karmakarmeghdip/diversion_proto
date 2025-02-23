FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --production

# Copy all source files
COPY . .

# Expose port 3000
EXPOSE 3000

# Set entry point
CMD ["bun", "run", "server.ts"]