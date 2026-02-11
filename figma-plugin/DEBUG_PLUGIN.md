# 🔍 Plugin Debugging Guide

## Quick Diagnosis

### Step 1: Check Plugin Loads
1. Open Figma Desktop App
2. Go to **Plugins** → **Development**
3. Look for **"Blue Line Assistant"**
   - ✅ **Appears**: Plugin manifest is loaded
   - ❌ **Doesn't appear**: Need to import manifest

### Step 2: Check Plugin Opens
1. Click **Plugins** → **Development** → **Blue Line Assistant**
2. Does the UI window open?
   - ✅ **Opens**: Basic plugin working
   - ❌ **Error immediately**: Check DevTools console

### Step 3: Open Figma DevTools
1. **Right-click anywhere** in Figma → **Inspect Element**
2. Go to **Console** tab
3. Look for red error messages
4. Screenshot or copy the error

## Common Errors & Solutions

### Error: "Cannot read property of undefined"

**Cause:** Plugin trying to access Figma nodes that don't exist

**Solution:**
```
1. Create a simple test frame:
   - Press F to create Frame
   - Add some text (T key)
   - Give text a color
   - Name something "Button"

2. Try scan again
```

### Error: "Network request failed"

**Cause:** Dashboard API not accessible

**Solution:**
```bash
# Check dashboard is running
curl http://localhost:3000/api/scans

# Should return: {"scans":[]}

# If not running:
cd /Users/ekosowski/Desktop/a11y/a11y-dashboard
npm run dev
```

### Error: "figma.clientStorage is not a function"

**Cause:** Old Figma version or plugin API issue

**Solution:**
```
1. Update Figma Desktop to latest version
2. Reimport the plugin manifest
3. Try again
```

### Error: Plugin closes immediately

**Cause:** JavaScript error in code.ts

**Solution:**
```
1. Check Figma DevTools console
2. Look for the specific error
3. Check if analyzePage function exists
```

## Test Scan Checklist

Create this exact test setup:

```
Frame 1: "Test Frame"
├─ Background: #FFFFFF (white)
└─ Text: "Submit Button"
   ├─ Color: #AAAAAA (light gray)
   └─ Size: 8px
```

**Expected Results:**
- ❌ Contrast issue (2.3:1, needs 4.5:1)
- ❌ Text size issue (8px, needs 12px minimum)
- Total: 2 issues

## Manual API Test

Test if API works directly:

```bash
# Test 1: Can API receive scans?
curl -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -d '{
    "file_key": "test123",
    "file_name": "Test File",
    "file_url": "https://www.figma.com/file/test123",
    "scan_type": "single_page",
    "pages": [{"page_id": "1", "page_name": "Test Page"}]
  }'

# Should return: {"scan_id": "some-uuid"}
```

## Plugin Console Debug

Add this to see what's happening:

1. In Figma, open **DevTools Console**
2. Click **"Scan Current Page"**
3. Watch for messages:
   ```
   scan-started
   scan-step
   scan-progress
   scan-complete
   OR
   scan-error
   ```

## Check Built Files

```bash
cd /Users/ekosowski/Desktop/a11y/figma-plugin

# Check files exist
ls -la dist/

# Should see:
# - code.js
# - ui.html
# - manifest.json

# Check file sizes
du -h dist/*

# code.js should be ~10kb
# ui.html should be ~12kb
```

## Rebuild Plugin

If errors persist, rebuild from scratch:

```bash
cd /Users/ekosowski/Desktop/a11y/figma-plugin

# Clean
rm -rf dist/

# Rebuild
npm run build

# Should see:
# ✓ Build complete! Plugin ready in dist/
```

## Check Dashboard Logs

While running scan, watch dashboard terminal:

```bash
# In terminal where npm run dev is running:
# Look for:
POST /api/scans 200 (good)
POST /api/scans 500 (bad - API error)
GET /api/issues 200 (good)
```

## Figma Plugin Permissions

Make sure plugin has network access:

1. Check `manifest.json`:
   ```json
   "networkAccess": {
     "allowedDomains": ["*"]
   }
   ```

2. Figma should show network permission when loading plugin

## Simple Test Plugin

Create minimal test to verify plugin works:

1. **Edit `src/code.ts`** - Add at top:
   ```typescript
   console.log('Plugin code loaded!');
   figma.ui.postMessage({ type: 'test', message: 'Hello from plugin!' });
   ```

2. **Edit `src/ui.html`** - Add in window.onmessage:
   ```javascript
   if (msg.type === 'test') {
     alert(msg.message);
   }
   ```

3. **Rebuild**: `npm run build`
4. **Reload plugin** in Figma
5. Should see alert: "Hello from plugin!"

If this works, plugin infrastructure is fine, issue is in scan logic.

## What Error Are You Seeing?

Please provide:
1. **Exact error message** from Figma DevTools Console
2. **When it happens** (on load, on scan click, during scan)
3. **Dashboard terminal output** at the time of error
4. **Browser console** if dashboard is involved

With this info, I can diagnose the specific issue!

## Quick Fixes to Try Now

```bash
# 1. Rebuild plugin
cd /Users/ekosowski/Desktop/a11y/figma-plugin
npm run build

# 2. Restart dashboard
cd /Users/ekosowski/Desktop/a11y/a11y-dashboard
# Ctrl+C to stop
npm run dev

# 3. In Figma:
# - Remove plugin (right-click → Remove)
# - Import fresh (Plugins → Development → Import manifest)
# - Create simple test frame with text
# - Try scan

# 4. Check API endpoint
curl http://localhost:3000/api/scans
# Should return JSON, not error
```

---

**Next:** Share the exact error message you're seeing and I'll fix it!
