# Contributing to ToolNest

Thank you for your interest in contributing to **ToolNest**! ToolNest is dedicated to providing high-quality, privacy-first, 100% client-side digital utilities.

## Guiding Principles
1. **Privacy First**: Tools must execute 100% in the user's browser. Never introduce backend APIs, external telemetry, tracking cookies, or network uploads of user data.
2. **WCAG AA Compliance**: All UI components must meet or exceed 4.5:1 text contrast and 3:1 graphical element contrast in both Light and Dark themes.
3. **Resilient Error Handling**: Tools must handle invalid input gracefully with user-friendly error banners or toast alerts. Never let an exception crash the app.
4. **Clean Code & Strict Types**: All code must pass `tsc -b` with zero TypeScript errors.

## Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/balajidevoff-cmd/Toolnest.git
   cd Toolnest
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Run Unit Tests**:
   ```bash
   npm run test
   ```

5. **Validate Production Build**:
   ```bash
   npm run build
   ```

## Adding a New Tool

1. **Create the Tool Component**:
   Create a new component under `src/components/tools/<category>/YourTool.tsx`. Ensure it:
   - Uses semantic HTML and high-contrast Tailwind classes (`text-slate-900 dark:text-white`, `text-slate-600 dark:text-slate-400`).
   - Cleans up any generated object URLs (`URL.revokeObjectURL`).
   - Provides clear copy/download/reset controls.

2. **Register the Tool in Metadata**:
   Open `src/data/tools.ts`:
   - Import your component and an appropriate icon from `lucide-react`.
   - Add a new entry to the `tools` array with a unique `id`, `name`, `slug`, `category`, and relevant search `tags`.

3. **Verify Contrast and Behavior**:
   - Test your tool in both Light and Dark modes.
   - Verify keyboard navigation, copy feedback, and error handling.
   - Ensure `npm run build` and `npm run test` pass cleanly.
