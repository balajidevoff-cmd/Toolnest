You are a senior full-stack engineer, UI/UX designer, software architect, accessibility specialist, and technical documentation engineer.

PROJECT: ToolNest — Everyday Digital Utility Hub
EXISTING GITHUB REPOSITORY: https://github.com/balajidevoff-cmd/Toolnest

OBJECTIVE:
Upgrade my EXISTING ToolNest website into a premium, fully functional, visually impressive digital utility platform.

IMPORTANT:
Do NOT create a separate new project.
Do NOT replace the project with a static landing page.
Do NOT delete existing working utilities, routes, components, or user data without a valid reason.
Inspect the complete repository, understand its architecture, and modify the actual existing codebase.

Make changes directly in the current working repository. Preserve the existing framework and package manager unless a migration is genuinely necessary.

Do not merely describe what to change. Implement the changes, run the project, test the result, and fix errors.

==================================================
PHASE 1 — FULL REPOSITORY AUDIT
==================================================

Before modifying anything:

1. Inspect the repository structure and all relevant source files.
2. Identify the framework, dependencies, routing, state management, theme implementation, and utility registry.
3. Inspect all existing pages, utilities, reusable components, stylesheets, configuration files, and assets.
4. Identify broken functionality, duplicate components, accessibility problems, and inconsistent styling.
5. Identify the exact reason light theme text becomes invisible or low contrast.
6. Identify hardcoded dark-theme colors, incorrect CSS variables, inherited text colors, and third-party component theme conflicts.

Create an implementation checklist based on the actual repository.

Do not assume filenames or frameworks before inspecting the project.

==================================================
PHASE 2 — FIX THE ENTIRE LIGHT THEME
==================================================

THIS IS THE HIGHEST PRIORITY.

Currently, ToolNest looks acceptable in dark mode, but when switching to light mode, several text elements become invisible or difficult to read.

Fix this throughout the ENTIRE WEBSITE.

Do not fix only the homepage.

Audit and correct:
- Homepage
- Navigation and mobile menu
- Search bar and search suggestions
- Tool directory
- Category pages
- Every individual utility page
- File upload areas
- Input fields and textareas
- Select menus and dropdowns
- Checkboxes and radio buttons
- Dialogs and modals
- Toast notifications
- Tooltips
- Cards and card descriptions
- Tables and code blocks
- Empty states and error messages
- Loading screens
- Settings and preference panels
- Favorites and recent tools
- Footer and documentation pages
- Every newly created diagram and architecture page

LIGHT THEME DESIGN TOKENS:

Create a centralized design-token system using CSS variables.

Example:

:root,
[data-theme="light"] {
  color-scheme: light;

  --background: #F8FAFC;
  --foreground: #172033;

  --surface: #FFFFFF;
  --surface-secondary: #F1F5F9;
  --surface-hover: #E8EDF5;

  --card: #FFFFFF;
  --card-foreground: #172033;

  --primary: #6D28D9;
  --primary-foreground: #FFFFFF;

  --secondary: #EDE9FE;
  --secondary-foreground: #4C1D95;

  --muted: #F1F5F9;
  --muted-foreground: #475569;

  --border: #D8DEE9;
  --input: #FFFFFF;
  --ring: #7C3AED;

  --success: #166534;
  --warning: #92400E;
  --danger: #B91C1C;

  --code-background: #F1F5F9;
  --code-foreground: #172033;

  --diagram-background: #FFFFFF;
  --diagram-node: #F8FAFC;
  --diagram-text: #172033;
  --diagram-edge: #64748B;
}

DARK THEME DESIGN TOKENS:

[data-theme="dark"] {
  color-scheme: dark;

  --background: #090914;
  --foreground: #F5F3FF;

  --surface: #10101C;
  --surface-secondary: #17172A;
  --surface-hover: #22223A;

  --card: #151525;
  --card-foreground: #F5F3FF;

  --primary: #A78BFA;
  --primary-foreground: #FFFFFF;

  --secondary: #292344;
  --secondary-foreground: #DDD6FE;

  --muted: #202033;
  --muted-foreground: #B5B5CC;

  --border: #34344D;
  --input: #151525;
  --ring: #A78BFA;

  --success: #86EFAC;
  --warning: #FCD34D;
  --danger: #FDA4AF;

  --code-background: #10101C;
  --code-foreground: #F5F3FF;

  --diagram-background: #10101C;
  --diagram-node: #202033;
  --diagram-text: #F5F3FF;
  --diagram-edge: #A1A1B5;
}

These tokens are a starting point. Adapt them to the existing design system and test actual contrast.

THEME IMPLEMENTATION REQUIREMENTS:

1. Establish one centralized theme provider or the equivalent supported by the existing architecture.
2. Use semantic theme tokens across every component.
3. Remove inappropriate hardcoded white text on white backgrounds and black text on dark backgrounds.
4. Replace conflicting classes such as text-white, text-black, bg-white, bg-black, and fixed dark backgrounds wherever they break theme switching.
5. Preserve intentional brand colors and syntax highlighting where appropriate.
6. Correct CSS specificity conflicts and inheritance issues.
7. Ensure theme styles work for dynamically generated utility pages and components.
8. Ensure third-party libraries, dialogs, dropdown portals, and charts inherit the correct theme.
9. Set the correct color-scheme property for native browser controls.
10. Ensure focus rings, disabled states, placeholders, and validation messages remain visible.
11. Do not use opacity alone to make important text readable.
12. Prevent flashes of the wrong theme during initial loading.

THEME TOGGLE:

- Implement a working global theme toggle.
- Support system preference, light, and dark modes if compatible with the current app.
- Persist the user's explicit selection.
- Apply the selected theme consistently across all routes.
- Ensure the theme does not reset when navigating between tools.
- Avoid hydration mismatch or flashing if using a server-rendered framework.

LIGHT THEME ACCEPTANCE TEST:

Visit every route and verify:
- All text is readable.
- Tool cards have appropriate contrast.
- Input values and placeholders are visible.
- Buttons have visible labels and hover states.
- Menus, dialogs, and modals use correct colors.
- SVG icons and charts remain visible.
- Architecture diagrams have readable nodes, labels, and connections.

Use WCAG 2.2 AA contrast targets:
- Normal text: at least 4.5:1.
- Large text: at least 3:1.
- Important UI boundaries and graphical elements: at least 3:1 where applicable.

Use automated accessibility testing where possible, and manually inspect representative routes in both themes.

==================================================
PHASE 3 — UNIQUE TOOLNEST BRAND AND UI
==================================================

Upgrade the existing design into a distinctive premium SaaS platform.

Brand:
ToolNest
Tagline: Every tool you need. One nest.

Design direction:
- Modern digital workspace.
- Professional, clean, premium.
- Deep violet and indigo branding.
- Subtle gradients and elegant glass-like surfaces.
- Clear visual hierarchy.
- Smooth, restrained motion.
- Consistent iconography.
- Distinctive layouts rather than generic template styling.

Keep the dark theme polished while making the light theme equally complete and visually attractive.

Create or refine:
- Design system and typography.
- Color tokens.
- Spacing scale.
- Border radius scale.
- Shadow system.
- Button variants.
- Input variants.
- Tool cards.
- Category badges.
- Breadcrumbs.
- Tool workspace layouts.
- Empty, loading, success, and error states.

Add professional responsive layouts for desktop, tablet, and mobile.

Do not sacrifice accessibility or readability for visual effects.

==================================================
PHASE 4 — ARCHITECTURE AND DIAGRAM CENTER
==================================================

Create a new major section called:

TOOLNEST ARCHITECTURE CENTER

Route suggestion:
/architecture

If the existing routing architecture differs, use an equivalent route.

This section should explain the complete architecture of ToolNest with interactive diagrams, system flowcharts, and technical documentation.

Create a visually distinctive documentation interface with:
- Left sidebar navigation.
- Main documentation canvas.
- Right-side table of contents on desktop.
- Responsive navigation on mobile.
- Searchable documentation.
- Light/dark theme support.
- Interactive diagrams with zoom, pan, fit-to-screen, and fullscreen where practical.
- Download and export options for supported diagram formats.

Use Mermaid for architecture flowcharts and sequence diagrams if the project supports it. Use React Flow or the existing graph library for interactive node-based diagrams if suitable.

Do not render diagrams as static screenshots. Use actual editable or interactive diagram components.

All diagram labels, nodes, edges, backgrounds, and tooltips must use theme-aware styling.

Create the following pages and diagrams:

A. SYSTEM OVERVIEW

Explain what ToolNest is, its main purpose, the users it serves, and the main system components.

Create a high-level system architecture diagram:

User
  -> Browser / Responsive UI
  -> Application Router
  -> Tool Registry
  -> Tool Workspace
  -> Individual Utility Modules
  -> Browser APIs / Local Processing
  -> User Download or Result

Show theme management, favorites, recent history, and local preferences as separate components.

Clearly distinguish client-side processing from any actual server-side processing.

Do not invent backend services, databases, external APIs, or integrations that do not exist in the repository.

B. APPLICATION ARCHITECTURE

Create a component architecture diagram showing the ACTUAL repository architecture:

Application Entry
  -> Root Layout
  -> Theme Provider
  -> Router
  -> Pages
  -> Shared Components
  -> Tool Registry
  -> Utility Implementations
  -> Browser APIs and State Storage

Inspect the source code to determine the real component names and relationships.

Include actual file paths and links to relevant files in the repository when available.

C. TOOL EXECUTION FLOW

Create a detailed interactive flowchart:

User opens a utility
  -> Route resolves
  -> Tool metadata is loaded
  -> Utility component mounts
  -> User supplies input
  -> Input validation
  -> Processing
  -> Success or error state
  -> Preview result
  -> Copy, export, or download
  -> Cleanup temporary resources

Include alternate paths for:
- Invalid input.
- Unsupported file format.
- Oversized file.
- Processing failure.
- User cancellation.
- Download failure.

Adapt this flow to actual utility behavior.

D. FILE PROCESSING ARCHITECTURE

Create a diagram for supported file-processing utilities.

Show:
- File selection.
- Drag and drop.
- File type validation.
- File size validation.
- Browser memory processing.
- Temporary object URLs.
- Processing result.
- Download generation.
- Object URL cleanup.

Explain which utilities use browser APIs, Web Workers, Canvas, PDF libraries, or actual backend services.

Verify library usage from the project before documenting it.

E. THEME ARCHITECTURE

Create a theme flowchart:

User Theme Selection
  -> Theme State
  -> Persisted Preference
  -> Root Theme Attribute
  -> CSS Design Tokens
  -> Shared Components
  -> Tool Pages
  -> Diagrams and Charts

Document the root cause of the original light-theme visibility bugs based on the actual code audit.

Document the changes made and the testing performed.

F. DATA FLOW AND STORAGE

Create a data flow diagram covering:
- Tool metadata.
- User input.
- File data.
- Favorites.
- Recently used tools.
- Theme preference.
- Local storage.
- Browser processing.
- Exported output.

Identify what data is temporary, what data is persisted, and what data leaves the browser.

Only document verified behavior.

G. SECURITY AND PRIVACY ARCHITECTURE

Create a threat-model diagram identifying:
- Untrusted user input.
- Uploaded files.
- Malformed JSON and documents.
- Unsafe HTML rendering.
- URL handling.
- Sensitive data in browser storage.
- Temporary object URLs.
- External API boundaries if present.

Document mitigations actually implemented.

Explain limitations honestly. Do not claim the application is fully secure or that every tool uses local processing unless verified.

H. DEPLOYMENT ARCHITECTURE

Create a deployment diagram based on the actual deployment setup.

Show:
Developer
  -> Git repository
  -> Build process
  -> Hosting platform
  -> Deployed web application
  -> Browser

Include environment variables, build configuration, routing fallback, and external dependencies only when verified.

I. USER JOURNEY FLOWCHARTS

Create user journey diagrams for:
1. Discovering and searching for a tool.
2. Opening and using a PDF utility.
3. Processing and downloading an image.
4. Saving a favorite.
5. Switching themes.
6. Navigating documentation.

J. TECHNICAL REFERENCE

Create documentation for:
- Project structure.
- Component responsibilities.
- Tool registry schema.
- Routing.
- State management.
- Theme tokens.
- Utility implementation conventions.
- Error handling.
- Testing procedures.
- Build and deployment.

Every page should include useful explanations, not just a diagram.

==================================================
PHASE 5 — MAKE THE DIAGRAMS INTERACTIVE
==================================================

Create a reusable DiagramViewer component.

Required functionality:
- Zoom in and out.
- Fit diagram to viewport.
- Pan or scroll.
- Fullscreen mode.
- Reset view.
- Download SVG when supported.
- Export Mermaid source when applicable.
- Copy diagram source.
- Light/dark theme adaptation.
- Accessible keyboard controls.

Add controls with tooltips and accessible labels.

For complex diagrams, divide the architecture into logical groups and provide expandable detail.

Diagram nodes should have:
- Clear titles.
- Short descriptions.
- Consistent visual styles.
- Optional links to actual documentation or source files.

Use meaningful node shapes and arrows.

For Mermaid:
- Ensure diagrams compile successfully.
- Use correct syntax.
- Provide valid node IDs.
- Escape special characters correctly.
- Use readable labels.
- Provide fallback error states if rendering fails.

For React Flow:
- Use actual nodes and edges.
- Provide fitView.
- Enable appropriate interaction.
- Support theme changes.
- Avoid rendering unreadable labels or overlapping nodes.

Do not use arbitrary placeholder architecture or fake component names.

==================================================
PHASE 6 — IMPROVE ALL EXISTING TOOL PAGES
==================================================

Inspect every existing utility in the repository.

For each utility:
1. Preserve existing working functionality.
2. Fix existing bugs.
3. Improve the interface and user experience.
4. Apply consistent theme tokens.
5. Add clear descriptions and instructions.
6. Improve input validation and error handling.
7. Add appropriate result previews.
8. Add copy, reset, and download actions where relevant.
9. Add supported file format and size information.
10. Add related-tool navigation.
11. Add breadcrumb navigation.
12. Ensure mobile usability.

Do not replace real processing with mock outputs.

Do not remove existing tools merely because they are difficult to style.

If an existing utility is broken, fix it using the current architecture and compatible libraries.

Create a reusable tool metadata schema if one does not already exist.

Keep the registry as the source of truth for:
- Tool ID.
- Name.
- Slug.
- Description.
- Category.
- Icon.
- Keywords.
- Component reference.
- Supported inputs.
- Supported output.
- Related tools.

All cards, search results, category pages, and documentation references should use consistent metadata.

==================================================
PHASE 7 — GITHUB REPOSITORY AND DOCUMENTATION
==================================================

Update the existing repository with clean, maintainable code.

Create or update documentation files in the repository.

Suggested structure, adapted to the existing project:

docs/
  README.md
  architecture/
    system-overview.md
    application-architecture.md
    tool-execution-flow.md
    file-processing.md
    theme-system.md
    data-flow.md
    security-and-privacy.md
    deployment.md
    user-journeys.md

  diagrams/
    system-architecture.mmd
    application-architecture.mmd
    tool-execution-flow.mmd
    file-processing-flow.mmd
    theme-flow.mmd
    data-flow.mmd
    security-threat-model.mmd
    deployment-architecture.mmd

  contributing.md
  testing.md

Use the actual project structure. Avoid duplicating existing documentation unnecessarily.

For every diagram:
- Include a valid Mermaid source file when Mermaid is used.
- Include the rendered interactive diagram in the website.
- Add a concise written explanation.
- Describe the relevant components and data flow.
- Reference real source files where possible.

Update the main README.md with:
- Project description.
- Features.
- Screenshots or existing image assets if available.
- Technology stack verified from package files.
- Installation.
- Development commands.
- Build commands.
- Project structure.
- Architecture overview.
- Diagram documentation links.
- Privacy and security notes.
- Deployment instructions.
- Contribution instructions.

Add a CHANGELOG.md entry describing the actual modifications.

Do not invent GitHub stars, users, contributors, releases, badges, or external services.

Do not overwrite Git history or force-push.

If GitHub write access is available:
- Check the current branch and working-tree changes.
- Preserve unrelated user changes.
- Work on an appropriate feature branch if possible.
- Commit only when authorized and safe.
- Push changes only if repository write permissions are available and the environment allows it.

If direct GitHub access is unavailable, modify the checked-out local repository and clearly report that the changes are not yet pushed. Do not claim that files were uploaded or committed when they were not.

==================================================
PHASE 8 — PERFORMANCE AND ACCESSIBILITY
==================================================

Improve performance without breaking existing functionality.

Requirements:
- Lazy-load large utility components where appropriate.
- Lazy-load architecture diagrams.
- Avoid unnecessary dependencies.
- Prevent unnecessary re-renders.
- Clean up event listeners and object URLs.
- Handle long-running file processing gracefully.
- Use Web Workers for expensive processing if appropriate.
- Provide accessible loading and error states.
- Use semantic HTML and keyboard navigation.
- Ensure all controls have labels.
- Respect reduced-motion preferences.

Use appropriate error boundaries.

Avoid adding large dependencies unless their value is justified.

==================================================
PHASE 9 — TESTING AND VALIDATION
==================================================

Run the available project tests and production build.

Test both light and dark themes.

At minimum verify:
- Every existing route opens.
- Every tool page remains functional.
- Search and category filtering work.
- Favorites and recent tools work.
- Theme persists between pages and refreshes.
- Light-theme text is readable on every major component.
- Diagrams render without syntax errors.
- Diagrams adapt to light and dark themes.
- Diagram zoom, pan, fullscreen, and exports work where implemented.
- Mobile layout has no horizontal overflow.
- File processing and downloads work.
- Error states are readable and meaningful.
- Documentation links resolve.
- No broken images, missing icons, or console errors.
- No build errors or TypeScript errors.

Use Playwright or the existing browser-testing setup if available.

Create automated tests for theme tokens and key utility workflows if appropriate.

Do not state that all tests passed unless they actually ran successfully.

If a test cannot be run, clearly identify it as unverified.

==================================================
PHASE 10 — FINAL REPORT
==================================================

After implementation, provide a concise report containing:

1. Root cause of the light-theme visibility issue.
2. Files and components modified.
3. Theme improvements completed.
4. Architecture pages and diagrams added.
5. Existing utilities fixed or enhanced.
6. Documentation files created or updated.
7. Tests actually executed and their results.
8. Production build result.
9. Any remaining limitations.
10. Git branch, commit, and push status if applicable.

Start by inspecting the existing repository and then execute the complete update.

Do not stop after the audit or after creating a plan.

Implement the actual changes in the existing ToolNest codebase.

The final result must be a working, responsive, accessible, professional ToolNest website with a consistent light and dark theme, interactive architecture diagrams, and accurate GitHub documentation.