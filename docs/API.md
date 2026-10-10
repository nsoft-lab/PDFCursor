# PDFCursor API Reference

**English** | [Japanese](API.ja.md)

Welcome to the **PDFCursor** API Reference. This document provides a complete technical specification of all classes, methods, properties, and TypeScript type definitions included in `pdfCursor.d.mts` and the WebAssembly core engine.

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Class: PDFCursor](#class-pdfCursor)
  - [Constructor](#constructor)
  - [Read-Only State Properties](#read-only-state-properties)
  - [Document & Page Lifecycle](#document--page-lifecycle)
  - [Typography & Text Rendering](#typography--text-rendering)
  - [Color & Transparency](#color--transparency)
  - [Path Construction & Geometry](#path-construction--geometry)
  - [Path Closure & Rendering](#path-closure--rendering)
  - [Line Style Configuration](#line-style-configuration)
  - [Applied & Convenience Shapes](#applied--convenience-shapes)
  - [Coordinate Transformation (`xform`)](#coordinate-transformation-xform)
  - [Clipping Regions](#clipping-regions)
  - [Barcodes (1D & 2D)](#barcodes-1d--2d)
  - [Images (PNG / JPEG)](#images-png--jpeg)
  - [Shading & Gradients](#shading--gradients)
  - [Document Metadata](#document-metadata)
  - [Digital Signatures](#digital-signatures)
  - [State Reset & Export](#state-reset--export)
  - [Emergency Hatch](#emergency-hatch)
- [TypeScript Types & Interfaces](#typescript-types--interfaces)

---

## Overview & Architecture

**PDFCursor** is a low-level, client-side PDF generation engine powered by C++ WebAssembly (`emsdk`). It produces compliant PDF 1.7 binary streams directly in JavaScript/TypeScript environments without server dependencies.

### Coordinate System & Units
- **Origin:** Bottom-left corner of the page `(0, 0)` ($x$ increases to the right, $y$ increases upward).
- **Unit:** Points (pt), where **1.0 pt = 1/72 inch** ($pprox$ 0.3528 mm). All coordinates, dimensions, font sizes, and line widths use this unit.
- **Precision:** Floating-point coordinates are valid up to **2 decimal places (0.01 pt accuracy)**.

### Error & Exception Handling
API methods throw standard JavaScript `Error` instances under the following conditions:
- **Invalid Arguments:** Out-of-range parameters, invalid color strings, or unsupported barcode/font identifiers.
- **State Machine Violations:** Performing path or property modifications inside restricted states (e.g., changing colors during path construction).

---

## Class: PDFCursor

The main class exported by the WebAssembly wrapper module.

### Constructor

```typescript
const pdc = new mod.PDFCursor();
```
Creates a new instance of the `PDFCursor` engine.

---

### Read-Only State Properties

PDFCursor maintains internal state variables representing the most recently applied parameters. These read-only properties allow fluid layout chaining and positioning relative to previous elements.

| Property | Type | Description |
| :--- | :--- | :--- |
| `pdc.$W` | `number` | Page width in points. |
| `pdc.$H` | `number` | Page height in points. |
| `pdc.$x` | `number` | Last specified $x$ coordinate in points. |
| `pdc.$y` | `number` | Last specified $y$ coordinate in points. |
| `pdc.$f` | `number` | Last specified font size in points. |
| `pdc.$a` | `number` | Last specified text alignment anchor (`0.0`: Left, `0.5`: Center, `1.0`: Right). |
| `pdc.$s` | `string` | Last specified text string. |

---

### Document & Page Lifecycle

#### `beginPage(format: PaperFormat, options?: PageOptions): this`
#### `beginPage(width: number, height: number, options?: PageOptions): this`
Starts a new PDF page using a standard format name (e.g., `"A4"`, `"LETTER landscape"`, `"B4 JIS"`) or explicit width and height in points.
Resets state properties (`$W`, `$H`, `$x`, `$y`, `$f`, `$a`, `$s`) to default initial values.

```typescript
pdc.beginPage("A4 landscape", { title: "Executive Report" });
pdc.beginPage(595.28, 841.89, { title: "Custom Dimensions" });
```

#### `endPage(options?: PageOptions): this`
Finalizes the current page stream.
- `options.title?: string`: Optional page title metadata.

---

### Typography & Text Rendering

#### `font(name: StandardFont, size: number, options?: FontOptions | null): this`
Sets the active font family, font size, and typography options. Pass `null` as the 3rd parameter to reset font options (`spacing`, `leading`, `narrow`) to defaults.

- **Supported Standard Base 14 Fonts:**
  - `Times-Roman`, `Times-Bold`, `Times-Italic`, `Times-BoldItalic`
  - `Helvetica`, `Helvetica-Bold`, `Helvetica-Oblique`, `Helvetica-BoldOblique`
  - `Courier`, `Courier-Bold`, `Courier-Oblique`, `Courier-BoldOblique`
  - `Symbol`, `ZapfDingbats`
- **Supported CJK CID Fonts (PDF 1.7 Standard):**
  - Mincho (Serif): `Mincho-JP-H`, `Mincho-JP-V`, `Mincho-TW-H`, `Mincho-TW-V`, `Mincho-KR-H`, `Mincho-KR-V`, `Mincho-CN-H`, `Mincho-CN-V`
  - Gothic (Sans-Serif): `Gothic-JP-H`, `Gothic-JP-V`, `Gothic-TW-H`, `Gothic-TW-V`, `Gothic-KR-H`, `Gothic-KR-V`, `Gothic-CN-H`, `Gothic-CN-V`

```typescript
pdc.font("Helvetica-Bold", 14, { spacing: 0.1, leading: 1.2, narrow: 0.9 });
pdc.font("Mincho-JP-H", 12, null); // Reset typography options
```

#### `textStyle(options: TextStyleOptions | null): this`
Applies text transformation matrices, rotation, rendering modes, and horizontal anchor alignment. Pass `null` to reset.

- `options.anchor`: Alignment anchor (`0.0` = Left, `0.5` = Center, `1.0` = Right).
- `options.mode`: Text rendering mode (`0`: Fill, `1`: Stroke, `2`: Fill+Stroke, `3`: Invisible, `4`-`7`: Clip).
- `options.angle` : Text rotation in degrees.
- `options.scaleX`, `options.scaleY`: Text scaling factors.
- `options.skewX`, `options.skewY`: Text skew angles in degrees.

#### `textAt(x: number, y: number, text?: string): this`
Positions text at coordinates `(x, y)` and draws the string. Handles explicit newline characters (`
`, `
`, `
`) automatically using current font `leading`.

#### `textAdd(text: string): this`
Appends text sequentially following a prior `textAt()` call.

#### `fontMetrics(): FontMetrics`
Returns typographical metrics (ascent, descent, bounding box, capHeight, underlinePos) for the active font and size.

#### `textBBox(text: string): TextBBox`
Calculates the exact bounding box (`xMin`, `yMin`, `xMax`, `yMax`, `width`, `height`) for a string, accounting for font size, multiline layout, and anchor settings.

#### `textWidth(text: string): number`
Calculates the advance width of a string in points.

---

### Color & Transparency

#### `color(options: ColorOptions | null): this`
Sets stroke and/or fill colors. Pass `null` to reset to default colors.

Accepts `ColorSpec` formats:
- **Grayscale:** `0.0` to `1.0` (number) or `"#80"` (hex)
- **RGB:** `[r, g, b]` (array of 0.0-1.0 floats) or `"#RRGGBB"` / `"#RGB"` or `"0.5 0.2 0.8"`
- **CMYK:** `[c, m, y, k]` (array of 0.0-1.0 floats) or `"#CCMMYYKK"` / `"#CMYK"` or `"0 0.5 1 0"`

```typescript
pdc.color({ stroke: "#FF0000", fill: "#00FF00" });
pdc.color({ fill: [0, 0.5, 1, 0] }); // CMYK
```

#### `alpha(options: AlphaOptions | null): this`
Sets stroke and fill opacity (alpha) from `0.00` (transparent) to `1.00` (opaque).

```typescript
pdc.alpha({ stroke: 1.0, fill: 0.4 });
```

---

### Path Construction & Geometry

- `pathAt(x: number, y: number): this` — Begins a subpath at `(x, y)`.
- `lineTo(x: number, y: number): this` — Adds a straight line to `(x, y)`.
- `curveTo(x1, y1, x2, y2, x3, y3): this` — Cubic Bézier curve with two control points.
- `curveInTo(x1, y1, x2, y2): this` — Curve segment with control point on destination side.
- `curveOutTo(x1, y1, x2, y2): this` — Curve segment with control point on origin side.
- `rectAt(x, y, width, height): this` — Adds a rectangular subpath.

---

### Path Closure & Rendering

- `enclose(): this` — Closes current subpath with a line to start point.
- `stroke(): this` — Outlines the path with active stroke style/color and clears the path.
- `fill(options?: FillOptions): this` — Fills current path. Options: `{ close?: boolean, stroke?: boolean, evenOdd?: boolean }`.
- `discard(): this` — Discards unrendered path to prevent warning messages.

---

### Line Style Configuration

#### `lineStyle(options?: LineStyleOptions | null): this`
Configures stroke width, cap style (`0`: Butt, `1`: Round, `2`: Square), join style (`0`: Miter, `1`: Round, `2`: Bevel), miter limit, dash array, and dash phase. Omit arguments or pass `null` to reset.

```typescript
pdc.lineStyle({ width: 2.0, cap: 1, join: 1, dash: [4.5, 2.0], dashPhase: 0 });
```

---

### Applied & Convenience Shapes

- `lineAt(x1, y1, x2, y2): this` — Line segment between two points.
- `hLineAt(x, y, len): this` — Horizontal line of length `len`.
- `vLineAt(x, y, len): this` — Vertical line of length `len`.
- `rRectAt(x, y, w, h, rx, ry?: number): this` — Rounded rectangle.
- `hQuadAt(x, y, w1, angle, h, w2): this` — Horizontal trapezoid or parallelogram.
- `vQuadAt(x, y, h1, angle, w, h2): this` — Vertical trapezoid or parallelogram.
- `polygonAt(x, y, offsets: number[]): this` — Polygon defined by relative `[dx, dy]` pairs.
- `regPolygonAt(x, y, r, v_count, phase): this` — Regular polygon with `v_count` vertices.
- `circleAt(x, y, r): this` — Circle centered at `(x, y)`.
- `ellipseAt(x, y, rx, ry): this` — Ellipse centered at `(x, y)`.
- `arcAt(x, y, r, angle1, angle2): this` — Circular arc/sector.

---

### Coordinate Transformation (`xform`)

#### `xform(options: XFormOptions | null): this`
Applies coordinate transformations (`x`, `y`, `scaleX`, `scaleY`, `skewX`, ``skewY`, `angle`).

> **Note:** Standard PDF matrix transformations are cumulative. PDFCursor automatically multiplies by the inverse of the previous transformation matrix, allowing `xform` parameters to operate as **absolute transformations** relative to page origin.

```typescript
pdc.xform({ x: 300, y: 300, angle: 45 }); // Rotate 45° around (300, 300)
pdc.xform(null); // Reset coordinate system
```

---

### Clipping Regions

#### `beginClip(options?: ClipOptions): this`
#### `endClip(): this`
Establishes a clipping boundary using the current path or text rendering. Saves graphics state on `beginClip()` and automatically restores state on `endClip()`.

```typescript
pdc.rectAt(100, 100, 200, 200);
pdc.beginClip();
  // Drawing operations restricted to 200x200 clipping rectangle
pdc.endClip();
```

---

### Barcodes (1D & 2D)

#### `code1dAt(x, y, w, h, type: Barcode1DType, data: string): this`
Renders 1D barcodes. Supported types: `'Code128'`, `'EAN13'`, `'EAN8'`, `'ITF'` (and case-insensitive aliases `'128'`, `'13'`, `'8'`).

#### `code2dAt(x, y, w, type: Barcode2DType, data: string): this`
Renders 2D barcodes (square dimensions $w 	imes w$). Supported types: `'QR'` (Level M), `'QRH'` (Level H), `'DataMatrix'` / `'DM'`.

---

### Images (PNG / JPEG)

#### `imageRef(data: Uint8Array): number`
Registers binary JPEG or PNG image data into WASM memory and returns an integer handle. PNG soft-mask alpha transparency is fully supported.

#### `imageAt(x, y, idx: number, options?: ImageAtOptions): this`
Draws registered image `idx` at `(x, y)`. Options: `{ width?: number, height?: number, angle?: number }`.

---

### Shading & Gradients

#### `shadeRef(colors: string[], options?: ShadeOptions): number`
Registers linear or radial gradient shaders. Note: `options.stops` array values must be specified in strictly ascending order (0.0 to 1.0). `options.geom`: `[x1, y1, x2, y2]` (Linear) or `[x1, y1, r1, x2, y2, r2]` (Radial).

#### `shadeAt(x, y, idx: number, options?: ShadeAtOptions): this`
Applies registered gradient `idx` at `(x, y)`. Options: `{ scaleX?: number, scaleY?: number, angle?: number }`.

---

### Document Metadata

- `title(value: string): this` — Document title.
- `subject(value: string): this` — Document subject.
- `author(value: string): this` — Document author.
- `creator(value: string): this` — Document creator application.

---

### Digital Signatures

#### `digest(): Uint8Array`
Computes the 32-byte SHA-256 hash digest of the current PDF stream for external signing.

#### `digiSign(data: Uint8Array): this`
Embeds external PKCS#7 / CMS digital signature data into the document signature dictionary.

---

### State Reset & Export

#### `clearPages(): this`
Clears all rendered pages while retaining registered image and shading resources.

#### `clearAll(): this`
Resets the entire PDFCursor instance back to initial state (clears pages, images, gradients, metadata).

#### `getBlob(): Blob`
Finalizes PDF stream binary data and returns a non-destructive `Blob` (`application/pdf`).

---

### Emergency Hatch

#### `hack(op: string): this`
Injects raw, unvalidated PDF stream operators directly into the content stream.

> **Warning:** Emergency escape hatch for edge cases only. Bypasses internal state tracking and may corrupt PDF streams if used improperly.

---

## TypeScript Types & Interfaces

```typescript
export type Point = number;

export type PaperFormat =
  | 'A3' | 'A4' | 'A5'
  | 'B4' | 'B5'
  | 'LETTER' | 'LEGAL'
  | 'B4 JIS' | 'B4 ISO'
  | 'B5 JIS' | 'B5 ISO'
  | 'A4 landscape' | 'A3 landscape' | 'A5 landscape'
  | 'LETTER landscape' | 'LEGAL landscape'
  | (string & {});

export interface PageOptions {
  title?: string;
}

export type StandardFont =
  | 'Times-Roman' | 'Times-Bold' | 'Times-Italic' | 'Times-BoldItalic'
  | 'Helvetica' | 'Helvetica-Bold' | 'Helvetica-Oblique' | 'Helvetica-BoldOblique'
  | 'Courier' | 'Courier-Bold' | 'Courier-Oblique' | 'Courier-BoldOblique'
  | 'Symbol' | 'ZapfDingbats'
  | 'Mincho-JP-H' | 'Mincho-JP-V' | 'Mincho-TW-H' | 'Mincho-TW-V'
  | 'Mincho-KR-H' | 'Mincho-KR-V' | 'Mincho-CN-H' | 'Mincho-CN-V'
  | 'Gothic-JP-H' | 'Gothic-JP-V' | 'Gothic-TW-H' | 'Gothic-TW-V'
  | 'Gothic-KR-H' | 'Gothic-KR-V' | 'Gothic-CN-H' | 'Gothic-CN-V'
  | (string & {});

export interface FontOptions {
  spacing?: number;
  leading?: number;
  narrow?: number;
}

export interface TextStyleOptions {
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
  angle?: number;
  mode?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  anchor?: number;
}

export interface FontMetrics {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  width: number;
  height: number;
  ascent: number;
  descent: number;
  capHeight: number;
  xHeight: number;
  italicAngle: number;
  underlinePos: number;
}

export interface TextBBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  width: number;
  height: number;
}

export type ColorSpec =
  | number
  | [number, number, number]
  | [number, number, number, number]
  | string;

export interface ColorOptions {
  stroke?: ColorSpec;
  fill?: ColorSpec;
}

export interface AlphaOptions {
  stroke?: number;
  fill?: number;
}

export interface FillOptions {
  close?: boolean;
  stroke?: boolean;
  evenOdd?: boolean;
}

export type LineCapStyle = 0 | 1 | 2;
export type LineJoinStyle = 0 | 1 | 2;

export interface LineStyleOptions {
  width?: number;
  cap?: LineCapStyle;
  join?: LineJoinStyle;
  miterLimit?: number;
  dash?: number[] | null;
  dashPhase?: number;
}

export interface XFormOptions {
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
  angle?: number;
}

export interface ClipOptions {
  stroke?: boolean;
  close?: boolean;
  fill?: boolean;
  evenOdd?: boolean;
  textMode?: 4 | 5 | 6 | 7;
}

export type Barcode2DType = 'QR' | 'QRH' | 'DM' | 'DataMatrix' | 'DATA MATRIX' | (string & {});
export type Barcode1DType = '128' | 'CODE128' | 'C128' | '13' | 'EAN13' | 'JAN13' | '8' | 'EAN8' | 'JAN8' | 'ITF' | 'I2OF5' | (string & {});

export type LinearGradientGeom = [x1: number, y1: number, x2: number, y2: number];
export type RadialGradientGeom = [x1: number, y1: number, r1: number, x2: number, y2: number, r2: number];

export interface ShadeOptions {
  geom?: LinearGradientGeom | RadialGradientGeom;
  /** Color stop positions ranging from 0.0 to 1.0 in strictly ascending order. */
  stops?: number[];
  extS?: boolean;
  extE?: boolean;
  ease?: number;
}

export interface ShadeAtOptions {
  scaleX?: number;
  scaleY?: number;
  angle?: number;
}

export interface ImageAtOptions {
  width?: number;
  height?: number;
  angle?: number;
}
```

---

*Copyright © 2026 NSOFT. All rights reserved.*
