FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS app
RUN npm run build && ls -la dist/

EXPOSE 3001

# Run migrations and start production server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
