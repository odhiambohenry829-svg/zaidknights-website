# ZaidKnights Chess Club - Deployment & Domain Setup Guide

## Table of Contents
1. [Domain Registration & Selection](#domain-selection)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Configuration](#database-setup)
4. [Frontend Deployment](#frontend-deployment)
5. [DNS & SSL Configuration](#dns--ssl)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Verification](#verification)
8. [Production Security Checklist](#production-checklist)

---

## Domain Selection

### Recommended Domains
The following domains are in priority order for ZaidKnights Chess Club:

| Domain | TLD | Pros | Status |
|--------|-----|------|--------|
| `zaidknights.com` | .com | Strong brand, credible, memorable | Check availability via Namecheap/GoDaddy |
| `zaidknightschess.com` | .com | Descriptive, SEO-friendly | Alternative |
| `zaidknightsclub.com` | .com | Clear purpose statement | Alternative |
| `zkchess.com` | .com | Short, brandable | Alternative |
| `zaidknightsacademy.com` | .com | Emphasizes training aspect | Alternative |
| `zaidknights.org` | .org | Nonprofit-friendly, trustworthy | If .com unavailable |
| `zaidknights.co.ke` | .ke | Kenya-specific, local identity | Strong local branding |
| `zkchess.chess` | .chess | Modern, niche-specific | Future-proof |

### Domain Registration Steps

1. **Select Registrar** (Recommended):
   - Namecheap: https://namecheap.com
   - GoDaddy: https://godaddy.com
   - Domain.com: https://domain.com
   - Afriregister (Kenya-based): https://afriregister.com

2. **Search & Check Availability**:
   - Use Whois lookup or registrar tools.
   - Check trademark conflicts to avoid legal issues.

3. **Purchase Domain**:
   - Register for 3+ years for stability and trust signals.
   - Enable WHOIS privacy (optional).
   - Auto-renew recommended.

4. **Configure Nameservers**:
   - Once purchased, you'll configure DNS.
   - Use Cloudflare nameservers (recommended) or Vercel DNS.

---

## Infrastructure Setup

### Option A: Vercel + Supabase (Recommended)
**Best for**: Fast setup, scalability, modern stack.

```
Frontend: Vercel
Backend/Database: Supabase (managed PostgreSQL)
CDN: Vercel Edge Network
SSL: Automatic
```

#### Steps:
1. Create Vercel account: https://vercel.com
2. Create Supabase account: https://supabase.com
3. Create PostgreSQL database in Supabase.
4. Copy connection string (DATABASE_URL).

### Option B: Vercel + Neon (PostgreSQL)
**Best for**: Lightweight, serverless Postgres.

```
Frontend: Vercel
Database: Neon (serverless Postgres)
CDN: Vercel Edge Network
```

#### Steps:
1. Create Neon account: https://neon.tech
2. Create database and copy connection string.

### Option C: Self-Hosted (Advanced)
**Best for**: Full control, existing infrastructure.

```
Frontend: Vercel or custom VPS
Backend: Node.js on Render/Railway/VPS
Database: PostgreSQL (self-managed or managed service)
DNS: Cloudflare
```

---

## Database Setup

### 1. Supabase PostgreSQL Setup

1. Sign up: https://supabase.com
2. Create a new project (select region nearest to Africa/Nairobi).
3. Go to `Database > Connection Strings`.
4. Copy the PostgreSQL connection string:
   ```
   postgresql://USER:PASSWORD@HOST:5432/zaidknights
   ```
5. Save as `DATABASE_URL` in `.env` file locally.

### 2. Neon PostgreSQL Setup

1. Sign up: https://neon.tech
2. Create a database project.
3. Copy the connection string.
4. Set `DATABASE_URL` in environment.

### 3. Initialize Prisma Schema

```bash
# In project root
npm install
npx prisma generate
npx prisma db push
```

This creates tables based on `prisma/schema.prisma`.

### 4. Seed Database (Optional)

Create `prisma/seed.ts`:
```typescript
import { prisma } from '../lib/prisma';

async function main() {
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@zaidknights.com',
      password: 'hashed_password_here',
      role: 'ADMIN'
    }
  });
  console.log('Seed complete:', admin);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Run:
```bash
npx prisma db seed
```

---

## Frontend Deployment

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial ZaidKnights commit"
   git remote add origin https://github.com/your-username/zaidknights-website.git
   git push -u origin main
   ```

2. **Connect Vercel**:
   - Visit https://vercel.com/new
   - Select "Import Git Repository"
   - Choose your GitHub repository

3. **Configure Build**:
   - Framework: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Set Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/zaidknights
   JWT_SECRET=your_secure_random_secret_here
   NEXT_PUBLIC_SITE_URL=https://zaidknights.com
   ADMIN_EMAIL=admin@zaidknights.com
   ```

5. **Deploy**:
   - Vercel automatically builds and deploys.
   - You'll receive a live URL (e.g., `zaidknights.vercel.app`)

---

## DNS & SSL

### Using Cloudflare (Recommended)

1. **Create Cloudflare Account**: https://cloudflare.com
2. **Add Site**:
   - Enter your domain (e.g., `zaidknights.com`)
   - Cloudflare scans your DNS records
3. **Update Nameservers** at your registrar:
   - Replace registrar nameservers with Cloudflare:
     - `alice.ns.cloudflare.com`
     - `bob.ns.cloudflare.com`
   - Wait 24-48 hours for propagation

4. **Configure DNS in Cloudflare**:
   - **DNS > Records**
   - Add A record or CNAME:
     - **If using Vercel**: CNAME `zaidknights.com` → `cname.vercel-dns.com`
     - **Alternative**: Use Vercel's assigned IP (Vercel provides specific records)

5. **SSL/TLS Setup**:
   - Go to **SSL/TLS** in Cloudflare
   - Set to "Full (strict)" for Vercel
   - Vercel automatically provisions Let's Encrypt certificate

6. **Optimize Performance**:
   - Enable Caching under **Caching**
   - Set auto-renew for security

### Using Vercel DNS

1. In Vercel project settings: **Domains**
2. Add your domain
3. Vercel provides DNS records to add at your registrar
4. Add records at registrar
5. Vercel automatically manages SSL via Let's Encrypt

### Using Namecheap DNS

1. Login to Namecheap
2. **Domain List > Manage Domain**
3. **Nameserver Switching**:
   - Choose Cloudflare or Vercel
   - Add provided nameservers
4. **Custom DNS** (if not using nameserver switching):
   - Add A/CNAME records pointing to Vercel

---

## Environment Variables

### Local Development

Create `.env.local`:
```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/zaidknights
JWT_SECRET=dev_secret_change_in_production
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=admin@zaidknights.com
```

### Production (Vercel)

Set in **Vercel Dashboard > Settings > Environment Variables**:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/zaidknights
JWT_SECRET=<generate-strong-random-secret>
NEXT_PUBLIC_SITE_URL=https://zaidknights.com
ADMIN_EMAIL=admin@zaidknights.com
```

Generate secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Post-Deployment Verification

### 1. Test Deployment
- Visit your domain: https://zaidknights.com
- Verify pages load correctly

### 2. Check SSL Certificate
- Visit https://zaidknights.com (confirm lock icon)
- Run SSL test: https://www.ssllabs.com/ssltest/

### 3. Test API Endpoints
```bash
# Test registration
curl -X POST https://zaidknights.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123"}'

# Test login
curl -X POST https://zaidknights.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### 4. Database Connection
```bash
# In Vercel terminal/logs, check for successful Prisma client generation
vercel logs <your-project-url>
```

### 5. SEO Verification
- Check `robots.txt`: https://zaidknights.com/robots.txt
- Check `sitemap.xml`: https://zaidknights.com/sitemap.xml
- Submit to Google Search Console: https://search.google.com/search-console

### 6. Performance Testing
- Run Lighthouse: https://pagespeed.web.dev/
- Target: >90 for Performance, SEO, Accessibility

---

## Production Security Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `DATABASE_URL` with production credentials
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure CORS headers if needed
- [ ] Implement rate limiting on API routes
- [ ] Add admin auth middleware to protected routes
- [ ] Hash all user passwords (bcryptjs configured)
- [ ] Enable Cloudflare DDoS protection
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Enable database backups (Supabase/Neon auto-backup)
- [ ] Restrict API routes to authenticated users
- [ ] Use secure cookies (HttpOnly, Secure, SameSite)
- [ ] Monitor error logs and set up alerts
- [ ] Implement contact form spam protection

---

## Ongoing Maintenance

### Weekly
- Monitor error logs
- Check uptime status
- Review member registrations

### Monthly
- Update dependencies: `npm outdated`
- Backup database
- Review analytics (add Google Analytics)

### Quarterly
- Security audit
- Performance optimization
- User feedback review

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Namecheap Help**: https://www.namecheap.com/support

---

## Quick Deploy Checklist

1. ✅ Database created and connected
2. ✅ Environment variables set
3. ✅ GitHub repository created
4. ✅ Vercel project linked
5. ✅ Domain purchased and nameservers updated
6. ✅ DNS records configured
7. ✅ SSL certificate installed
8. ✅ Email newsletter setup (future)
9. ✅ Analytics installed (future)
10. ✅ Admin user created in database
