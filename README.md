# ToolNest — Everyday Digital Utility Hub

> **Every tool you need. One nest.**
> A free, privacy-conscious collection of 40 everyday digital utilities built for college students, software engineers, designers, and creators.

![ToolNest Banner](public/favicon.svg)

---

## 🌟 Overview

ToolNest solves utility sprawl by providing a single, unified, modern SaaS-grade web application with 40 built-in utilities across six main categories:
1. **PDF & Documents** (Merger, Splitter, Compressor, Images to PDF, Preview, Word Counter)
2. **Image Studio** (Resizer, Compressor, Format Converter, Cropper, Color Picker, Metadata Viewer)
3. **QR & Developer Tools** (QR Generator, QR Reader, JSON Formatter, URL Encoder/Decoder, HTML Entity Encoder, Base64 Tool, SHA-256 Hash Generator, Text Diff, UUID Generator, Regex Tester)
4. **Calculators & Converters** (Scientific Calculator, CGPA & SGPA Calculator, Percentage Calculator, Unit Converter, Age Calculator, Date Calculator, Data Storage Converter, GST Tax Calculator)
5. **Text & Writing** (Case Converter, Extra Spaces Remover, Text to Slug, Markdown Live Preview, Text Find & Replace, Character Limit Checker)
6. **Privacy & Security** (Password Generator, Passphrase Generator, Password Strength Estimator, File Checksum Verifier)

---

## 🔒 Privacy & Local Processing Architecture

- **100% Client-Side Processing**: PDFs, photos, hashes, and text transformations run locally in your browser memory via native Web Crypto, Canvas, PDF-lib, and Web Workers.
- **Zero Cloud Uploads**: User files never touch a remote server or third-party telemetry platform.
- **No Mandatory Login**: Completely free with zero signup friction.
- **Minimal LocalStorage**: Only non-sensitive preferences (theme, favorite tool IDs, and the last 20 opened tool IDs) are kept locally. Sensitive inputs and generated passwords are never saved.

---

## 🚀 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS with custom SaaS dark/light palette
- **Routing**: React Router v7 client-side SPA
- **Icons**: Lucide React
- **PDF Engine**: `pdf-lib` and `pdfjs-dist`
- **QR Code Tools**: `qrcode` and `jsqr`
- **Testing**: Vitest with unit test suites

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation
```bash
# Clone or navigate to the repository
cd Toolsnest

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Testing and Linting

```bash
# Run automated Vitest test suite
npm run test

# Run build verification (TypeScript compile + Vite production bundle)
npm run build

# Run linter
npm run lint
```

---

## 🌐 Deployment Instructions

### Netlify
1. Connect your repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. The included `public/_redirects` handles all client-side routes automatically (`/* /index.html 200`).

### Vercel
1. Import repository on Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. The included `vercel.json` provides SPA routing rewrites.

---

## ⚖️ Known Limitations & Boundaries
- **PDF Compression**: ToolNest uses `pdf-lib` for lossless PDF structure optimization and object stream compression. Scanned image-heavy PDFs require lossy raster downsampling to achieve dramatic file size reduction.
- **Image EXIF**: Modern browsers strip proprietary camera metadata and GPS coordinates during canvas processing to protect user geolocation privacy.
- **Browser Sandboxing**: File operations are bounded by available client device RAM. Files exceeding 25 MB may cause high memory pressure on low-spec mobile devices.
