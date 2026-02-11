# Plugin Troubleshooting Guide

## 🔍 Plugin Not Working? Let's Fix It!

Follow these steps in order to diagnose and fix the issue.

---

## Step 1: Verify Plugin is Loaded

### Check if plugin appears in Figma:

1. Open **Figma Desktop App**
2. Go to **Plugins** → **Development**
3. Look for **"A11y Checker"** in the list

**✅ If you see it:** Plugin is loaded correctly, go to Step 2
**❌ If you don't see it:** Follow these steps:

```
1. Plugins → Development → Import plugin from manifest...
2. Navigate to: /Users/ekosowski/Desktop/a11y/figma-plugin/manifest.json
3. Select the manifest.json file
4. Click "Open"
```

---

## Step 2: Verify Dashboard is Running

### Check if web server is running:

Open Terminal and run:
```bash
cd /Users/ekosowski/Desktop/a11y/a11y-dashboard
npm run dev
```

You should see:
```
▲ Next.js 16.1.6 (Turbopack)
- Local:    http://localhost:3000
✓ Ready in XXXms
```

**✅ If you see this:** Dashboard is running, go to Step 3
**❌ If you get errors:** Try these fixes:

```bash
# Kill any process using port 3000
lsof -ti:3000 | xargs kill -9

# Restart
npm run dev
```

### Test API endpoint:

Open browser and visit:
```
http://localhost:3000/api/scans
```

**Expected response:**
```json
{
  "scans": []
}
```

**✅ If you see JSON:** API is working, go to Step 3
**❌ If you see error page:** Dashboard has an issue, check console logs

---

## Step 3: Configure Plugin API

### In Figma plugin UI:

1. Run plugin: **Plugins** → **Development** → **A11y Checker**
2. Scroll to "⚙️ Configuration" section
3. Set API URL to:
   ```
   http://localhost:3000/api
   ```
   **IMPORTANT:** No trailing slash!
4. Click **"Save Configuration"**
5. You should see: "✓ Configuration saved"

---

## Step 4: Test with Simple Design

### Create a test frame with known issues:

1. In Figma, create a new **Frame** (F key)
2. Name it: **"Test Frame"**
3. Add white background: `#FFFFFF`
4. Add **Text** (T key):
   - Content: "Submit Button"
   - Color: Light gray `#AAAAAA`
   - Size: 8px (intentionally small)
5. Name the text: **"Submit Button"**

### Run the scan:

1. Make sure you're on the page with your test frame
2. Open plugin: **Plugins** → **Development** → **A11y Checker**
3. Click **"📄 Scan Current Page"**

### Watch the detailed progress log:

You should see messages like:
```
🔍 Starting scan of current page...
📄 Analyzing page: Page 1
✓ Found 2 issues on this page
📤 Sending results to dashboard...
🔗 Connecting to dashboard API...
📝 Creating scan record...
✓ Scan record created
📤 Uploading 2 issues...
✓ 2 issues uploaded successfully
```

**✅ If you see these messages:** Plugin is working! Go to Step 5
**❌ If you see errors:** Continue to Common Errors section below

---

## Step 5: Verify Results in Dashboard

1. Open browser: **http://localhost:3000**
2. You should see your project appear on the homepage
3. Click **"View Issues"** to see the 2 test issues:
   - Contrast issue (light gray on white)
   - Text size issue (8px text)

**✅ If you see issues:** Everything is working! 🎉
**❌ If no issues appear:** Check Common Errors below

---

## Common Errors & Solutions

### Error: "Failed to create scan"

**Possible causes:**
1. Dashboard not running
2. Wrong API URL in plugin
3. Network/CORS issue

**Solutions:**
```bash
# 1. Verify dashboard is running
curl http://localhost:3000/api/scans

# 2. Check plugin API URL
# In plugin UI: should be http://localhost:3000/api (no trailing slash)

# 3. Check Figma DevTools Console
# In Figma: Right-click → Inspect Element → Console tab
# Look for error messages
```

### Error: "Scan complete! Found 0 issues"

**Possible causes:**
1. No text elements in design
2. Text doesn't have solid colors
3. Interactive elements not named correctly
4. Background colors missing

**Solutions:**
- Make sure test frame has:
  - ✅ Text with solid fill color
  - ✅ Frame with solid background color
  - ✅ Named elements (contains "button", "btn", "link")
  - ✅ Small text (< 12px)
  - ✅ Poor contrast colors

### Error: Network request failed

**Possible causes:**
1. API URL has trailing slash
2. Dashboard crashed
3. Port 3000 in use by another app

**Solutions:**
```bash
# Check if port 3000 is accessible
curl http://localhost:3000

# Check dashboard logs
# Look in terminal where you ran npm run dev

# Restart dashboard
cd /Users/ekosowski/Desktop/a11y/a11y-dashboard
npm run dev
```

### Plugin UI not showing progress

**Solution:**
```
1. Close the plugin
2. In Figma: Plugins → Development → A11y Checker → Right-click → Reload
3. Run plugin again
```

### Results not appearing in dashboard

**Possible causes:**
1. Database not connected (expected for now)
2. API error occurred
3. Browser cache issue

**Solutions:**
```bash
# 1. Check dashboard terminal for errors
# Look for red error messages

# 2. Hard refresh browser
# Chrome: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# 3. Check API directly
curl http://localhost:3000/api/scans

# 4. Check browser console
# Right-click page → Inspect → Console tab
# Look for red errors
```

---

## Advanced Debugging

### Enable Figma Plugin DevTools:

1. In Figma Desktop: **Right-click anywhere** → **Inspect Element**
2. Go to **Console** tab
3. Run your scan
4. Look for error messages

### Check Dashboard Logs:

In terminal where `npm run dev` is running:
```
- Watch for 200 responses (good)
- Watch for 500 errors (bad - API issue)
- Database errors are EXPECTED (PostgreSQL not set up yet)
```

### Test API Manually:

```bash
# Create a test scan
curl -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -d '{
    "file_key": "test123",
    "file_name": "Test File",
    "file_url": "https://www.figma.com/file/test123",
    "scan_type": "single_page",
    "pages": [{"page_id": "1", "page_name": "Test Page"}]
  }'

# Should return:
# {"scan_id": "..."}
```

---

## Still Not Working?

### Collect Debug Information:

1. **Plugin Console Output:**
   - Figma → Right-click → Inspect Element → Console tab
   - Copy any error messages

2. **Dashboard Terminal Output:**
   - Copy the last 20-30 lines from npm run dev terminal

3. **API Test Results:**
   ```bash
   curl http://localhost:3000/api/scans
   ```
   - Copy the response

4. **Plugin Configuration:**
   - Open plugin in Figma
   - Check API URL value in configuration section

### Check These Common Issues:

- [ ] Figma Desktop App (not browser version)
- [ ] Dashboard running at http://localhost:3000
- [ ] Plugin loaded via manifest.json
- [ ] API URL is `http://localhost:3000/api` (no trailing slash)
- [ ] Test design has text with colors
- [ ] Browser can access http://localhost:3000

---

## Quick Reset

If everything is broken, start fresh:

```bash
# 1. Close Figma plugin
# 2. Stop dashboard (Ctrl+C in terminal)
# 3. Kill port 3000
lsof -ti:3000 | xargs kill -9

# 4. Restart dashboard
cd /Users/ekosowski/Desktop/a11y/a11y-dashboard
npm run dev

# 5. Reload plugin in Figma
# Right-click plugin → Reload

# 6. Try test scan again
```

---

## Success Checklist

You know it's working when you see:

✅ Plugin appears in Figma → Development → A11y Checker
✅ Dashboard shows "Ready" at http://localhost:3000
✅ Clicking "Scan Current Page" shows detailed progress log
✅ Progress messages appear in real-time
✅ "Scan complete" message shows issue count
✅ Dashboard homepage shows new project
✅ Clicking "View Issues" shows found problems

---

## Pro Tips

1. **Keep Terminal Visible:** Watch dashboard logs while scanning
2. **Use Simple Test Design:** Start with known issues before real designs
3. **Check Progress Log:** New detailed messages show exactly what's happening
4. **Reload Plugin:** After making changes, always reload via right-click menu
5. **Hard Refresh Browser:** Cmd+Shift+R to clear cache

---

Need more help? Check the main guides:
- `QUICK_LOAD_PLUGIN.md` - Loading instructions
- `HOW_TO_LOAD.md` - Comprehensive guide
- `README.md` - Plugin overview
