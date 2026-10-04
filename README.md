# TOVIX (ToolNest) — Privacy-First Digital Utility Suite & Architecture Center

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-35%20Passed-success?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-10B981?style=for-the-badge&logo=shield&logoColor=white)](#-privacy--security-architecture)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

**Every tool you need in one place. 100% Free, Private & Local — No Server Uploads.**

[Explore All 47 Utilities](#-the-47-built-in-tools) • [Architecture Center](#-system-architecture-hub) • [Quick Start](#-quick-start) • [Contributing](docs/contributing.md)

</div>

---

## 🌟 Overview & Highlights

**TOVIX** (repository: `Toolnest`) is an open-source, privacy-first digital utility suite providing **47 production-grade tools** across 7 functional categories, backed by an interactive system architecture center.

Everything executes **100% locally in the user's browser memory sandbox** using HTML5 Canvas, Web Audio API, Web Workers, browser WebCrypto, and client-side PDF compilation engines. **Zero files, video streams, audio buffers, or text snippets are ever uploaded to an external server.**

### Core Pillars
- **⚡ 47 Production-Grade Built-In Utilities**: Across PDF & Documents, Image Studio, Audio & Video Studio, QR & Developer Utilities, Calculators & Converters, Text & Writing, and Cryptographic Security.
- **🔒 Absolute Client-Side Privacy**: All processing runs locally in browser RAM. Zero cloud uploads, zero telemetry, zero analytics beacons, zero ads, zero user accounts.
- **🚀 Generous 1024 MB (1 GB) File Processing**: Process large PDF documents, high-resolution photos, multi-track audio, and 4K video clips locally without artificial limits.
- **🎨 WCAG AA Accessible Design System**: Curated dark and light themes with strict contrast compliance (>= 4.5:1 text, >= 3:1 graphical elements) backed by an inline anti-FOUC script.
- **🏛️ Interactive Architecture Center (`/architecture`)**: 9 interactive system diagrams with synchronized Mermaid source specs, vector SVG export, pan/zoom, and fullscreen view.
- **🔍 Sub-Millisecond Global Discovery**: Universal `Cmd+K` / `Ctrl+K` command palette with fuzzy filtering, keyboard shortcuts, pinned favorites, and recent history.

---

## 🏛️ System Architecture Hub

TOVIX features an in-app **Architecture Center** (`/architecture`) that documents the end-to-end design, sandbox execution lifecycle, and security threat model of the platform.

| Diagram | Focus Area | Live Spec | Specification Document |
| :--- | :--- | :--- | :--- |
| **A. System Overview** | C4 context, client sandbox boundaries, Anycast CDN distribution | [system-architecture.mmd](docs/diagrams/system-architecture.mmd) | [system-overview.md](docs/architecture/system-overview.md) |
| **B. Application Architecture** | React component tree, contexts, layout hierarchy, routing | [application-architecture.mmd](docs/diagrams/application-architecture.mmd) | [application-architecture.md](docs/architecture/application-architecture.md) |
| **C. Tool Execution Flow** | Lifecycle state machine, validation, error barriers, memory cleanup | [tool-execution-flow.mmd](docs/diagrams/tool-execution-flow.mmd) | [tool-execution-flow.md](docs/architecture/tool-execution-flow.md) |
| **D. File Processing Pipeline** | `pdf-lib`, Canvas 2D, and Web Audio streaming in RAM | [file-processing-flow.mmd](docs/diagrams/file-processing-flow.mmd) | [file-processing.md](docs/architecture/file-processing.md) |
| **E. Theme Architecture** | CSS custom properties, anti-FOUC engine, WCAG AA tokens | [theme-flow.mmd](docs/diagrams/theme-flow.mmd) | [theme-system.md](docs/architecture/theme-system.md) |
| **F. Data Flow & State** | Transient RAM vs LocalStorage partitioning, zero-leak cache | [data-flow.mmd](docs/diagrams/data-flow.mmd) | [data-flow.md](docs/architecture/data-flow.md) |
| **G. Security Threat Model** | STRIDE threat matrix, XSS mitigation, zero-exfiltration CSP | [security-threat-model.mmd](docs/diagrams/security-threat-model.mmd) | [security-and-privacy.md](docs/architecture/security-and-privacy.md) |
| **H. Deployment Architecture** | Git push, Vite chunk splitting, immutable hashed asset caching | [deployment-architecture.mmd](docs/diagrams/deployment-architecture.mmd) | [deployment.md](docs/architecture/deployment.md) |
| **I. User Journey Pathways** | 6 primary user interaction and workflow journeys | — | [user-journeys.md](docs/architecture/user-journeys.md) |

Explore the complete architectural documentation in the [`docs/architecture/`](docs/architecture/) folder.

---

## 🛠️ The 47 Built-In Tools

### 1. 📄 PDF & Documents (5 Tools)
- **PDF Merger**: Combine multiple PDF files into one clean document with drag-and-drop reordering.
- **PDF Splitter**: Extract specific pages or custom page ranges (e.g. `1-3, 5, 8-10`) into standalone PDFs.
- **PDF Compressor**: In-memory PDF structure optimization and redundant object removal with accurate before/after size tracking.
- **Images to PDF**: Convert collections of PNG, JPEG, and WebP images into formatted, paginated PDF documents with orientation controls.
- **PDF Page Preview**: Inspect document metadata, page counts, and render individual PDF pages with zoom controls using client-side `pdfjs-dist`.

### 2. 🎨 Image Studio (7 Tools)
- **Image Resizer**: Exact pixel dimension adjustments with aspect ratio locking and percentage-based scaling.
- **Image Compressor**: Fine-tune JPEG, PNG, and WebP compression with real-time size reduction calculations.
- **Image Format Converter**: Instant format conversion between PNG, JPEG, and WebP.
- **Image Cropper**: Interactive visual cropping with 1:1, 16:9, 4:3, and custom aspect ratio presets.
- **Color Picker & Palette**: Extract dominant color schemes, generate harmonious palettes, and copy HEX, RGB, and HSL values.
- **Image Metadata Viewer**: Inspect genuine browser-accessible technical properties, EXIF metadata, dimensions, and MIME types.
- **Image Quality Enhancer**: Super-resolution clarity boosting, detail sharpening, and upscale options (up to 4x) with an interactive before/after split slider.

### 3. 🎬 Audio & Video Studio (6 Tools)
- **Audio Trimmer & Cutter**: Precision audio slicing with waveform scrubbing, start/end markers, and instant WAV export via Web Audio API.
- **Audio Compressor**: Reduce audio footprint by adjusting sample rates, bitrates, and channels 100% locally.
- **Audio Merger & Joiner**: Combine multiple audio tracks sequentially into a seamless audio file with custom track ordering.
- **Video Trimmer & Cutter**: Cut and trim video clips with frame-accurate start/end markers and hardware-accelerated local rendering.
- **Video Compressor**: Compress video clips by selecting target resolutions (480p, 720p, 1080p) and adjustable bitrates without external software.
- **Video Quality Enhancer (4K)**: Enhance video clarity, boost contrast and sharpness, and upscale video playback up to 4K Ultra HD (2160p) locally.

### 4. ⚡ QR & Developer Tools (10 Tools)
- **QR Code Generator**: Generate custom QR codes for URLs, text, Wi-Fi credentials, emails, and phone numbers with color customization.
- **QR Code Reader**: Instant decoding of QR codes from uploaded image files without risky auto-navigation.
- **JSON Formatter & Validator**: Beautify, validate syntax, format with custom indentations (2 or 4 spaces), or minify JSON data.
- **URL Encoder / Decoder**: RFC 3986 compliant URI component encoding and decoding.
- **HTML Entity Encoder / Decoder**: Escape special characters to prevent XSS or decode HTML entities safely.
- **Base64 Tool**: Full UTF-8 and Unicode-compliant Base64 text and binary encoding and decoding.
- **SHA-256 Hash Generator**: Cryptographic digests (SHA-1, SHA-256, SHA-512) computed locally using the browser WebCrypto API.
- **Text Diff Checker**: Side-by-side and unified git-style text comparison highlighting additions, deletions, and modifications.
- **UUID v4 Generator**: Bulk cryptographically secure UUID v4 generation with uppercase and hyphenation controls.
- **Regex Tester**: Real-time regular expression evaluation with regex flags, syntax highlighting, and capture group inspection.

### 5. 🧮 Calculators & Converters (8 Tools)
- **Scientific Calculator**: Full mathematical calculator featuring safe AST parsing (no `eval`), trigonometry, logarithms, powers, and brackets.
- **CGPA & SGPA Calculator**: University grade point calculator with customizable credit-weighted subjects and multi-semester tracking.
- **Percentage Calculator**: Instant percentage increase, decrease, discount, and proportional difference computations.
- **Unit Converter**: Universal conversion across length, mass, temperature, area, volume, speed, time, and digital storage.
- **Age Calculator**: Exact chronological age calculation in years, months, days, hours, and next birthday countdown.
- **Date Difference Calculator**: Calculate elapsed days, weeks, and business days between dates, with leap-year awareness.
- **Data Storage Converter**: Decimal (KB, MB, GB, TB) vs. binary (KiB, MiB, GiB, TiB) storage conversions.
- **GST / Sales Tax Calculator**: Forward and reverse GST / sales tax computations with itemized base and tax breakdowns.

### 6. ✍️ Text & Writing (7 Tools)
- **Word & Character Counter**: Real-time statistics for words, characters (with and without spaces), sentences, paragraphs, and reading time.
- **Case Converter**: Convert text across UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case.
- **Extra Spaces Remover**: Clean redundant spaces, trailing whitespace, and empty lines.
- **Text to URL Slug**: Convert article headlines and titles into SEO-friendly, clean URL slugs.
- **Markdown Live Preview**: Real-time split-screen Markdown editor with sanitized HTML rendering.
- **Text Find & Replace**: Batch find and replace with case sensitivity, whole-word matching, and live replacement tallies.
- **Character Limit Checker**: Track character limits for Twitter/X (280), LinkedIn (3,000), Instagram (2,200), and SMS (160).

### 7. 🔐 Privacy & Cryptographic Security (4 Tools)
- **Password Generator**: High-entropy passwords created using cryptographically secure pseudorandom numbers (`crypto.getRandomValues`).
- **Passphrase Generator**: Memorable Diceware-style multi-word passphrases with custom separators and digit insertion.
- **Password Strength Estimator**: Local entropy analysis, pattern vulnerability checks, and brute-force crack-time estimation.
- **File Checksum Verifier**: Compute and compare SHA-256 file hashes client-side to verify binary integrity.

---

## 🔒 Privacy & Security Architecture

```
User Device (Browser Sandbox)
┌─────────────────────────────────────────────────────────────┐
│  TOVIX Client Application                                   │
│  ├── Memory Sandbox (RAM)                                   │
│  │   ├── WebCrypto API (SHA digests, random UUIDs)          │
│  │   ├── HTML5 Canvas & Web Audio (Media manipulation)      │
│  │   └── pdf-lib & pdfjs-dist (Document processing)         │
│  │                                                          │
│  └── Browser LocalStorage                                   │
│      ├── tovix_theme ('light' | 'dark')                     │
│      ├── tovix_favorites (List of pinned tool IDs)          │
│      └── tovix_recent (Last 5 launched tool IDs)            │
└─────────────────────────────────────────────────────────────┘
                              │
                    NO USER DATA TRANSMITTED
                              │
                              ▼
                      [External Cloud] ❌
```

1. **Zero Data Transmission**: Input text, uploaded media, processed PDFs, generated passwords, and cryptographic hashes reside exclusively in volatile memory (`ArrayBuffer`, `Blob`, `CanvasRenderingContext2D`).
2. **Immediate Memory Deallocation**: Object URLs are explicitly revoked via `URL.revokeObjectURL()` upon tool completion or reset.
3. **No External Dependencies at Runtime**: No external analytics, tracking scripts, ad networks, or external CDNs are loaded during execution.
4. **Sandboxed State**: LocalStorage only stores UI preferences (`tovix_theme`, `tovix_favorites`, `tovix_recent`).

---

## 📁 Repository Structure

```
Toolnest/
├── public/                     # Static assets, favicon, worker scripts
├── docs/                       # Comprehensive documentation
│   ├── architecture/           # 9 Architectural spec documents
│   │   ├── system-overview.md
│   │   ├── application-architecture.md
│   │   ├── tool-execution-flow.md
│   │   ├── file-processing.md
│   │   ├── theme-system.md
│   │   ├── data-flow.md
│   │   ├── security-and-privacy.md
│   │   ├── deployment.md
│   │   └── user-journeys.md
│   ├── diagrams/               # 8 Standalone Mermaid (.mmd) diagrams
│   ├── contributing.md         # Contribution guidelines & principles
│   └── testing.md              # Testing guide & quality standards
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI components (Dropzone, Toast, etc.)
│   │   ├── layout/             # Header, Footer, Navigation, Command Palette
│   │   └── tools/              # 47 Tool implementations organized by category
│   │       ├── audio-video/    # Audio & Video tools
│   │       ├── calculators/    # Calculators & Converters
│   │       ├── image/          # Image Studio tools
│   │       ├── pdf/            # PDF & Document tools
│   │       ├── qr-dev/         # QR & Developer tools
│   │       ├── security/       # Cryptographic & Security tools
│   │       └── text/           # Text & Writing tools
│   ├── context/                # AppContext (Theme, Favorites, Recent, Toasts)
│   ├── data/                   # Tool registry and category metadata (tools.ts)
│   ├── pages/                  # Route views (Home, Category, ToolWorkspace, Architecture, etc.)
│   ├── test/                   # Vitest automated test suite
│   ├── types/                  # TypeScript interfaces and type definitions
│   └── utils/                  # Core algorithms (AST math, crypto, canvas, audio, pdf)
├── CHANGELOG.md                # Version history and releases
├── package.json                # Project dependencies and npm scripts
├── tailwind.config.js          # Tailwind CSS theme configuration
├── tsconfig.json               # Strict TypeScript configuration
└── vite.config.ts              # Vite 8 build pipeline configuration
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` (v9+) or `pnpm`

### Installation & Local Development

```bash
# 1. Clone the repository
git clone https://github.com/balajidevoff-cmd/Toolnest.git
cd Toolnest

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Verification

The project includes strict TypeScript compilation checks, unit tests, and linting:

```bash
# Run Vitest unit tests
npm run test

# Run Oxlint linter
npm run lint

# Run strict TypeScript typecheck & production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🚢 Deployment

TOVIX is a fully static client application. It can be deployed to any Anycast CDN or static hosting platform:

### Deploy to Vercel
```bash
npx vercel
```
A [`vercel.json`](vercel.json) configuration is included to ensure clean client-side routing rewrites (`/* -> /index.html`).

### Deploy to Netlify / Cloudflare Pages / GitHub Pages
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **SPA Routing**: Route all requests to `/index.html`

---

## 🤝 Contributing

Contributions are welcomed! Please review our [Contributing Guidelines](docs/contributing.md) and [Testing Guide](docs/testing.md) before opening a pull request.

Key guidelines:
1. Every tool must execute **100% in the user's browser sandbox**. Never add backend upload endpoints or third-party telemetry.
2. Maintain strict **WCAG AA contrast standards** in both light and dark themes.
3. Ensure all tests (`npm run test`) and production builds (`npm run build`) pass cleanly.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
Built with care for everyday efficiency and unconditional digital privacy.
</div>
