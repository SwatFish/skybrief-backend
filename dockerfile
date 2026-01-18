# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (incl devdeps for TypeScript build)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output
COPY --from=build /app/dist ./dist

# If you use dotenv files locally, don't bake them into the image.
# Provide env vars at runtime instead.

# Fastify commonly uses 3000; change if your server uses another port
EXPOSE 3000

CMD ["node", "dist/server.js"]