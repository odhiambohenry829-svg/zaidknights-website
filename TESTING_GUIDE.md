# ZaidKnights Chess Club - Testing & QA Guide

## Pre-Launch Testing Checklist

Complete all tests before deploying to production.

---

## 1. Unit & Integration Tests

### Frontend Component Tests

- [ ] **Navbar Navigation**
  - [ ] All links navigate correctly
  - [ ] Mobile menu toggle works
  - [ ] Active link highlighting
  - [ ] Logo links to home

- [ ] **Button Components**
  - [ ] Buttons display correctly
  - [ ] Hover states work
  - [ ] Click events fire
  - [ ] Disabled state works

- [ ] **Form Inputs**
  - [ ] Text input accepts text
  - [ ] Email input validates format
  - [ ] Password input masks text
  - [ ] Select dropdown opens/closes
  - [ ] Form submission works

### Backend API Tests

#### Authentication Routes

**POST /api/auth/register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"TestPass123"
  }'

# Expected: 201 Created with user data
```

- [ ] Valid registration succeeds
- [ ] Duplicate email returns 409
- [ ] Missing fields returns 400
- [ ] Invalid email returns 400
- [ ] User created in database
- [ ] Password is hashed

**POST /api/auth/login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123"
  }' \
  -v

# Expected: 200 OK with user data
# Check for Set-Cookie header with zk_token
```

- [ ] Valid credentials return 200
- [ ] Invalid password returns 401
- [ ] Nonexistent email returns 401
- [ ] JWT token is set in cookie
- [ ] Token is valid and signed

**GET /api/auth/logout**
```bash
curl -X GET http://localhost:3000/api/auth/logout \
  -v

# Expected: 200 OK
# Check for Set-Cookie clearing token
```

- [ ] Logout clears token cookie
- [ ] Returns 200 OK

#### Content Routes

**GET /api/events**
```bash
curl http://localhost:3000/api/events | json_pp

# Expected: 200 OK with events array
```

- [ ] Returns all events
- [ ] Event object has required fields
- [ ] No authentication required

**POST /api/events** (Admin only)
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title":"New Event",
    "slug":"new-event",
    "description":"Test event",
    "location":"Nairobi",
    "startDate":"2026-05-25T09:00:00Z",
    "endDate":"2026-05-27T18:00:00Z",
    "capacity":64
  }'

# Expected: 201 Created
```

- [ ] Valid event creation succeeds
- [ ] Missing fields returns 400
- [ ] Event appears in GET request

**GET /api/members**
```bash
curl http://localhost:3000/api/members | json_pp

# Expected: 200 OK with members array
```

- [ ] Returns all members
- [ ] Includes user data
- [ ] No authentication required

**GET /api/posts**
```bash
curl http://localhost:3000/api/posts | json_pp

# Expected: 200 OK with published posts
```

- [ ] Returns only published posts
- [ ] Ordered by creation date

**GET /api/gallery**
```bash
curl http://localhost:3000/api/gallery | json_pp

# Expected: 200 OK with gallery items
```

- [ ] Returns all gallery items
- [ ] Ordered by creation date

**POST /api/contact**
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Test",
    "email":"john@example.com",
    "message":"Test message"
  }'

# Expected: 201 Created
```

- [ ] Valid contact succeeds
- [ ] Missing fields returns 400
- [ ] Invalid email returns 400
- [ ] Message saved to database

**GET /api/dashboard/stats**
```bash
curl http://localhost:3000/api/dashboard/stats | json_pp

# Expected: 200 OK with statistics
```

- [ ] Returns member count
- [ ] Returns event count
- [ ] Returns post count

---

## 2. Page Load Tests

### Public Pages

- [ ] **Home (/)** - Loads < 2 seconds
- [ ] **About (/about)** - Renders correctly
- [ ] **Membership (/membership)** - Form inputs work
- [ ] **Events (/events)** - Events display
- [ ] **Rankings (/rankings)** - Table displays
- [ ] **Gallery (/gallery)** - Images load
- [ ] **Blog (/blog)** - Posts display
- [ ] **Contact (/contact)** - Form submits

### Authentication Pages

- [ ] **Login (/login)** - Form works
- [ ] **Register (/register)** - Registration works
- [ ] **Login → Register** - Navigation works
- [ ] **Register → Login** - Redirect works

### Protected Pages

- [ ] **Dashboard (/dashboard)** - Requires auth
- [ ] **Admin (/admin)** - Admin-only (implement auth check)

---

## 3. User Flow Testing

### Registration Flow

```
1. Visit /register
   ✓ Page loads
   ✓ Form visible

2. Fill form:
   ✓ Name input accepts text
   ✓ Email input accepts email
   ✓ Password input masks text

3. Submit:
   ✓ Form validates
   ✓ API endpoint called
   ✓ User created in database
   ✓ Redirect to /login
```

### Login Flow

```
1. Visit /login
   ✓ Page loads

2. Fill form:
   ✓ Email input accepts email
   ✓ Password input masks

3. Submit:
   ✓ API endpoint called
   ✓ Token received
   ✓ Cookie set
   ✓ Redirect to /dashboard
```

### Event Registration Flow

```
1. Visit /events
   ✓ Page loads
   ✓ Events display

2. Click Register:
   ✓ Registration form opens (or redirects)
   ✓ User can confirm
   ✓ Database updated
   ✓ Confirmation message shown
```

### Contact Form Flow

```
1. Visit /contact
   ✓ Page loads

2. Fill form:
   ✓ Name accepts text
   ✓ Email validates format
   ✓ Message accepts long text

3. Submit:
   ✓ Form validates
   ✓ API endpoint called
   ✓ Message saved to database
   ✓ Success message shown
```

---

## 4. Responsive Design Tests

### Mobile (iPhone 375px width)
- [ ] Navigation menu works (hamburger)
- [ ] Text is readable
- [ ] Buttons are touch-friendly (48px+)
- [ ] Images scale properly
- [ ] Forms are usable

### Tablet (iPad 768px width)
- [ ] 2-column layouts work
- [ ] Navigation is accessible
- [ ] All pages render properly

### Desktop (1920px width)
- [ ] Multi-column layouts work
- [ ] Full width utilized
- [ ] Navigation bar full width

### Test Devices/Browsers

**Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Devices:**
- [ ] iPhone 12/13/14
- [ ] Android device
- [ ] iPad
- [ ] Desktop (various resolutions)

---

## 5. Performance Tests

### Load Time

Target: **< 2 seconds** home page load

Test with:
```bash
# Chrome DevTools Lighthouse
# Or use WebPageTest: https://www.webpagetest.org/

# Local testing:
npm run build
npm start
# Then measure load time
```

- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total Blocking Time < 300ms

### Lighthouse Scores

Run Chrome DevTools Lighthouse:

- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

### Database Performance

- [ ] User registration < 500ms
- [ ] Login < 300ms
- [ ] Events fetch < 200ms
- [ ] Members fetch < 500ms

---

## 6. Security Tests

### Input Validation

- [ ] SQL injection attempt blocked
  ```sql
  email: admin@example.com'; DROP TABLE users--
  ```
- [ ] XSS attempt blocked
  ```
  name: <script>alert('XSS')</script>
  ```
- [ ] Email validation rejects invalid
  ```
  email: notanemail
  ```

### Authentication Security

- [ ] Password hashing verified (not plain text)
- [ ] JWT token signature validated
- [ ] Expired tokens rejected
- [ ] Token tamper-detection works
- [ ] Secure cookies set (HttpOnly, Secure)

### API Security

- [ ] Unauthenticated admin routes return 401
- [ ] CORS headers set correctly
- [ ] Missing Content-Type handled
- [ ] Large payloads rejected (if limit set)

### Password Security

- [ ] Minimum 8 characters enforced
- [ ] Hashing with bcryptjs verified
- [ ] Different users have different hashes
- [ ] Rainbow table attack resistant

---

## 7. Database Tests

### Data Integrity

- [ ] User email is unique
- [ ] Member user relationship maintained
- [ ] Event registrations have valid user/event IDs
- [ ] Results reference valid events/users

### CRUD Operations

**Create:**
- [ ] New user created correctly
- [ ] New event created correctly
- [ ] New post created correctly

**Read:**
- [ ] Users fetched correctly
- [ ] Events fetched correctly
- [ ] Members fetched correctly

**Update:**
- [ ] User data updates correctly
- [ ] Event data updates correctly
- [ ] Member status updates correctly

**Delete:**
- [ ] User deletion cascades correctly
- [ ] Event deletion cascades correctly
- [ ] Data consistency maintained

### Database Backup

- [ ] Backup mechanism configured
- [ ] Restore from backup works
- [ ] No data loss on restore

---

## 8. Error Handling Tests

### 404 Errors

- [ ] Invalid URL returns 404
- [ ] 404 page displays correctly
- [ ] Home link available on 404 page

### 500 Errors

- [ ] Database errors return 500
- [ ] Error message is generic (not detailed)
- [ ] Error is logged
- [ ] User sees friendly error message

### Form Errors

- [ ] Missing required fields show error
- [ ] Invalid email shows error
- [ ] Duplicate email shows error
- [ ] Error messages are clear

### Network Errors

- [ ] Network timeout handled
- [ ] Retry mechanism works (if implemented)
- [ ] User receives friendly message

---

## 9. SEO Tests

### Meta Tags

- [ ] Page title set on all pages
- [ ] Meta description set
- [ ] Open Graph tags present
- [ ] Twitter cards present

### Sitemap & Robots

- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] All public pages in sitemap

### Structured Data

- [ ] JSON-LD markup valid
- [ ] Schema.org markup correct
- [ ] Google Rich Results test passes

---

## 10. Browser Console Tests

### No JavaScript Errors

Open Chrome DevTools Console (F12):

- [ ] No red errors on any page
- [ ] No warnings that affect functionality
- [ ] All resources load (no 404s)

### Local Storage / Cookies

- [ ] zk_token cookie set after login
- [ ] Cookie cleared after logout
- [ ] No sensitive data in localStorage

---

## 11. Accessibility Tests

### Keyboard Navigation

- [ ] All buttons accessible via Tab
- [ ] Form inputs accessible
- [ ] Links navigable
- [ ] Focus visible (gold outline)

### Screen Reader

Test with NVDA (Windows) or VoiceOver (Mac):

- [ ] Page structure announced correctly
- [ ] Images have alt text
- [ ] Form labels associated
- [ ] Headings hierarchical

### Color Contrast

Use WebAIM Contrast Checker:

- [ ] Black text on white: Pass
- [ ] Gold on black: Pass (15.6:1 AAA)
- [ ] White on dark gray: Pass

---

## 12. Cross-Browser Compatibility

### Desktop Browsers

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✓ Test |
| Firefox | Latest | ✓ Test |
| Safari | Latest | ✓ Test |
| Edge | Latest | ✓ Test |

### Mobile Browsers

| Browser | Device | Status |
|---------|--------|--------|
| Chrome | Android | ✓ Test |
| Safari | iOS | ✓ Test |
| Firefox | Android | ✓ Test |

---

## Manual Testing Checklist

### Pre-Launch (1 Week Before)

```
Day 1:
- [ ] Complete all API tests
- [ ] Test all user flows
- [ ] Verify database integrity

Day 2-3:
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify responsive design

Day 4-5:
- [ ] Run Lighthouse tests
- [ ] Test accessibility
- [ ] Verify SEO

Day 6:
- [ ] Security audit
- [ ] Error handling review
- [ ] Performance optimization

Day 7:
- [ ] Final sanity check
- [ ] Verify all links
- [ ] Test contact form
- [ ] Ready for deployment
```

---

## Automated Testing (Future)

Consider implementing:
- Jest for unit tests
- React Testing Library for component tests
- Cypress for e2e tests
- Postman for API tests

---

## Bug Report Template

If you find an issue:

```
Title: [Component] Brief description
Severity: Critical / High / Medium / Low
Steps to Reproduce:
1. Visit page
2. Fill form
3. Submit

Expected Result:
Success message shown

Actual Result:
Error shown instead

Browser: Chrome 120
Device: MacBook Pro
```

---

## Sign-Off Checklist

- [ ] All tests passed
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Accessibility confirmed
- [ ] Ready for production

---

**Testing Complete!** Ready to deploy to production. Follow DEPLOYMENT_GUIDE.md for next steps.
