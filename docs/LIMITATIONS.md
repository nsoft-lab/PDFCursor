# PDFCursor Limitations & Technical Caveats

**English** | [Japanese](LIMITATIONS.ja.md)

This document outlines the technical limitations, specification constraints, and operational caveats of **PDFCursor**. Please review these notes before integrating PDFCursor into your project.

---

## 1. Font Specifications & PDF Standard Compliance

- **No TTF/OTF Font Embedding**: PDFCursor does NOT support embedding custom TrueType (`.ttf`) or OpenType (`.otf`) font files. Font embedding increases binary footprint and requires complex proportional metric tables, which conflicts with PDFCursor's goal of ultra-lightweight client-side rendering.
- **Supported Fonts Only**: Only standard PDF Base 14 fonts (Type1) and CJK CID fonts (Type0 for Japanese, Chinese, Korean, Taiwanese) are supported.
- **PDF 1.7 Standard Compliance**: PDFCursor complies with PDF specifications up to version 1.7. It does NOT comply with PDF 2.0, which mandates font embedding.

---

## 2. Browser PDF Viewers & Rendering Differences

- **Viewer-Dependent Font Rendering**: The default embedded PDF viewer varies across browsers (e.g., PDFium in Chrome/Edge, PDF.js in Firefox).
- **CID Font Handling in PDFium**: Chrome's PDFium does not distinguish between Mincho (serif) and Gothic (sans-serif) CID fonts, rendering both in Gothic. Firefox's PDF.js renders Mincho and Gothic correctly.
- **Recommended Workaround**: If consistent visual rendering across all browsers is required, pin the client-side viewer to PDF.js on your server.

---

## 3. Low-Level Rendering Engine (No HTML-like Layout)

- **Manual Layout Calculation**: PDFCursor is a stream-oriented, real-dimension rendering engine. It does NOT provide HTML-like flow layout, automatic text reflow, or flexbox/grid containers.
- **Client-Side Calculations Required**: Text positioning, wrapping, line heights, and table calculations must be handled explicitly in JavaScript using helper methods like `textBBox()`, `textWidth()`, and `fontMetrics()`.
- **No PDF Forms Support**: PDFCursor does not support interactive PDF form fields (AcroForms).

---

## 4. Graphics Path State Machine & Drawing Rules

- **No Style Changes Inside Active Path**: Modifying graphic properties (e.g., `color()`, `lineStyle()`, `alpha()`) while a path is actively being constructed (e.g., after `pathAt()`, `rectAt()`, etc.) will throw an exception error. Always configure colors and styles *before* starting a path.
- **Explicit Path Termination**: Paths must be completed using `stroke()`, `fill()`, or `discard()`. Leaving a path open when calling `endPage()` will trigger console warnings.

---

## 5. Clipping Region Scope Management

- **Restoration Requirement**: In PDF, clipping paths persist within the graphics state. Calling `beginClip()` saves the graphics state and establishes the boundary.
- **Mandatory `endClip()`**: Always call `endClip()` to restore the previous graphics state and exit the clipping scope.

---

## 6. License & Watermark Constraints

- **Trial Watermark**: When used without a valid license key, all API features remain functional, but a `"Trial Version"` watermark is automatically rendered on generated pages.
- **Key Activation**: Setting a valid license key (`pdc.licenseKey = "YOUR_KEY"`) removes all watermarks.

---

## 7. Coordinate System & Precision Limits

- **Origin & Units**: Origin is at the bottom-left corner `(0, 0)`. All measurements are in PDF points (1.0 pt = 1/72 inch ≈ 0.3528 mm).
- **Precision**: Coordinates support precision up to 2 decimal places (0.01 pt accuracy). Color values (RGB, CMYK, Grayscale) accept normalized floats (`0.0` to `1.0`) with up to 3 decimal places.
