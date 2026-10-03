# Testing Guide for ToolNest

ToolNest relies on **Vitest** for fast unit testing and strict TypeScript compilation checks to guarantee reliability and prevent regressions across the 40 utilities.

## Test Scripts

| Command | Action |
| :--- | :--- |
| `npm run test` | Executes the Vitest test suite once. |
| `npm run test:watch` | Runs Vitest in interactive watch mode for active development. |
| `npm run build` | Runs `tsc -b` (strict TypeScript validation) followed by `vite build`. |

## Test Suite Coverage (`src/test/app.test.ts`)
The test suite verifies core application invariants:

- **Central Tool Registry Invariants**:
  - Exactly 40 unique tools defined in `src/data/tools.ts`.
  - All tools possess non-empty `id`, `name`, `slug`, `description`, `category`, and `tags`.
  - All slugs are URL-safe and distinct.
  - Every tool has an associated React component.
- **Category Coverage**:
  - Each of the 5 categories (PDF, Image, Dev & QR, Calculators, Text) has registered tools.
- **LocalStorage State Resilience**:
  - Safe parsing of corrupted, invalid, or null LocalStorage payloads.
  - Correct fallback to default state without throwing runtime exceptions.
- **Sanitization & Security**:
  - Markdown sanitizer strips `<script>` tags, inline `onload`/`onerror` handlers, and malicious links.
- **Color & Math Utilities**:
  - Accurate HEX, RGB, and HSL conversions.
  - Floating-point calculations without arithmetic overflow.

## Running Tests Locally
```bash
npm run test
```

Expected output:
```
✓ src/test/app.test.ts (30 tests)
Test Files  1 passed (1)
     Tests  30 passed (30)
```
