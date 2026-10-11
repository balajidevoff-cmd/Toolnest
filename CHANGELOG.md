# Changelog

All notable changes to the **ToolNest** platform are documented in this file.

## [2.3.0] - 2026-10-11

### ✨ Image Background Remover Perfection & Matte Refinement
- **Precision Touch-Up Brush**: Interactive brush on the preview allowing manual erasing of stray specks (`alpha = 0`) or restoring clipped details (`alpha = 255`).
- **Disconnected Island Cleaner**: Morphological component filter automatically eliminating isolated floating dust/noise islands.
- **Dynamic Halo Choke & De-spill**: Real-time slider controls to trim residual wall halos on shoulders and hair in < 15ms.

## [2.2.0] - 2026-10-11

### 🖼️ New Feature: Client-Side Image Background & People Remover
- **100% In-Browser Execution**:
  - Image background removal, subject matting, and person erasing executed entirely within browser RAM sandbox using WebAssembly, WebGPU, and HTML5 Canvas.
  - Zero server uploads, zero API calls, and zero external network latency.
- **AI Neural Matting (ISNet)**:
  - Deep learning segmentation runs locally to isolate people, portraits, hair, and clothing with precision.
  - Keeps people intact and eliminates backgrounds behind them cleanly.
- **Selective Person Eraser & Remove People Modes**:
  - **Remove People Mode**: Eliminates people from the photo and preserves the background scenery.
  - **Magic Eraser**: Interactive brush to paint over and remove specific selected individuals using content-aware diffusion inpainting.
- **High-Speed Studio Color Keyer & Skin Protection**:
  - Heuristic human skin protection prevents faces, hands, and bodies from being keyed out.
  - Upper-boundary auto-sampling avoids mistaking subjects' clothing for background.
  - Debounced interactive rendering ensures fast, lag-free slider adjustments.
- **Backdrop Replacement & Flexible Export**:
  - Transparent checkerboard, solid colors, curated studio gradients, and portrait bokeh blur.
  - Instant 1-click Download and clipboard copying (`PNG`, `WebP`, `JPEG`).

## [2.1.0] - 2026-09-26

### 🎨 Complete Light Theme & WCAG AA Overhaul
- **Fixed Light Theme Visibility Failures**:
  - Eliminated un-scoped `text-white` classes on light containers across `ToolWorkspaceLayout`, `Header`, `Footer`, `AboutPage`, and `FloatingDock`.
  - Replaced low-contrast `#a3a3a3` text with `#0f172a` (primary) and `#475569` (muted), achieving high-contrast compliance (**14.2:1** primary text contrast and **5.5:1** muted text contrast against white, exceeding the 4.5:1 WCAG AA requirement).
  - Modernized `FloatingDock` to be theme-adaptive, rendering sleek frosted light glass in light mode and obsidian dark glass in dark mode.
  - Added synchronized `data-theme` attribute and `document.documentElement.style.colorScheme` updates in `AppContext`.
  - Implemented synchronous inline `<head>` script in `index.html` to eliminate Flash of Unstyled Content (FOUC).

### 🏛️ Interactive Architecture & Diagram Center
- Added new route `/architecture` backed by `src/pages/ArchitecturePage.tsx`.
- Built `DiagramViewer` component with interactive capabilities:
  - Zoom in (`+`), Zoom out (`-`), Fit-to-screen (`Scan`), and 100% Reset (`RotateCcw`).
  - Drag-to-pan navigation with visual cursor feedback.
  - Native browser Fullscreen API integration with Esc key dismissal.
  - SVG vector download export functionality.
  - Mermaid source code toggle tab with one-click clipboard copying.
- Created 9 comprehensive architecture diagrams:
  - **A. System Architecture**: C4 Context and client-side isolation model.
  - **B. Application Architecture**: Component hierarchy, contexts, and registry decoupling.
  - **C. Tool Execution Flow**: State machine from validation through execution to memory cleanup.
  - **D. File Processing Flow**: In-memory PDF and Canvas processing pipeline with URL revocation.
  - **E. Theme Architecture**: CSS custom properties, Tailwind tokens, and anti-FOUC script.
  - **F. Data Flow & State**: RAM vs LocalStorage boundary partitioning.
  - **G. Security Threat Model**: STRIDE threat matrix and XSS sanitization safeguards.
  - **H. Deployment Architecture**: Git push, Vite chunk splitting, and Anycast CDN static hosting.
  - **I. User Journey Flows**: 6 primary interaction pathways.

### ⚡ Performance & Bundle Optimization
- Implemented `React.lazy` code splitting in `src/App.tsx` for `ArchitecturePage` and `ToolWorkspacePage`.
- Isolated heavy computational libraries (`pdf-lib`, `pdfjs-dist`, `browser-image-compression`) into asynchronous lazy chunks, reducing initial page load weight.

### 📚 GitHub Documentation & Specifications
- Added `docs/diagrams/` containing 8 version-controlled `.mmd` Mermaid source files.
- Added `docs/architecture/` containing 8 comprehensive engineering specification documents.
- Created `docs/contributing.md` and `docs/testing.md`.
- Completely revamped `README.md` to reflect the updated architecture and 40 utilities.

### 🧪 Quality Assurance & Validation
- Verified all 30 unit tests pass in `src/test/app.test.ts`.
- Verified clean compilation with zero TypeScript errors via `tsc -b && vite build`.
