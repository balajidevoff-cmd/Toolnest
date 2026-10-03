# Core User Journey Flows

## User Experience Design
ToolNest's user experience is optimized for speed, clarity, and zero cognitive load. Every tool follows standard interaction conventions and provides clear visual feedback.

## Primary User Journeys

### 1. Global Search & Instant Launch
1. User presses `Cmd+K` or clicks the search trigger in the Header.
2. An interactive `SearchModal` appears with an autofocused input.
3. User types a query (matches tool name, category, or keyword tags).
4. Arrow keys navigate results; `Enter` activates the chosen tool.
5. The application navigates to `/tools/:slug` and automatically logs the visit to the user's recent tools list.

### 2. PDF Document Processing
1. User navigates to `/tools/pdf-merger` or `/tools/pdf-splitter`.
2. Drops one or multiple PDF documents into the `FileUploadDropzone`.
3. Client validates that all files are valid `application/pdf` and under the 50MB ceiling.
4. User organizes pages or arranges document sequence.
5. Clicks "Merge PDFs" or "Split PDF". `pdf-lib` computes the output entirely in RAM.
6. User clicks "Download". An in-memory blob is synthesized and saved to the user's downloads folder.
7. Object URLs are immediately revoked to maintain a clean memory footprint.

### 3. Image Optimization & Format Conversion
1. User opens `/tools/image-compressor` or `/tools/image-converter`.
2. Uploads an image (PNG, JPEG, or WEBP).
3. Adjusts compression quality and dimension sliders.
4. HTML5 Canvas re-encodes the image and calculates real-time bytes saved.
5. User downloads the optimized asset directly.

### 4. Theme Switching
1. User clicks the Sun/Moon toggle button in the Header or Floating Dock.
2. `AppContext` updates the reactive `theme` state and syncs `toolsnest_theme` to LocalStorage.
3. `classList.toggle('dark')` and `data-theme` attributes update on the `<html>` root element.
4. CSS custom property variables seamlessly transition colors across all 40 utilities with 100% WCAG AA contrast compliance.

### 5. Managing Favorites & History
1. User clicks the Star icon on any `ToolCard`.
2. Tool ID is added/removed in `toolsnest_favorites`.
3. An animated toast confirms the action.
4. Starred tools appear immediately in the Floating Dock and on the `/favorites` route.

### 6. Architecture & Diagram Exploration
1. User clicks "Architecture" in the Header navigation or visits `/architecture`.
2. Selects from 9 detailed architectural diagrams (A through I).
3. Interacts with the diagram using pan, zoom, fit-to-view, and fullscreen mode.
4. Toggles to "Mermaid Source" to inspect and copy diagram code, or exports an SVG vector file.
