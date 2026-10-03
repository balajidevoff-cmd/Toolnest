# ToolNest — Enterprise Digital Utility Hub & Architecture Center

> **Every tool you need. One nest.**
> A privacy-conscious, client-side suite of 40 digital utilities paired with an interactive system architecture center. Built with React 19, TypeScript, Vite 6, and Tailwind CSS.

---

## 🌟 Overview & Key Highlights

ToolNest delivers an everyday utility hub with **100% in-browser client execution**:
- **40 Production-Grade Tools**: Spanning PDF & Documents, Image Studio, QR & Developer Tools, Calculators & Converters, Text & Writing, and Cryptographic Security.
- **100% Client-Side Privacy**: All processing runs locally in RAM via Web Workers, HTML5 Canvas, WebCrypto, and `pdf-lib`. No files, hashes, or text ever touch a server.
- **WCAG AA Compliance**: High-contrast light and dark themes (meeting >= 4.5:1 text contrast and >= 3:1 graphical element contrast) backed by an inline anti-FOUC engine.
- **Interactive Architecture Center (`/architecture`)**: 9 architectural diagrams with interactive pan/zoom, fullscreen mode, SVG vector export, and synchronized Mermaid source code.
- **Sub-1-Second Discovery**: Global `Cmd+K` / `Ctrl+K` command palette with real-time filtering, keyboard shortcuts, and bookmarking.

---

## 🏛️ System Architecture Hub (`/architecture`)

ToolNest includes an architectural diagram and documentation center:

| Diagram | Focus Area | Live Route | Spec File |
| :--- | :--- | :--- | :--- |
| **A. System Overview** | C4 context, client sandbox, edge distribution | `/architecture` | [system-architecture.mmd](file:///d:/All%20files/Toolsnest/docs/diagrams/system-architecture.mmd) |
| **B. Application Architecture** | Component tree, contexts, layout hierarchy | `/architecture` | [application-architecture.mmd](file:///d:/All%20files/Toolsnest/docs/diagrams/application-architecture.mmd) |
| **C. Tool Execution Flow** | Lifecycle state machine, validation, error barriers | `/architecture` | [tool-execution-flow.mmd](file:///d:/All%20files/Toolsnest/docs/diagrams/tool-execution-flow.mmd) |
| **D. File Processing Flow** | `pdf-lib` and Canvas pipeline, memory cleanup | `/architecture` | [file-processing-flow.mmd](file:///d:/All%20files/Toolsnest/docs/diagrams/file-processing-flow.mmd) |
| **E. Theme Architecture** | CSS variables, anti-FOUC script, WCAG AA tokens | `/architecture` | [theme-flow.mmd](file:///d:/All%20files/Toolsnest/docs/diagrams/theme-flow.mmd) |
| **F. Data Flow & State** | Transient RAM vs LocalStorage partitioning | `/architecture` | [data-flow.mmd](file:///d:/All%20files/Toolsnest/docs/diagrams/data-flow.mmd) |
| **G. Security Threat Model** | STRIDE analysis, zero data exfiltration, CSP | `/architecture` | [security-threat-model.mmd](file:///d:/All%20files/Toolsnest/docs/diagrams/security-threat-model.mmd) |
| **H. Deployment Pipeline** | Git push, Vite chunk splitting, Anycast CDN | `/architecture` | [deployment-architecture.mmd](file:///d:/All%20files/Toolsnest/docs/diagrams/deployment-architecture.mmd) |
| **I. User Journey Flows** | 6 primary interaction pathways | `/architecture` | [user-journeys.md](file:///d:/All%20files/Toolsnest/docs/architecture/user-journeys.md) |

For comprehensive written architecture specifications, browse the [`docs/architecture/`](file:///d:/All%20files/Toolsnest/docs/architecture) folder.

---

## 🛠️ The 40 Built-In Tools

### 1. PDF & Document Tools
- **PDF Merger**: Combine multiple PDFs into a single document with custom ordering.
- **PDF Splitter**: Extract specific page ranges into standalone files.
- **PDF Compressor**: Optimize PDF object streams in-memory.
- **Images to PDF**: Convert image collections into paginated PDF documents.
- **PDF Preview & Info**: Inspect document metadata, page counts, and page rendering.
- **Word & Character Counter**: Real-time reading speed, sentence, and word metrics.

### 2. Image Studio
- **Image Resizer**: Exact pixel dimension adjustments with aspect ratio locking.
- **Image Compressor**: Quality vs. size reduction with instant before/after byte metrics.
- **Format Converter**: Convert between PNG, JPEG, WEBP, and SVG formats.
- **Image Cropper**: Interactive aspect ratio cropping with canvas bounding boxes.
- **Color Picker & Palette**: Extract dominant colors, complementary palettes, and HEX/RGB/HSL values.
- **Image Metadata Viewer**: Inspect dimensions, MIME types, file sizes, and color depth.

### 3. QR & Developer Tools
- **QR Code Generator**: Custom QR generation with color customization and logo embedding.
- **QR Code Reader**: Instant decoding of QR codes from uploaded images or camera feed.
- **JSON Formatter & Validator**: Syntax checking, indentation formatting, and minification.
- **URL Encoder / Decoder**: RFC-compliant URI component encoding and decoding.
- **HTML Entity Encoder**: Convert special characters to HTML entities and back.
- **Base64 Tool**: Text and file Base64 encoding/decoding.
- **SHA-256 Hash Generator**: Cryptographic hash generator with SHA-1, SHA-256, and SHA-512 support.
- **Text Diff Viewer**: Side-by-side and unified git-style text diff comparison.
- **UUID / GUID Generator**: Bulk v4 UUID generator with uppercase and hyphen controls.
- **Regex Tester**: Real-time regular expression tester with match flags and capture groups.

### 4. Calculators & Converters
- **Scientific Calculator**: Full trigonometric, logarithmic, and algebraic functions.
- **CGPA & SGPA Calculator**: University grade point calculator with weighted credits.
- **Percentage Calculator**: Quick percentage increase, decrease, and proportion calculations.
- **Unit Converter**: Length, weight, temperature, area, volume, and speed conversions.
- **Age Calculator**: Exact age calculation in years, months, days, and hours.
- **Date Difference Calculator**: Calculate duration between dates excluding weekends/holidays.
- **Data Storage Converter**: Convert bits, bytes, KB, MB, GB, TB, and PB (binary and decimal).
- **GST / Sales Tax Calculator**: Forward and reverse sales tax and GST computations.

### 5. Text & Writing
- **Case Converter**: Convert between camelCase, PascalCase, snake_case, kebab-case, UPPERCASE, and lowercase.
- **Extra Spaces Remover**: Remove redundant whitespace, tabs, and duplicate line breaks.
- **Text to Slug Converter**: Generate URL-safe clean slugs for blogs and CMS systems.
- **Markdown Live Preview**: Real-time markdown editor with sanitized live HTML rendering.
- **Find & Replace**: Case-sensitive and regex-supported batch text substitution.
- **Character Limit Checker**: Track limits for Twitter/X, LinkedIn, Meta, and SMS.

### 6. Privacy & Security
- **Password Generator**: Cryptographically secure passwords with custom entropy rules.
- **Passphrase Generator**: Multi-word Diceware-style memorable passphrases.
- **Password Strength Estimator**: Entropy calculation and brute-force crack-time estimation.
- **File Checksum Verifier**: Compute and verify SHA-256, SHA-1, and MD5 file hashes locally.

---

## 🔒 Privacy & Local Processing Architecture

- **100% In-Browser Execution**: All transformations occur inside the browser memory sandbox.
- **Zero Cloud Uploads**: User files, passwords, or queries never leave the device.
- **Zero Telemetry or Cookies**: No analytics beacons, ads, or tracking identifiers.
- **Isolated LocalStorage**: Only theme preference, pinned tool IDs, and recent history are saved locally.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/balajidevoff-cmd/Toolnest.git
cd Toolnest

# Install dependencies
npm install

# Start local Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Testing & Quality Gates

```bash
# Run Vitest automated test suite
npm run test

# Run strict TypeScript validation & production Vite build
npm run build
```

---

## 📚 Documentation Index

- [Architecture Center Specifications](file:///d:/All%20files/Toolsnest/docs/architecture/)
- [Mermaid Architecture Diagrams](file:///d:/All%20files/Toolsnest/docs/diagrams/)
- [Contributing Guidelines](file:///d:/All%20files/Toolsnest/docs/contributing.md)
- [Testing Guide](file:///d:/All%20files/Toolsnest/docs/testing.md)
- [Release Changelog](file:///d:/All%20files/Toolsnest/CHANGELOG.md)

---

## 📄 License
MIT License. Open-source, free, and built for everyone.
