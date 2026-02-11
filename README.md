# Blue Line Assistant

Accessibility scanning tool for Figma designs.

## 📦 Components

- **Figma Plugin** (`figma-plugin/`) - Scans Figma designs for accessibility issues
- **Dashboard** (`a11y-dashboard/`) - Next.js web app for viewing and managing scans

## 🚀 Quick Start for Development

### Dashboard
```bash
cd a11y-dashboard
npm install
npm run dev
```

### Figma Plugin
```bash
cd figma-plugin
npm install
npm run build
```

Then load the plugin in Figma: Plugins → Development → Import plugin from manifest → Select `figma-plugin/manifest.json`

## 🌐 Deployment (Required for Distribution)

**Important:** Figma plugins cannot access `localhost`. You MUST deploy the dashboard to a real server with HTTPS.

### Deploy to Vercel (Recommended - Free)

1. Create a GitHub repository and push this code:
   ```bash
   gh repo create blue-line-assistant --public --source=. --remote=origin
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click "New Project" and import your `blue-line-assistant` repository

4. Configure the project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `a11y-dashboard`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. Click "Deploy"

6. After deployment, you'll get a URL like `https://your-app.vercel.app`

7. Update the plugin to use your deployed URL:
   - Edit `figma-plugin/src/code.ts` line 3: `const API_BASE_URL = 'https://your-app.vercel.app/api';`
   - Edit `figma-plugin/src/ui.html` line 293: `value="https://your-app.vercel.app/api"`
   - Rebuild the plugin: `cd figma-plugin && npm run build`

### Optional: Add PostgreSQL Database

By default, the app uses in-memory storage (data is lost on restart). To add persistence:

1. In Vercel dashboard, go to your project → Storage → Create Database → Postgres

2. Connect the database to your project

3. Run the schema:
   ```bash
   psql $POSTGRES_URL -f a11y-dashboard/lib/db/schema.sql
   ```

4. The app will automatically use the database when `POSTGRES_URL` environment variable is set

## 📝 What Gets Scanned

The plugin checks for:

- **Color Contrast:** WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- **Text Size:** Minimum 16px for body text
- **Touch Targets:** Minimum 44×44px for interactive elements

## 🔧 Technical Stack

- **Dashboard:** Next.js 16, TypeScript, Tailwind CSS, PostgreSQL/In-Memory
- **Plugin:** TypeScript, Figma Plugin API

## 🐛 Troubleshooting

**Plugin can't connect to API:**
- Make sure you've deployed the dashboard to Vercel or another HTTPS server
- Figma plugins cannot access `localhost` or local network IPs
- Check that the API URL in the plugin matches your deployed URL

**Database errors:**
- The app automatically falls back to in-memory storage
- For persistence, follow the PostgreSQL setup steps above

## 📄 License

MIT
