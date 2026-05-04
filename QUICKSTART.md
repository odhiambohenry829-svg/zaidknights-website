# ZaidKnights Chess Club - Quick Start Guide

Get the ZaidKnights Chess Club platform running in under 30 minutes.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL database (local or cloud)
- Git installed

## Step 1: Clone & Install (3 minutes)

```bash
# Navigate to project directory
cd c:\xampp\htdocs\zaidknights_website

# Install dependencies
npm install

# This installs all required packages from package.json
```

## Step 2: Configure Environment (2 minutes)

```bash
# Copy example to .env.local
copy .env.example .env.local

# Edit .env.local with your database URL
# DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/zaidknights
# JWT_SECRET=your_random_secret_here
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# ADMIN_EMAIL=admin@zaidknights.com
```

## Step 3: Setup Database (5 minutes)

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Seed sample data
npx prisma db seed
```

## Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 5: Test the Platform (5 minutes)

### Explore Pages
- Home: http://localhost:3000/
- About: http://localhost:3000/about
- Membership: http://localhost:3000/membership
- Events: http://localhost:3000/events
- Rankings: http://localhost:3000/rankings
- Gallery: http://localhost:3000/gallery
- Blog: http://localhost:3000/blog
- Contact: http://localhost:3000/contact

### Test Authentication
1. Go to http://localhost:3000/register
2. Create test account with:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPassword123
3. Click "Create account"
4. Go to http://localhost:3000/login
5. Login with same credentials
6. Visit http://localhost:3000/dashboard

### Test API
```bash
# Register via API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"API Test",
    "email":"apitest@example.com",
    "password":"TestPass123"
  }'

# Get events
curl http://localhost:3000/api/events

# Get members
curl http://localhost:3000/api/members
```

## Database Management

### View/Edit Data
```bash
# Open Prisma Studio (interactive GUI)
npx prisma studio
```

This opens http://localhost:5555 with visual database editor.

### Make Schema Changes
1. Edit `prisma/schema.prisma`
2. Run: `npx prisma db push`
3. Run: `npx prisma generate`
4. Restart dev server

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>

# Then restart
npm run dev
```

### Database Connection Error
```
Error: P1000: Authentication failed
```

**Solution:**
- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is running
- Test connection: `psql <connection-string>`

### Prisma Generation Error
```bash
# Clear cache and regenerate
rm -r node_modules/.prisma
npx prisma generate
npx prisma db push
```

### Port 5555 Already in Use (Prisma Studio)
```bash
npx prisma studio --port 5556
```

## Building for Production

```bash
# Create optimized build
npm run build

# Test production build locally
npm start

# Build output is in .next folder
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npx prisma studio` | Open database GUI |
| `npx prisma db push` | Sync schema to database |
| `npx prisma generate` | Generate Prisma client |

## Project Structure Quick Tour

```
pages/                 - All page routes and API endpoints
  index.tsx           - Home page
  api/                - REST API endpoints
components/           - Reusable React components
lib/                  - Backend utilities (auth, validation)
prisma/schema.prisma  - Database schema definition
styles/globals.css    - Global styling
public/               - Static files (robots.txt, sitemap.xml)
```

## Next Steps

1. **Customize**: Edit pages and components to match branding
2. **Add Content**: Create events, posts, gallery items via admin
3. **Deploy**: Follow DEPLOYMENT_GUIDE.md for Vercel + domain setup
4. **Test**: Use API_REFERENCE.md to test all endpoints
5. **Monitor**: Set up analytics and error tracking

## Getting Help

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs

## Tips

✅ Always run `npx prisma generate` after schema changes  
✅ Use Prisma Studio to visualize your database  
✅ Test API endpoints with curl or Postman before frontend  
✅ Keep environment variables in .env.local (never commit)  
✅ Check browser console for frontend errors  
✅ Check terminal output for backend errors  

---

**Estimated Total Setup Time: 20-30 minutes**

Enjoy building ZaidKnights Chess Club! 🎉
