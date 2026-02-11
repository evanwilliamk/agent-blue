# A11y Designer Dashboard 🎨♿

A comprehensive web dashboard for UX designers to manage accessibility guidelines, check color contrast, annotate components, and track accessibility issues in Figma designs.

## Features

### 🎨 Color Contrast Checker
- **Stark-style WCAG validation** with real-time contrast ratio calculation
- Test foreground and background color combinations
- Visual preview with normal and large text
- WCAG AA and AAA compliance indicators for both text sizes
- Color picker and hex input support

### 📚 WCAG Guidelines Browser
- Searchable database of WCAG 2.1 and 2.2 guidelines
- Filter by level (A, AA, AAA) and category
- Expandable cards with detailed information:
  - How to meet each guideline
  - Common mistakes to avoid
  - Good and bad code examples
  - Related guidelines
- Tag-based navigation

### 📝 Component Annotation Builder
- Document accessibility requirements for Figma components
- ARIA attributes (role, label, describedby)
- Keyboard navigation specifications
- Focus management guidelines
- Semantic HTML recommendations
- Link to Figma designs for reference
- Quick reference for best practices

### 🐛 Issue Tracker
- Create and manage accessibility issues
- Categorize by severity (critical, high, medium, low)
- Track status (open, in-progress, resolved, won't fix)
- Link issues to specific WCAG guidelines
- Reference Figma designs
- Assign to team members
- Visual statistics dashboard
- Filter by status and severity

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd a11y-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Ready for Vercel (zero-config)

## Project Structure

```
a11y-dashboard/
├── app/
│   ├── page.tsx          # Main dashboard with tab navigation
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles
├── components/
│   ├── contrast-checker.tsx      # Color contrast tool
│   ├── guidelines-browser.tsx    # WCAG guidelines reference
│   ├── annotation-builder.tsx    # Component annotation system
│   └── issue-tracker.tsx         # Issue management
├── lib/
│   ├── types/
│   │   └── index.ts      # TypeScript type definitions
│   └── utils/
│       └── contrast.ts   # Contrast calculation utilities
├── data/
│   └── wcag-guidelines.json      # WCAG 2.1/2.2 guidelines database
└── public/               # Static assets
```

## Usage Guide

### Checking Color Contrast

1. Navigate to the **Contrast Checker** tab
2. Enter or pick foreground (text) color
3. Enter or pick background color
4. View real-time contrast ratio and WCAG compliance
5. See visual preview with different text sizes

**Example:**
- Foreground: `#000000` (black)
- Background: `#FFFFFF` (white)
- Result: 21:1 ratio ✓ Passes AAA for all text

### Browsing WCAG Guidelines

1. Navigate to the **WCAG Guidelines** tab
2. Use search to find specific guidelines
3. Filter by level (A, AA, AAA) or category
4. Click on a guideline to expand details
5. Review examples and implementation guidance

### Annotating Components

1. Navigate to the **Component Annotations** tab
2. Enter component name and Figma link
3. Specify ARIA attributes if needed
4. Document keyboard navigation patterns
5. Add focus management notes
6. Save annotation for reference

### Tracking Issues

1. Navigate to the **Issue Tracker** tab
2. Click **+ New Issue**
3. Fill in issue details and severity
4. Link to related WCAG guidelines
5. Assign to team member
6. Update status as work progresses
7. Use filters to view specific issue types

## WCAG Guidelines Included

Currently includes 11 essential WCAG guidelines covering:
- **Perceivable**: Non-text content, contrast, structure
- **Operable**: Keyboard access, focus management, target size
- **Understandable**: Form inputs, redundant entry
- **Robust**: Name, role, value

More guidelines can be added by editing `data/wcag-guidelines.json`.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and deploy

### Environment Variables
No environment variables required for basic functionality.

## Customization

### Adding More WCAG Guidelines
Edit `data/wcag-guidelines.json` and add new guideline objects following the schema in `lib/types/index.ts`.

### Styling
Modify Tailwind classes in components or update `tailwind.config.ts` for theme customization.

### Persistence
Currently uses in-memory storage for issues and annotations. To persist data:
- Add a database (Supabase, PostgreSQL, MongoDB)
- Implement API routes in `app/api/`
- Update components to fetch/save from API

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.2 What's New](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Stark for Figma](https://www.getstark.co/)
- [MDN ARIA Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)

## Contributing

This is an MVP built for designer-focused accessibility workflows. Contributions welcome for:
- Additional WCAG guidelines
- More annotation templates
- Export/import functionality
- Figma plugin integration
- Database persistence
- Team collaboration features

## License

MIT License - feel free to use and modify for your projects.

## Support

For questions or issues:
- Check the WCAG Guidelines browser within the app
- Refer to official WCAG documentation
- Review component code comments for implementation details

---

**Built with accessibility in mind.** This dashboard follows WCAG 2.1 AA standards and uses semantic HTML, proper ARIA attributes, keyboard navigation, and sufficient color contrast throughout.
