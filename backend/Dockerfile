FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma client and build the app
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

# Run migrations and start production server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
