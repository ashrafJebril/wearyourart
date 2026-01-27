# WearYourArt - E-commerce Platform

A full-stack e-commerce platform for custom apparel with a NestJS backend, PostgreSQL database, and React admin panel.

## Project Structure

```
wearyourart/
├── hoodie/              # Next.js frontend (existing)
├── backend/             # NestJS API
├── admin/               # React admin panel
└── docker-compose.yml   # Docker orchestration
```

## Quick Start with Docker

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations:**
   ```bash
   docker-compose exec backend npx prisma migrate dev
   ```

3. **Seed the database:**
   ```bash
   docker-compose exec backend npx prisma db seed
   ```

4. **Access the applications:**
   - Frontend: http://localhost:3000 (run separately)
   - Backend API: http://localhost:3001
   - Admin Panel: http://localhost:3002

## Development Setup (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

1. Navigate to backend:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Edit .env file with your database URL
   DATABASE_URL="postgresql://user:password@localhost:5432/wearyourart"
   JWT_SECRET="your-secret-key"
   PORT=3001
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Seed the database:
   ```bash
   npx prisma db seed
   ```

7. Start the server:
   ```bash
   npm run start:dev
   ```

### Admin Panel Setup

1. Navigate to admin:
   ```bash
   cd admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # .env file
   VITE_API_URL=http://localhost:3001
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Default Admin Credentials

- **Email:** admin@wearyourart.com
- **Password:** admin123

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /categories | List all categories |
| GET | /categories/:id | Get category by ID |
| GET | /products | List products (with filters) |
| GET | /products/:id | Get product by ID |
| POST | /orders | Create new order |
| GET | /orders/number/:orderNumber | Get order by number |

### Protected Endpoints (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Admin login |
| GET | /auth/profile | Get admin profile |
| POST | /categories | Create category |
| PATCH | /categories/:id | Update category |
| DELETE | /categories/:id | Delete category |
| POST | /products | Create product |
| PATCH | /products/:id | Update product |
| DELETE | /products/:id | Delete product |
| GET | /orders | List all orders |
| GET | /orders/:id | Get order details |
| PATCH | /orders/:id/status | Update order status |
| GET | /orders/stats | Get order statistics |
| POST | /upload | Upload single file |
| POST | /upload/multiple | Upload multiple files |
| DELETE | /upload/:filename | Delete file |

## Database Schema

- **Category** - Product categories with images
- **Product** - Products with multiple images, colors, sizes
- **Order** - Customer orders with items
- **OrderItem** - Individual items in an order
- **Admin** - Admin users for the panel

## Tech Stack

### Backend
- NestJS 10
- Prisma ORM
- PostgreSQL 15
- JWT Authentication
- Multer for file uploads

### Admin Panel
- React 18
- Vite
- React Router 6
- React Hook Form
- Tailwind CSS
- Axios

### Infrastructure
- Docker & Docker Compose
- Multi-stage builds
- Health checks

## Scripts

### Backend
```bash
npm run start:dev      # Development mode
npm run start:prod     # Production mode
npm run build          # Build for production
npx prisma studio      # Open Prisma Studio
npx prisma migrate dev # Run migrations
```

### Admin
```bash
npm run dev            # Development mode
npm run build          # Build for production
npm run preview        # Preview production build
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/wearyourart
JWT_SECRET=your-jwt-secret
PORT=3001
```

### Admin (.env)
```
VITE_API_URL=http://localhost:3001
```

## License

MIT
