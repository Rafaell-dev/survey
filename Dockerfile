# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy source code and build
COPY . .

RUN npm run build

# Stage 2: Serve with Node (Next.js standalone)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
