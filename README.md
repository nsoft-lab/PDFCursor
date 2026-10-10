<p>
  <img src="assets/pdfcursor_logo.png" alt="PDFCursor Logo" width="320" />
  &emsp; 
  <a href="https://nsoft-lab.github.io/PDFCursor/examples/">
    <img src="https://img.shields.io/badge/DEMO-2ea44f?style=for-the-badge&logo=github" alt="DEMO" />
  </a>
</p>

**English** | [Japanese](README.ja.md)

**PDFCursor** is a lightweight, client-side PDF generation library for JavaScript powered by WebAssembly (C++ / emsdk).

It generates low-level PDF streams directly in the browser with minimal overhead and zero external server dependencies. Full TypeScript type definitions (`pdfCursor.d.mts`) are included out of the box.

---

## Features

- 🪶 **Lightweight Execution**: Core WebAssembly engine compiled from C++ (emsdk) delivers an ultra-lightweight footprint with fast client-side performance.
- 📐 **Real-Dimension Design**: Precise coordinate system following PDF standards ("bottom-left origin", "1/72 inch (pt) unit") with precision down to 0.01 pt.
- 🔤 **Base14 & CJK CID Font Support**: Built-in support for Standard Base14 fonts and CJK (Japanese, Chinese, Korean, Taiwanese) CID fonts (Mincho & Gothic) without embedding heavy font files.
- 🎨 **Rich Drawing APIs**: Comprehensive vector graphics API supporting lines, Bézier curves, rounded rectangles, polygons, stars, trapezoids, circles, ellipses, arcs, and sectors.
- 📊 **Built-in Barcode Generation**: Direct rendering of 1D barcodes (Code128, EAN13, JAN8, ITF) and 2D barcodes (QR, DataMatrix).
- 🖼️ **Images & Gradients (Shading)**: Embed transparent PNGs and JPEGs, plus linear and radial gradient fills.
- ✂️ **Clipping & Coordinate Transformations**: Protect regions with text or path clipping paths, and execute non-cumulative coordinate transformations (`xform`).
- ✍️ **Digital Signatures**: Built-in SHA-256 digest computation (`digest()`) and PKCS#7 / CMS digital signature embedding (`digiSign()`).
- 📏 **Layout Calculation Helpers**: String bounding box (`textBBox`) and font metrics (`fontMetrics`) for advanced layout positioning.

---

## Files

PDFCursor consists of the following distribution files:

- `pdfCursor.wasm`: WebAssembly core engine compiled from C++
- `pdfCursor.mjs`: ES Module interface wrapper
- `pdfCursor.d.mts`: TypeScript declaration file

---

## Quick Start

### JavaScript (ES Modules)

```html
<script type="module">
import Module from './pdfCursor.mjs';

async function generatePDF() {
  const mod = await Module();
  const pdc = new mod.PDFCursor();

  // Start an A4 landscape page and draw text
  pdc.beginPage("A4 landscape", { title: "Sample Document" })
     .font("Helvetica", 16)
     .textAt(100, 100, "Hello, World!") // Draw text at (100pt, 100pt)
     .endPage();

  // Export as a Blob object
  const pdfBlob = pdc.getBlob();
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Use for previewing or downloading
  document.getElementById("viewer").data = pdfUrl;
}

generatePDF();
</script>
```

### TypeScript Usage

PDFCursor includes bundled TypeScript declarations (`pdfCursor.d.mts`), providing autocomplete and strict type safety out of the box:

```typescript
import Module from './pdfCursor.mjs';
import type { PDFCursor, PaperFormat, StandardFont } from './pdfCursor';

async function generatePDF(): Promise<void> {
  const mod = await Module();
  const pdc: PDFCursor = new mod.PDFCursor();

  const paper: PaperFormat = 'A4 landscape';
  const fontName: StandardFont = 'Helvetica';

  pdc.beginPage(paper, { title: 'TypeScript Sample' })
     .font(fontName, 16)
     .textAt(100, 100, 'Hello from TypeScript!')
     .endPage();

  const pdfBlob: Blob = pdc.getBlob();
  const pdfUrl: string = URL.createObjectURL(pdfBlob);
  
  const viewer = document.getElementById('viewer') as HTMLObjectElement | null;
  if (viewer) {
    viewer.data = pdfUrl;
  }
}

generatePDF();
```

---

## Coordinate System & Units

- **Origin**: Bottom-left corner of the page `(0, 0)`
- **Units**: Points (pt) (1.0 pt = 1/72 inch ≈ 0.3528 mm)
- **Precision**: 2 decimal places (0.01 pt accuracy)

```javascript
// Example: Output multi-line text at precise pt coordinates
pdc.font("Mincho-JP-H", 12)
   .textAt(92.44, 102.56, "Welcome to PDFCursor\nSecond line of text");
```

---

## Key Features & API Overview

### 1. Text & Typography

```javascript
// Set font (Base14 or CJK CID font)
pdc.font("Gothic-JP-H", 14, { spacing: 0.1, leading: 1.2, narrow: 0.9 });

// Text alignment settings
pdc.textStyle({ anchor: 0.5 }); // 0.0: Left, 0.5: Center, 1.0: Right

// Text rendering and multiline handling
pdc.textAt(200, 150, "Centered Text\nSecond Line")
   .textAdd(" (Appended Text)");

// Dimension helpers
const bbox = pdc.textBBox("Measured String");
const width = pdc.textWidth("Measured String");
const metrics = pdc.fontMetrics();
```

### 2. Colors & Opacity (Alpha)

Supports RGB, CMYK, Grayscale, Hexadecimal color codes (#HEX), and alpha transparency.

```javascript
// Hex color specification
pdc.color({ stroke: "#FF0000", fill: "#00FF00" });

// CMYK / RGB / Grayscale specification (0.0 to 1.0)
pdc.color({ fill: [0, 0.5, 1, 0] }); // CMYK

// Opacity (Alpha)
pdc.alpha({ stroke: 1.0, fill: 0.4 }); // Fill opacity at 40%
```

### 3. Vector Graphics & Paths

```javascript
// Path construction and rendering
pdc.pathAt(100, 100)
   .lineTo(200, 100)
   .curveTo(240, 150, 260, 50, 300, 100)
   .stroke();

// Shape helper methods
pdc.rectAt(50, 50, 100, 80)                     // Rectangle
   .rRectAt(200, 50, 100, 80, 10)               // Rounded Rectangle
   .circleAt(350, 90, 40)                       // Circle
   .regPolygonAt(100, 200, 30, 5, 0)            // Regular Pentagon
   .hQuadAt(200, 200, 100, 15, 50, 80)          // Trapezoid
   .stroke();
```

### 4. Barcodes

```javascript
// 1D Barcodes (Code128, EAN13, EAN8, ITF)
pdc.code1dAt(50, 300, 200, 40, "CODE128", "1234567890");

// 2D Barcodes (QR, QRH, DataMatrix)
pdc.code2dAt(300, 300, 80, "QR", "https://github.com");
```

### 5. Images & Gradients (Shading)

```javascript
// Register and draw images (PNG / JPEG)
const imageHandle = pdc.imageRef(pngUint8Array);
pdc.imageAt(50, 400, imageHandle, { width: 150, angle: 15 });

// Register and draw gradients
const bgShade = pdc.shadeRef(["#b0ffa0", "#ffa0a0"], { geom: [0, 0, 0, 1], stops: [0.0, 1.0] });
pdc.shadeAt(0, 0, bgShade, { scaleY: pdc.$H });
```

### 6. Read-Only State Properties

Utilize read-only properties representing the most recently configured or calculated state for fluid layout positioning.

- `pdc.$W`: Page width
- `pdc.$H`: Page height
- `pdc.$x`, `pdc.$y`: Last specified X, Y coordinates
- `pdc.$f`: Last specified font size
- `pdc.$a`: Last specified anchor value
- `pdc.$s`: Last specified string

```javascript
// Example: Drawing text at top-left header position
pdc.textAt(pdc.$W * 0.1, pdc.$H * 0.9, "Header Text");
```

---

## Design Philosophy & Background

PDFCursor was built to address lightweight reporting and document generation needs in modern Web applications.
It aims to complete lightweight rendering purely on the client side (JavaScript) using real-dimension calculations without relying on external server infrastructure or heavy cloud services.

By leveraging standard Base14 fonts and CJK CID fonts defined in the PDF 1.7 specification rather than embedding large custom font files (TTF/OTF), PDFCursor achieves an ultra-lightweight binary size and near-instantaneous dynamic PDF generation.

---

## License & Commercial Terms

### License Types

- **Trial Version (Free)**: All features are fully functional. Generated PDFs include a `"Trial Version"` watermark. For evaluation and development testing.
- **Personal License (One-time purchase)**: Removes the watermark. Valid for 1 production site (includes associated development/staging environments). For individual developers and solo projects.
- **Team / Enterprise License (One-time purchase)**: Removes the watermark. Valid for 1 production site (includes associated development/staging environments). For business, organization, or team-based development.

### License Scope & Terms

- **1 License = 1 Production Site**: Each purchased license key grants permission to use PDFCursor on one single production site or application.
- **Development & Staging Included**: Non-production environments associated with the licensed production site (e.g., `localhost`, staging, or testing servers) are included under the same single license.
- **Multiple Production Sites**: Deploying PDFCursor on additional production sites requires purchasing a separate license for each site.

### How to Purchase & Activate

Commercial license purchasing will be available soon :

👉 **PDFCursor Commercial License (Coming Soon)**

*(During the pre-release period, you can evaluate all features for free using the Trial Version)*

Activate your license key in code:

```javascript
pdc.licenseKey = "YOUR_LICENSE_KEY";
```

### Copyright

Copyright © 2026 **NSOFT**. All rights reserved.
