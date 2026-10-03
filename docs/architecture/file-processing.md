# In-Memory File Processing Pipeline

## Core Architecture
File processing in ToolNest avoids the conventional client-server roundtrip. Files selected or dragged onto the interface are read into browser memory via the HTML5 File API and processed directly.

## Processing Implementations

### 1. PDF Manipulation (`pdf-lib`)
- **PDF Merge**:
  - Each uploaded PDF is converted into an `ArrayBuffer` using `file.arrayBuffer()`.
  - `PDFDocument.load(buffer)` parses the binary structure into an in-memory document.
  - A new `PDFDocument.create()` container is instantiated.
  - `mergedPdf.copyPages(srcDoc, pageIndices)` copies selected pages into the target document.
  - `mergedPdf.save()` writes the combined binary data out to a `Uint8Array`.
- **PDF Split**:
  - Pages are sliced and extracted into individual standalone documents.
- **Client Security**: No binary data is transmitted outside the V8 runtime heap.

### 2. Image Optimization & Canvas Engine
- **Image Compression**:
  - Utilizes `browser-image-compression` or native HTML5 `OffscreenCanvas` / `HTMLCanvasElement`.
  - Decodes images to raw bitmap pixels.
  - Rescales dimensions according to user settings using high-quality bicubic interpolation.
  - Encodes the buffer to WebP or JPEG with user-specified quality factors (`canvas.toBlob(callback, 'image/webp', quality)`).
- **Format Conversion**:
  - Instant conversion between PNG, JPEG, WEBP, and SVG with byte-size comparison metrics.

### 3. Memory Lifecycle & Safety Guardrails
```
[File on Disk] 
      │
      ▼ (HTML5 FileReader / arrayBuffer)
[ArrayBuffer in RAM] 
      │
      ▼ (pdf-lib / Canvas computation)
[Transformed Uint8Array] 
      │
      ▼ (new Blob([bytes]))
[Blob in Browser Memory] 
      │
      ▼ (URL.createObjectURL)
[Blob URL (blob:http://...)] 
      │
      ▼ (<a> download click)
[Saved to User Disk] 
      │
      ▼ (URL.revokeObjectURL)
[Memory Freed & Garbage Collected]
```
- Maximum file sizes are enforced proactively before reading into memory to prevent tab crashes.
- All temporary Object URLs are registered and systematically revoked.
