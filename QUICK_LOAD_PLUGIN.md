# 🚀 Quick Load Guide - A11y Checker Plugin

## 📦 Load the Plugin (30 seconds)

### Your Plugin Path:
```
/Users/ekosowski/Desktop/a11y/figma-plugin/manifest.json
```

### Steps:

1. **Open Figma Desktop App** (must be desktop, not browser!)

2. **Menu Bar → Plugins → Development → Import plugin from manifest...**

3. **Select the manifest.json file** from the path above

4. **Done!** Plugin appears at: **Plugins → Development → A11y Checker**

---

## 🎯 Run Your First Scan

1. Open any Figma file with designs
2. **Plugins** → **Development** → **A11y Checker**
3. Enter API URL: `http://localhost:3000/api`
4. Click **"📄 Scan Current Page"**
5. Go to http://localhost:3000 to see results!

---

## ✅ Checklist

- [ ] Figma Desktop App installed
- [ ] Dashboard running (`npm run dev` in a11y-dashboard)
- [ ] Plugin loaded via Import manifest
- [ ] API configured in plugin: `http://localhost:3000/api`
- [ ] First scan completed
- [ ] Results visible on dashboard homepage

---

## 🆘 Need Help?

See full guide: `/Users/ekosowski/Desktop/a11y/figma-plugin/HOW_TO_LOAD.md`

**Common Issues:**
- ❌ "Can't find Import manifest option" → Use Desktop App, not browser
- ❌ "Failed to create scan" → Check dashboard is running at localhost:3000
- ❌ "Found 0 issues" → Make sure design has text with colors

---

## 🎨 What It Checks

✅ Text contrast ratios (WCAG AA: 4.5:1, AAA: 7:1)
✅ Text sizes (minimum 12px)
✅ Touch targets (minimum 44x44px for buttons)

**Pro Tip:** Create a test artboard with known issues:
- Light gray text (#AAAAAA) on white background (#FFFFFF)
- 8px text size
- 30x30px button

Run a scan and verify the plugin finds all 3 issues!
