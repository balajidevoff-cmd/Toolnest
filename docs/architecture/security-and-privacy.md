# Security, Threat Model & Privacy Architecture

## Privacy Architecture
ToolNest enforces a **zero-trust client boundary**. Unlike cloud services that ingest user files for server-side processing, ToolNest performs 100% of calculations in the browser.

- **Zero Tracking**: No Google Analytics, Facebook Pixels, or telemetry beacons.
- **Zero Third-Party CDNs at Runtime**: All core script libraries are bundled locally in the production distribution.
- **Zero Data Ingestion**: No server endpoints exist to receive uploads or telemetry payloads.

## STRIDE Threat Analysis

| Threat Category | Potential Risk | ToolNest Mitigation Strategy |
| :--- | :--- | :--- |
| **Spoofing** | Impersonation of tool services or malicious mock redirects | Zero-backend architecture. Static routes are resolved strictly via local TypeScript catalog. |
| **Tampering** | In-transit tampering of static application assets | Distribution exclusively over HTTPS with strict TLS 1.3, Subresource Integrity, and immutable CDN cache. |
| **Repudiation** | Dispute over actions taken on remote servers | Irrelevant: No user identity, server logs, or transaction histories are created or retained. |
| **Information Disclosure** | Leakage of confidential user files, passwords, or documents | 100% in-browser memory execution. Files are never transmitted over network sockets or saved to external storage. |
| **Denial of Service** | Exhaustion of browser memory via huge input files | Strict client-side file size guardrails (e.g., 50MB PDF limit, 25MB image limit) with pre-computation verification. |
| **Elevation of Privilege** | Cross-Site Scripting (XSS) via markdown rendering or JSON inspection | Custom regex and HTML entity sanitization strips `<script>`, `<iframe>`, `javascript:`, and dangerous `on*` event handlers. |

## Content Security Policy (Recommended Production Header)
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self';
```
