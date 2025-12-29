# Supabase Database Setup Guide

## Quick Setup

### 1. Get Your Supabase Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Project Settings** → **Database**
4. Under **Connection String**, select **URI** mode
5. Copy the connection string (use **Connection pooling** for Vercel)

### 2. Configure Environment Variables

#### For Production (Vercel/Railway/etc):

Set these environment variables in your hosting platform:

```bash
# Supabase Connection (REQUIRED)
DATABASE_URL=postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Database Sync (set to true ONLY for first deployment)
DB_SYNC=true

# JWT Secrets (REQUIRED - generate secure random strings)
JWT_SECRET=your_very_secure_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_very_secure_refresh_secret_min_32_chars

# Other Config
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

#### For Local Development:

Create a `.env` file in the project root:

```bash
NODE_ENV=development
PORT=3011
BASE_URL=http://localhost:3011

# Use your Supabase connection string
DATABASE_URL=postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# OR use individual parameters (if not using DATABASE_URL)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=delivery_challan
# DB_USER=postgres
# DB_PASSWORD=your_password

DB_SYNC=true

JWT_SECRET=dev_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=dev_refresh_secret_min_32_chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
```

## Important Notes

### First Deployment

⚠️ **For the FIRST deployment, you MUST set `DB_SYNC=true`** to create database tables.

After the tables are created successfully:
1. Set `DB_SYNC=false` in your environment variables
2. Redeploy

### Connection String Types

Supabase provides two connection strings:

1. **Direct Connection** (Port 5432)
   - Use for local development
   - Has connection limits
   
2. **Connection Pooling** (Port 6543) ✅ **RECOMMENDED**
   - Use for production (Vercel, Railway, etc.)
   - Better for serverless environments
   - Format: `postgresql://[user]:[password]@[host]:6543/postgres`

### SSL Configuration

SSL is **automatically enabled** when using:
- `DATABASE_URL` (Supabase connection string)
- `NODE_ENV=production` (individual parameters)

No additional configuration needed!

## Deployment Checklist

- [ ] Copy Supabase connection string from dashboard
- [ ] Replace `[YOUR-PASSWORD]` with actual password
- [ ] Use **Connection pooling** string (port 6543) for production
- [ ] Set `DB_SYNC=true` for first deployment
- [ ] Generate secure JWT secrets (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Set `CORS_ORIGIN` to your frontend URL
- [ ] Deploy
- [ ] Verify tables are created in Supabase SQL Editor
- [ ] Test `/api/auth/setup` endpoint
- [ ] Change `DB_SYNC=false` after successful setup
- [ ] Redeploy

## Testing

After deployment, test the setup:

```bash
# Create super admin
curl -X POST https://your-api-url.vercel.app/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin",
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "name": "Super Admin"
  }'
```

## Troubleshooting

### "Connection refused" or "timeout"
- ✅ Ensure you're using the **Connection pooling** string (port 6543)
- ✅ Check if Supabase project is paused
- ✅ Verify password is correct in connection string

### "Cannot read properties of undefined"
- ✅ Set `DB_SYNC=true` for first deployment
- ✅ Check Supabase PostgreSQL is enabled
- ✅ Verify connection string format

### "SSL required"
- ✅ This is automatically handled - no action needed
- ✅ Connection string should work out of the box

### "Too many connections"
- ✅ Use Connection pooling (port 6543) instead of direct connection (5432)
- ✅ Reduce pool size in production if needed

## Security Best Practices

1. **Never commit** `.env` file to Git (it's in `.gitignore`)
2. **Generate unique** JWT secrets for production (use password generator)
3. **Rotate secrets** periodically
4. **Use environment variables** in hosting platform (Vercel, Railway, etc.)
5. **Enable Row Level Security (RLS)** in Supabase if needed

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check application logs in Vercel/hosting platform
3. Verify all environment variables are set correctly
