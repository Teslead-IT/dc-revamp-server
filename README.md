# DC Server - Delivery Challan Backend API

Express.js TypeScript backend server for Delivery Challan management.

## Features

- 🚀 Express.js with TypeScript
- 🔐 JWT Authentication & Authorization
- 🗄️ PostgreSQL with Sequelize ORM
- ✅ Zod Validation
- 📝 Winston Logger
- 🛡️ Helmet & CORS Security
- 🔄 Auto-reload with ts-node-dev

## Project Structure

```
dc-server/
├── src/
│   ├── core/
│   │   └── models/          # Sequelize models
│   ├── modules/
│   │   ├── auth/            # Authentication module
│   │   ├── suppliers/       # Suppliers module
│   │   └── main/            # Main router
│   ├── shared/
│   │   ├── db/              # Database connections
│   │   ├── middleware/      # Auth middleware
│   │   ├── utils/           # Utilities (env, logger)
│   │   └── validations/     # Zod schemas
│   ├── app.ts               # Express app configuration
│   └── server.ts            # Server entry point
├── logs/                    # Application logs
├── .env                     # Environment variables
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd dc-server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3011
BASE_URL=http://localhost:3011

DB_HOST=localhost
DB_PORT=5432
DB_NAME=delivery_challan
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

CORS_ORIGIN=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3011`

### 4. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/setup` - Create first super admin (one-time)
- `POST /api/auth/login` - User login
- `POST /api/auth/create-user` - Create new user (requires auth)

### Suppliers

All routes require authentication (Bearer token).

- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier (soft delete)

### Health Check

- `GET /` - API info
- `GET /health` - Health check

## Usage with Frontend

Update your Next.js frontend to call this backend:

```typescript
// In your Next.js app
const API_URL = 'http://localhost:3011/api';

// Login example
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'admin', password: 'password' })
});

// Get suppliers with auth
const response = await fetch(`${API_URL}/suppliers`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Migration from Next.js API Routes

1. Update all frontend API calls to point to `http://localhost:3011/api`
2. Remove `/app/api` routes from Next.js project
3. Keep frontend logic in Next.js
4. This server handles all backend logic

## Development

- Database initializes automatically on server start
- Models sync in development mode
- Use migrations for production
- Logs are in `logs/` directory

## Security Notes

- Change JWT secrets in production
- Use environment variables
- Enable HTTPS in production
- Set proper CORS origin
- The `/setup` endpoint is blocked after first user creation
