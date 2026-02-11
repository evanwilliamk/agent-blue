# Deployment Guide

## Why You Need to Deploy

**Figma plugins cannot access localhost or local network IPs.** This is a security restriction in Figma's plugin system. To distribute your plugin, you must deploy the dashboard to a real HTTPS server.

## Option 1: Deploy to Vercel (Easiest - 10 minutes)

### Step 1: Push to GitHub

```bash
# Create a repository on GitHub (do this manually at github.com/new)
# Name it: blue-line-assistant

# Then push your code:
git remote add origin https://github.com/YOUR_USERNAME/blue-line-assistant.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign in with GitHub"
3. Click "New Project"
4. Import your `blue-line-assistant` repository
5. Configure:
   - **Root Directory:** `a11y-dashboard` (click "Edit" next to this)
   - Leave other settings as default
6. Click "Deploy"
7. Wait 2-3 minutes for deployment to complete
8. You'll get a URL like: `https://blue-line-assistant-xxx.vercel.app`

### Step 3: Update Plugin with Your URL

Edit `figma-plugin/src/code.ts`:
```typescript
const API_BASE_URL = 'https://YOUR-VERCEL-URL.vercel.app/api';
```

Edit `figma-plugin/src/ui.html` (around line 293):
```html
value="https://YOUR-VERCEL-URL.vercel.app/api"
```

Rebuild the plugin:
```bash
cd figma-plugin
npm run build
```

Reload the plugin in Figma and test!

## Option 2: Other Platforms

### Netlify
- Similar to Vercel
- Free tier available
- Set build directory to `a11y-dashboard`

### Railway
- Free tier with $5 credit
- Good for apps with databases
- Auto-detects Next.js

### Render
- Free tier available
- Set root directory to `a11y-dashboard`

## Adding a Database (Optional)

By default, the app uses in-memory storage (data resets on restart).

### Vercel Postgres (Easiest)

1. In your Vercel project dashboard, go to Storage tab
2. Click "Create Database" → Select "Postgres"
3. Click "Create"
4. Go to your database → ".env.local" tab → Copy the connection string
5. In your project settings → Environment Variables → Add:
   - Key: `POSTGRES_URL`
   - Value: (paste the connection string)
6. Connect to your database and run the schema:
   ```bash
   psql YOUR_POSTGRES_URL -f a11y-dashboard/lib/db/schema.sql
   ```
7. Redeploy your app

The app will automatically use the database when `POSTGRES_URL` is set!

## Testing After Deployment

1. Open your deployed URL in a browser
2. You should see the "Blue Line Assistant" dashboard
3. Open Figma → Load your plugin
4. Click "Scan Current Page"
5. Results should appear in the dashboard!

## Troubleshooting

**"Network error: Failed to connect to API"**
- Make sure your deployed URL is HTTPS (not HTTP)
- Check that you updated both `code.ts` and `ui.html` with the correct URL
- Verify your deployment is live by visiting the URL in a browser

**"Database error"**
- Check that `POSTGRES_URL` environment variable is set in Vercel
- The app will fall back to in-memory storage if database fails

**Changes not reflecting**
- Rebuild the plugin: `cd figma-plugin && npm run build`
- Reload the plugin in Figma: Plugins → Development → Hot reload current plugin
