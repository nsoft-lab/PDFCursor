# PDFCursor Practical Guide & Recipe Book

**English** | [Japanese](GUIDE.ja.md)

This guide provides practical, production-ready code examples and recipes for building real-world PDF documents with **PDFCursor** in JavaScript and TypeScript.

---

## Table of Contents

1. [Data Table & Layout Structuring](#1-data-table--layout-structuring)
2. [Barcodes & QR Codes Integration](#2-barcodes--qr-codes-integration)
3. [Digital Signatures & Document Security](#3-digital-signatures--document-security)
4. [Advanced Graphics, Clipping & Watermarks](#4-advanced-graphics-clipping--watermarks)
5. [Multi-Page Reports & Header/Footer Placement](#5-multi-page-reports--headerfooter-placement)
6. [Precise Text Layout & Auto-Fit Helpers](#6-precise-text-layout--auto-fit-helpers)

---

## 1. Data Table & Layout Structuring

A complete example demonstrating how to build a clean, multi-column structured data table with alternating row colors, right-aligned numeric figures, and summary totals.

```typescript
import Module from './pdfCursor.mjs';

async function generateTableReport() {
  const mod = await Module();
  const pdc = new mod.PDFCursor();

  // Document metadata
  pdc.title("Monthly Summary Report")
     .author("NSOFT Co., Ltd.")
     .beginPage("A4", { title: "Summary Report" });

  const marginX = 40;
  const pageWidth = pdc.$W; // A4 Width (~595.28 pt)
  let currentY = pdc.$H - 50; // Start near page top (~841.89 pt)

  // 1. Header Title & Document ID
  pdc.font("Gothic-JP-H", 20)
     .color({ fill: "#003366" })
     .textAt(marginX, currentY, "Monthly Summary Report")
     .font("Helvetica", 9)
     .color({ fill: "#666666" })
     .textStyle({ anchor: 1.0 }) // Right align
     .textAt(pageWidth - marginX, currentY, "Doc ID: DOC-2026-01\nDate: October 01, 2026")
     .textStyle(null);

  currentY -= 50;

  // 2. Table Header
  const colX = [marginX, marginX + 220, marginX + 300, pageWidth - marginX];
  const tableWidth = pageWidth - marginX * 2;

  pdc.color({ fill: "#003366" })
     .rectAt(marginX, currentY - 5, tableWidth, 22)
     .fill()
     .font("Helvetica-Bold", 9)
     .color({ fill: "#FFFFFF" })
     .textAt(colX[0] + 10, currentY, "Item / Category")
     .textAt(colX[1] + 10, currentY, "Qty")
     .textAt(colX[2] + 10, currentY, "Unit Price ($)")
     .textStyle({ anchor: 1.0 })
     .textAt(colX[3] - 10, currentY, "Amount ($)")
     .textStyle(null);

  currentY -= 25;

  // 3. Line Items & Alternating Background
  const items = [
    { desc: "System License Package A", qty: 1, price: 450.00 },
    { desc: "Standard Operations Support", qty: 4, price: 120.00 },
    { desc: "Annual Maintenance Package", qty: 1, price: 180.00 },
  ];

  pdc.font("Helvetica", 9).color({ fill: "#222222" });

  let subtotal = 0;
  items.forEach((item, index) => {
    const amount = item.qty * item.price;
    subtotal += amount;

    // Alternating background row
    if (index % 2 === 1) {
      pdc.color({ fill: "#F8F9FA" })
         .rectAt(marginX, currentY - 4, tableWidth, 20)
         .fill();
    }

    pdc.color({ fill: "#222222" })
       .textAt(colX[0] + 10, currentY, item.desc)
       .textAt(colX[1] + 10, currentY, item.qty.toString())
       .textAt(colX[2] + 10, currentY, `$${item.price.toFixed(2)}`)
       .textStyle({ anchor: 1.0 })
       .textAt(colX[3] - 10, currentY, `$${amount.toFixed(2)}`)
       .textStyle(null);

    // Row separator
    pdc.lineStyle({ width: 0.5 })
       .color({ stroke: "#E0E0E0" })
       .hLineAt(marginX, currentY - 6, tableWidth)
       .stroke();

    currentY -= 20;
  });

  // 4. Totals Block
  currentY -= 15;
  pdc.font("Helvetica-Bold", 9)
     .textStyle({ anchor: 1.0 })
     .textAt(colX[2] + 60, currentY, "Total Amount:")
     .textAt(colX[3] - 10, currentY, `$${subtotal.toFixed(2)}`)
     .textStyle(null);

  pdc.endPage();

  return pdc.getBlob();
}
```

---

## 2. Barcodes & QR Codes Integration

PDFCursor includes built-in vector generators for 1D and 2D barcodes without external dependencies.

```javascript
// 1D Linear Barcodes (Code128, JAN13, JAN8, ITF)
pdc.code1dAt(50, 600, 200, 40, "CODE128", "DOC-2026-01")
   .code1dAt(300, 600, 180, 40, "JAN13", "4901234567890");

// 2D Barcodes (QR, QRH, DataMatrix)
pdc.code2dAt(50, 480, 80, "QR", "https://example.com/verify/DOC-2026-01")
   .code2dAt(200, 480, 80, "QRH", "https://example.com/verify/DOC-2026-01")
   .code2dAt(350, 480, 80, "DataMatrix", "ID:1234567890;BATCH:99");

// Overlay Icon on High Error Correction QR Code (QRH)
pdc.code2dAt(50, 350, 100, "QRH", "https://github.com")
   .color({ fill: "#FFFFFF" })
   .rectAt(85, 385, 30, 30) // Mask center
   .fill()
   .font("Helvetica-Bold", 10)
   .color({ fill: "#000000" })
   .textStyle({ anchor: 0.5 })
   .textAt(100, 396, "PDF")
   .textStyle(null);
```

---

## 3. Digital Signatures & Document Security

PDFCursor supports computing SHA-256 digests and embedding external PKCS#7 / CMS digital signatures.

```javascript
async function createSignedPDF(pkcs7Signer) {
  const mod = await Module();
  const pdc = new mod.PDFCursor();

  pdc.beginPage("A4")
     .font("Helvetica-Bold", 14)
     .textAt(100, 700, "Official Document with Digital Signature")
     .endPage();

  // 1. Get SHA-256 digest hash (32 bytes)
  const hashDigest = pdc.digest();

  // 2. Sign digest via external PKI / key service
  const pkcs7Signature = await pkcs7Signer(hashDigest);

  // 3. Embed signature binary
  pdc.digiSign(pkcs7Signature);

  return pdc.getBlob();
}
```

---

## 4. Advanced Graphics, Clipping & Watermarks

### Watermarks
```javascript
// Semi-transparent diagonal watermark
pdc.beginPage("A4")
   .alpha({ fill: 0.15 })
   .color({ fill: "#FF0000" })
   .font("Helvetica-Bold", 60)
   .textStyle({ angle: 45, anchor: 0.5 })
   .textAt(pdc.$W / 2, pdc.$H / 2, "CONFIDENTIAL")
   .textStyle(null)
   .alpha(null);
```

### Image Clipping Mask
```javascript
// Clip image inside rounded rectangle
const imageHandle = pdc.imageRef(pngUint8Array);

pdc.rRectAt(100, 500, 200, 150, 15)
   .beginClip()
   .imageAt(100, 500, imageHandle, { width: 220 })
   .endClip();
```

---

## 5. Multi-Page Reports & Header/Footer Placement

Utilize page dimension properties (`pdc.$W`, `pdc.$H`) to render consistent headers and footers across pages.

```javascript
function renderReportPage(pdc, pageNum, totalPages, titleStr) {
  pdc.beginPage("A4", { title: titleStr });

  // Header
  pdc.font("Helvetica", 9)
     .color({ fill: "#888888" })
     .textAt(40, pdc.$H - 30, titleStr)
     .hLineAt(40, pdc.$H - 36, pdc.$W - 80)
     .stroke();

  // Footer (Page Numbers)
  pdc.font("Helvetica", 9)
     .color({ fill: "#888888" })
     .textStyle({ anchor: 1.0 })
     .textAt(pdc.$W - 40, 30, `Page ${pageNum} of ${totalPages}`)
     .textStyle(null)
     .hLineAt(40, 42, pdc.$W - 80)
     .stroke()
     .endPage();
}
```

---

## 6. Precise Text Layout & Auto-Fit Helpers

Use `textBBox` and `fontMetrics` to measure string dimensions before rendering, creating exact surrounding boxes or underlines.

```javascript
const textStr = "Dynamic Header Title\nSecond Line Description";

pdc.font("Gothic-JP-H", 16)
   .textStyle({ anchor: 0.5 }); // Center align

const bbox = pdc.textBBox(textStr);
const x = pdc.$W / 2;
const y = 600;

// Draw padded background box
const padding = 8;
pdc.color({ fill: "#EBF3FA", stroke: "#0066CC" })
   .rRectAt(x + bbox.xMin - padding, y + bbox.yMin - padding, bbox.width + padding * 2, bbox.height + padding * 2, 4)
   .fill({ stroke: true })
   .color({ fill: "#003366" })
   .textAt(x, y, textStr);
```
