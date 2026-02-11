# A11y Checker - Figma Plugin

Automated accessibility scanning for Figma designs. Checks for color contrast, text size, touch targets, and sends results to the A11y Dashboard web app.

## Features

- ✅ **Color Contrast Checking**: WCAG 2.1 AA/AAA compliance
- ✅ **Text Size Validation**: Minimum 12px requirement
- ✅ **Touch Target Sizing**: 44x44px minimum for interactive elements
- ✅ **Automatic API Integration**: Sends results directly to web dashboard
- ✅ **Real-time Progress**: Visual feedback during scans

## Installation

### 1. Build the Plugin

```bash
cd figma-plugin
npm install
npm run build
```

### 2. Load in Figma

1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select `/Users/ekosowski/Desktop/a11y/figma-plugin/dist/manifest.json`
4. Plugin will appear in your Plugins menu as "A11y Checker"

## Usage

### First Time Setup

1. Open the plugin: **Plugins** → **A11y Checker**
2. Configure API URL (default: `http://localhost:3000/api`)
3. Click **Save Configuration**

### Scanning Designs

**Scan Current Page:**
- Opens the plugin
- Click "📄 Scan Current Page"
- Results sent to web dashboard

**Scan Entire File:**
- Opens the plugin
- Click "📁 Scan Entire File"
- Progress bar shows scan status
- All pages scanned automatically

### What Gets Checked

#### Color Contrast
- Text vs background contrast ratio
- WCAG AA: 4.5:1 for normal text, 3:1 for large text
- WCAG AAA: 7:1 for normal text, 4.5:1 for large text
- Severity: Critical (<3:1), High (3-4.5:1)

#### Text Size
- Minimum 12px for readability
- WCAG 1.4.4 compliance
- Severity: Medium

#### Touch Targets
- Minimum 44x44px for interactive elements
- Heuristic detection (buttons, links, inputs)
- WCAG 2.5.5 (AAA level)
- Severity: High (<24px), Medium (24-44px)

## How It Works

1. **Traverse**: Plugin recursively scans all nodes in selected scope
2. **Analyze**: Runs accessibility checks on each node
3. **API Call**: Creates scan via `POST /api/scans`
4. **Bulk Upload**: Sends all issues via `POST /api/scans/{scan_id}/issues`
5. **Dashboard**: View results in web app at http://localhost:3000

## API Configuration

The plugin connects to your local web app by default. Update the API URL if deploying:

**Development**: `http://localhost:3000/api`
**Production**: `https://your-domain.com/api`

API URL is saved in Figma's local storage per user.

## Detection Heuristics

### Interactive Elements

Detected by node naming conventions:
- Contains "button", "btn"
- Contains "link"
- Contains "input"
- Contains "tab"
- Is a Component or Instance

### Background Color

- Checks immediate parent for background fill
- Defaults to white (#FFFFFF) if no fill found
- Limited to solid colors (no gradients/images)

## Limitations

### Current Version
- Only checks solid color fills (no gradients)
- Background detection checks parent only (not layered backgrounds)
- Touch target detection relies on naming heuristics
- No heading hierarchy checking yet
- No keyboard navigation checking yet

### Planned Features
- Layer visibility consideration
- Gradient/image contrast checking
- Semantic structure analysis
- Focus order validation
- ARIA annotation suggestions

## Development

### File Structure
```
figma-plugin/
├── src/
│   ├── code.ts          # Main plugin logic
│   └── ui.html          # Plugin UI
├── dist/                # Built files (generated)
│   ├── code.js
│   ├── ui.html
│   └── manifest.json
├── manifest.json        # Plugin configuration
├── build.js             # Build script
├── tsconfig.json        # TypeScript config
└── package.json
```

### Build Commands

```bash
npm run build    # Build once
npm run watch    # Build on file changes (requires nodemon)
```

### Debugging

Enable console logs in Figma:
1. **Plugins** → **Development** → **Open Console**
2. View `console.log` output from `code.ts`

UI debugging:
1. Right-click plugin UI → **Inspect**
2. Chrome DevTools for UI HTML/JS

## API Integration

### Scan Creation
```json
POST /api/scans
{
  "file_key": "abc123xyz",
  "file_name": "Design File Name",
  "file_url": "https://figma.com/file/...",
  "scan_type": "full_file",
  "pages": [
    { "page_id": "1:5", "page_name": "Homepage" }
  ]
}
```

### Issues Upload
```json
POST /api/scans/{scan_id}/issues
{
  "issues": [
    {
      "page_id": "1:5",
      "element_id": "node-456",
      "element_name": "Submit Button",
      "category": "contrast",
      "severity": "critical",
      "wcag_criteria": "1.4.3",
      "wcag_level": "AA",
      "description": "Insufficient color contrast",
      "current_value": "3.2:1",
      "required_value": "4.5:1",
      "fix_recommendation": "Darken text or lighten background",
      "location_x": 120,
      "location_y": 450,
      "frame_name": "Hero Section"
    }
  ]
}
```

## Troubleshooting

### Plugin Won't Load
- Check `dist/manifest.json` exists after build
- Ensure Figma Desktop App (not web browser)
- Try **Plugins** → **Development** → **Remove plugin** and reload

### API Connection Failed
- Verify web app running at `http://localhost:3000`
- Check API URL configuration in plugin
- Confirm network access enabled in manifest
- Check browser console for CORS errors

### No Issues Found
- Ensure designs use solid color fills
- Check node naming (interactive elements need "button"/"btn"/"link")
- Verify text nodes have visible fills
- Try scanning different pages

### Scans Take Long Time
- Large files with thousands of nodes take minutes
- Use "Scan Current Page" for faster results
- Progress bar shows real-time status

## Contributing

Future enhancements:
- [ ] Gradient/image contrast analysis
- [ ] Nested background detection
- [ ] Heading hierarchy validation
- [ ] Focus order suggestions
- [ ] Screenshot capture of issues
- [ ] Component-level caching
- [ ] Incremental scanning (delta changes)

## License

MIT - Use freely in your projects
