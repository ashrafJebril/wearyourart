FROM node:20-alpine AS builder

WORKDIR /app

# Accept build-time environment variables
ARG VITE_BASE_PATH=/
ARG VITE_API_URL

# Set them as environment variables for the build
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage - serve static files
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD serve -s dist -l ${PORT:-8080}
