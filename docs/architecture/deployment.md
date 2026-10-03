# Deployment & CI/CD Pipeline Architecture

## Infrastructure Overview
Because ToolNest contains **zero server-side code**, deployment is completely static. The compilation artifact is an optimized set of static HTML, CSS, JavaScript, and asset files ready to deploy on any high-performance Anycast CDN.

## CI/CD Pipeline Flow

```
[Developer Machine] ──> git commit & push
                              │
                              ▼
                     [GitHub Actions / CI]
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           TypeScript Check        Vitest Suite
               tsc -b              vitest run
                    │                   │
                    └─────────┬─────────┘
                              ▼ (Both Pass)
                     Vite Production Build
                          vite build
                              │
                              ▼
                     Static Dist Artifacts
                       (dist/ directory)
                              │
                              ▼
                     Global Edge Deployment
                   (Vercel / Cloudflare / Netlify)
                              │
                              ▼
                     300+ Edge Locations (CDN)
```

## Build Output & Dynamic Chunking
The Vite 6 build compiles the TypeScript code and produces split Rollup chunks:

- **`index-*.js`**: Core runtime, React 19 framework, React Router, AppContext, and global layout shell.
- **`ArchitecturePage-*.js`**: Lazy chunk containing the 9 vector diagram components and Mermaid source trees.
- **`ToolWorkspacePage-*.js`**: Lazy chunk containing the 40 tool utilities and processing engines (`pdf-lib`, `browser-image-compression`, etc.).

## Recommended Hosting Targets
- **Vercel**: Instant static deployments with automatic preview branches.
- **Cloudflare Pages**: High-speed edge distribution with zero cold starts.
- **GitHub Pages**: Free, turnkey hosting directly from the repository's `main` branch or `/dist` folder.
- **Netlify**: Integrated continuous static builds and asset optimization.
