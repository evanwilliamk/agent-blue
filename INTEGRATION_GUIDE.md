# A11y Dashboard + Figma Plugin - Integration Guide

Complete setup guide for the accessibility checking system with Figma plugin and web dashboard.

## System Overview

**Two Components:**
1. **Web Dashboard** (`a11y-dashboard/`) - Next.js app for viewing/managing issues
2. **Figma Plugin** (`figma-plugin/`) - Scans Figma designs and sends data to dashboard

**Data Flow:**
```
Figma Design
    ↓ [Plugin scans]
    ↓ [POST /api/scans]
    ↓ [POST /api/scans/{id}/issues]
PostgreSQL Database
    ↓ [Web app queries]
Web Dashboard UI
```

---

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or Adobe Protopack)
- Figma Desktop App
- Modern web browser

---

## Part 1: Database Setup

### Option A: Local PostgreSQL (Development)

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb a11y_dashboard

# Run schema
psql a11y_dashboard < a11y-dashboard/lib/db/schema.sql
```

### Option B: Adobe Protopack (Production)

1. Get your connection string from Protopack
2. Format: `postgresql://user:password@host:port/database?ssl=true`
3. Use this in `.env.local` (see below)

### Option C: Supabase (Cloud, Free)

1. Sign up at https://supabase.com
2. Create new project
3. Go to **SQL Editor** → **New query**
4. Paste contents of `a11y-dashboard/lib/db/schema.sql`
5. Run query
6. Copy connection string from **Settings** → **Database**

---

## Part 2: Web Dashboard Setup

### 1. Install Dependencies

```bash
cd a11y-dashboard
npm install
```

### 2. Configure Environment

```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local
nano .env.local
```

**Required variables:**
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/a11y_dashboard

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Environment
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 to verify it's running.

### 4. Seed WCAG Guidelines (Optional)

The dashboard comes with 11 WCAG guidelines in `data/wcag-guidelines.json`. To import these into the database:

```bash
# Create a seeder script (add this file)
```

---

## Part 3: Figma Plugin Setup

### 1. Build the Plugin

```bash
cd ../figma-plugin
npm install
npm run build
```

This creates `dist/` folder with compiled plugin.

### 2. Load Plugin in Figma

1. Open **Figma Desktop App** (not web browser!)
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to `/Users/ekosowski/Desktop/a11y/figma-plugin/dist/manifest.json`
4. Click **Open**

Plugin now appears in **Plugins** → **A11y Checker**

### 3. Configure API Connection

1. Open any Figma file
2. **Plugins** → **A11y Checker**
3. In the Configuration section, enter API URL:
   - Local: `http://localhost:3000/api`
   - Production: `https://your-domain.com/api`
4. Click **Save Configuration**

---

## Part 4: First Scan Test

### 1. Prepare Test Design

In Figma:
- Create a simple button with text
- Use a light gray text (#AAAAAA) on white background (intentional low contrast)
- Name the button "Submit Button" so plugin detects it

### 2. Run Scan

1. **Plugins** → **A11y Checker**
2. Click **📄 Scan Current Page**
3. Wait for "Scan complete!" message
4. Note the issue count

### 3. View Results

1. Go to http://localhost:3000
2. You should see the scanned file listed
3. Navigate to issues (need to build this UI!)

---

## Part 5: Testing the Integration

### Test API Endpoints

```bash
# Create a test scan
curl -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -d '{
    "file_key": "test123",
    "file_name": "Test File",
    "scan_type": "single_page",
    "pages": [{"page_id": "1:1", "page_name": "Test Page"}]
  }'

# Should return: {"scan_id": "...", "file_id": "...", "message": "Scan initiated successfully"}
```

### Verify Database

```bash
# Check scans were created
psql a11y_dashboard -c "SELECT * FROM scans ORDER BY created_at DESC LIMIT 5;"

# Check issues were created
psql a11y_dashboard -c "SELECT id, element_name, category, severity FROM issues LIMIT 5;"
```

---

## Part 6: Next Steps - Enhance Web Dashboard

The current dashboard has the contrast checker and guidelines. Now add:

### 1. Issues Dashboard

Create `/app/issues/page.tsx`:
- List all issues from database
- Filter by severity, status, category
- Assign to team members
- Update status

### 2. File Browser

Create `/app/files/page.tsx`:
- List all scanned Figma files
- Show scan history
- View issues per file

### 3. Issue Detail Page

Create `/app/issues/[id]/page.tsx`:
- Show full issue details
- Display screenshots (if captured)
- Add comments
- Link to WCAG guidelines
- Create annotations

---

## Common Issues & Solutions

### Plugin Can't Connect to API

**Problem**: "Failed to create scan" error

**Solutions**:
1. Verify web app running: `curl http://localhost:3000/api/scans`
2. Check API URL in plugin configuration
3. Look for CORS errors in browser console
4. Ensure `networkAccess` enabled in `manifest.json`

### Database Connection Failed

**Problem**: "Database query error" in logs

**Solutions**:
1. Verify `DATABASE_URL` in `.env.local`
2. Test connection: `psql $DATABASE_URL -c "SELECT 1;"`
3. Check database is running: `brew services list` (macOS)
4. Ensure SSL settings match (local=false, production=true)

### No Issues Found in Scan

**Problem**: Plugin says "0 issues" but design has problems

**Solutions**:
1. Check node naming (buttons need "button"/"btn" in name)
2. Ensure text has solid color fills
3. Verify parent frames have background fills
4. Try increasing contrast to confirm detection works

### Plugin Won't Load in Figma

**Problem**: Can't find plugin in menu

**Solutions**:
1. Must use Figma Desktop App (not web browser)
2. Check `dist/manifest.json` exists after build
3. Try **Remove plugin** then re-import
4. Restart Figma Desktop App

---

## Architecture Decisions

### Why PostgreSQL?

- Robust relational data for issues, scans, users
- JSONB support for flexible annotation data
- Full-text search capabilities (future)
- Proven at scale

### Why Next.js API Routes?

- Same codebase for frontend and backend
- Serverless deployment ready
- TypeScript throughout
- Easy authentication with NextAuth

### Why Figma Plugin?

- Direct access to design properties
- Real-time scanning capability
- No manual export/import needed
- Integrated workflow for designers

---

## Deployment

### Web Dashboard (Vercel)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# Deploy on Vercel
# 1. Connect GitHub repo at vercel.com
# 2. Add environment variables:
#    - DATABASE_URL
#    - NEXTAUTH_URL (your domain)
#    - NEXTAUTH_SECRET
# 3. Deploy
```

### Figma Plugin (Public)

To publish plugin publicly:
1. Build: `npm run build`
2. **Plugins** → **Development** → **Publish**
3. Fill in plugin details
4. Submit for review
5. Users can install from Community

---

## Development Workflow

### Daily Use

1. **Morning**: Start web app
   ```bash
   cd a11y-dashboard && npm run dev
   ```

2. **Design Review**: Open Figma design → Run plugin scan

3. **Issue Management**: View issues in web dashboard

4. **Collaboration**: Assign issues, add comments, track progress

### Team Setup

1. Each designer installs plugin
2. All connect to same web app URL
3. Shared database tracks all scans
4. Team dashboard shows combined metrics

---

## Performance Considerations

### Large Files

- Files with 1000+ nodes take 1-2 minutes
- Use "Scan Current Page" for faster feedback
- Consider incremental scanning (future feature)

### Database

- Indexes already added for common queries
- Monitor slow queries: `EXPLAIN ANALYZE SELECT...`
- Consider pagination for large result sets

### API

- Batch issue creation for efficiency
- Transaction support for data integrity
- Connection pooling (20 max connections)

---

## Security Notes

### API Authentication

Current: No authentication (development only)

Production: Add middleware to verify requests:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization');
  // Verify token...
}
```

### Database

- Use read-only credentials for reporting
- Separate user for plugin API access
- Enable SSL in production
- Regular backups

### Figma Plugin

- No sensitive data stored locally
- API URL only stored setting
- All data sent over HTTPS in production

---

## Monitoring

### Key Metrics

- Scans per day
- Issues found per scan
- Most common issue categories
- Resolution time (open → resolved)
- Team activity

### Logging

Check logs:
```bash
# Database queries
tail -f /path/to/postgres/log

# Next.js server
# Shown in terminal where `npm run dev` is running

# Figma plugin
# Plugins → Development → Open Console
```

---

## Next Features to Build

### Phase 1 (Current MVP)
- [x] Figma plugin with contrast/size/touch checks
- [x] API endpoints for scans and issues
- [x] Database schema
- [ ] Issues dashboard UI
- [ ] Issue detail pages

### Phase 2 (Enhanced)
- [ ] User authentication
- [ ] Team management
- [ ] Comments system
- [ ] Annotations UI
- [ ] Export reports (PDF/CSV)

### Phase 3 (Advanced)
- [ ] Screenshot capture in plugin
- [ ] Gradient contrast analysis
- [ ] Heading hierarchy checking
- [ ] Focus order validation
- [ ] Real-time collaboration

---

## Support

- **Web Dashboard**: See `a11y-dashboard/README.md`
- **Figma Plugin**: See `figma-plugin/README.md`
- **Database Schema**: See `a11y-dashboard/lib/db/schema.sql`
- **API Docs**: See API endpoint comments in route files

---

## License

MIT - Use freely for your projects
