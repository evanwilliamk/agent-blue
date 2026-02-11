# How to Load the A11y Checker Plugin in Figma

## Quick Start

Your plugin is already built and ready to use! Follow these steps to load it into Figma Desktop:

### Step 1: Open Figma Desktop App
**Important:** This plugin only works in the Figma Desktop App, not the web browser version.

If you don't have it installed:
- Download from: https://www.figma.com/downloads/

### Step 2: Import the Plugin

1. In Figma Desktop, go to the top menu
2. Click **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to this location and select `manifest.json`:
   ```
   /Users/ekosowski/Desktop/a11y/figma-plugin/manifest.json
   ```

### Step 3: Run the Plugin

1. Open any Figma file with designs
2. Go to **Plugins** → **Development** → **A11y Checker**
3. The plugin UI will appear

### Step 4: Configure API Endpoint

The first time you run the plugin:

1. In the plugin UI, find the API configuration section
2. Enter your dashboard URL:
   ```
   http://localhost:3000/api
   ```
3. This tells the plugin where to send scan results

### Step 5: Run Your First Scan

1. **For testing a single page:**
   - Click "📄 Scan Current Page"
   - Scans only the current Figma page

2. **For a full file scan:**
   - Click "📁 Scan Entire File"
   - Scans all pages in the file (takes longer)

3. Watch the progress bar as the plugin:
   - Analyzes text contrast ratios
   - Checks text sizes
   - Validates touch target sizes
   - Sends results to your dashboard

### Step 6: View Results

1. Go to http://localhost:3000 (your dashboard)
2. See your project appear on the homepage
3. Click "View Issues" to see detailed findings
4. Click on any issue to see recommendations

---

## Troubleshooting

### "Failed to create scan" Error
**Problem:** Plugin can't connect to the dashboard API

**Solutions:**
1. Make sure the dashboard dev server is running:
   ```bash
   cd /Users/ekosowski/Desktop/a11y/a11y-dashboard
   npm run dev
   ```
2. Check the API URL in plugin is: `http://localhost:3000/api`
3. Look at browser DevTools console for error details

### Plugin Not Finding Issues
**Problem:** Scan completes but finds 0 issues

**Solutions:**
1. Make sure your design has text elements
2. Check that text nodes have solid color fills
3. Ensure parent frames have background colors
4. Try a design with known issues (e.g., light gray text on white)

### "Import plugin from manifest" Option Missing
**Problem:** Can't find the development menu option

**Solutions:**
1. You must use **Figma Desktop App**, not web browser
2. Make sure you're using a recent version of Figma Desktop
3. Update Figma Desktop if needed

---

## Plugin Features

### What Gets Scanned

✅ **Color Contrast** (WCAG 1.4.3)
- Checks text against background
- Validates against WCAG AA (4.5:1) and AAA (7:1)
- Large text gets relaxed requirements (3:1)

✅ **Text Size** (WCAG 1.4.4)
- Minimum 12px for body text
- Flags anything smaller

✅ **Touch Targets** (WCAG 2.5.5)
- Minimum 44x44px for interactive elements
- Checks buttons, links, inputs
- Identifies elements by name (must contain "button", "btn", "link", etc.)

### What Gets Sent to Dashboard

For each issue found, the plugin sends:
- Element name and ID
- Issue category (contrast, text_size, touch_target)
- Severity (critical, high, medium, low)
- Current value vs required value
- WCAG criteria reference
- Location (page, frame, coordinates)
- Fix recommendations

---

## Making Changes to the Plugin

If you want to modify the plugin behavior:

### 1. Edit Source Files
```bash
cd /Users/ekosowski/Desktop/a11y/figma-plugin
```

- **Logic:** Edit `src/code.ts` (scanning algorithms)
- **UI:** Edit `src/ui.html` (user interface)
- **Config:** Edit `manifest.json` (plugin settings)

### 2. Rebuild
```bash
npm run build
```

This compiles TypeScript and outputs to `dist/` directory.

### 3. Reload in Figma
- In Figma Desktop: **Plugins** → **Development** → **A11y Checker** → Right-click → **Reload**
- Or close and reopen the plugin

---

## Publishing (Future)

When you're ready to share the plugin publicly:

1. **Test thoroughly** with various designs
2. **Create plugin thumbnail** (128x128px icon)
3. **Write description** for Figma Community
4. In Figma Desktop:
   - **Plugins** → **Development** → **A11y Checker**
   - Right-click → **Publish**
5. Submit for Figma Community review

**Note:** For now, keep using the development version with your team!

---

## Quick Reference

**Plugin Location:**
```
/Users/ekosowski/Desktop/a11y/figma-plugin/manifest.json
```

**Dashboard URL:**
```
http://localhost:3000
```

**API Endpoint:**
```
http://localhost:3000/api
```

**Load Command:**
Figma Desktop → Plugins → Development → Import plugin from manifest

**Run Command:**
Figma Desktop → Plugins → Development → A11y Checker

---

Happy accessibility checking! 🎉
