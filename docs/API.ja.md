# PDFCursor API リファレンス

[English](API.md) | **Japanese**

**PDFCursor** の詳細な API リファレンスへようこそ。このドキュメントでは、`pdfCursor.d.mts` および WebAssembly コアエンジンに含まれるすべてのクラス、メソッド、プロパティ、TypeScript 型定義の完全な技術仕様を解説します。

---

## 目次

- [概要 & アーキテクチャ](#概要--アーキテクチャ)
- [クラス: PDFCursor](#クラス-pdfCursor)
  - [コンストラクタ](#コンストラクタ)
  - [リードオンリー状態プロパティ](#リードオンリー状態プロパティ)
  - [ドキュメント & ページライフサイクル](#ドキュメント--ページライフサイクル)
  - [フォント & テキスト描画](#フォント--テキスト描画)
  - [カラー & 不透明度](#カラー--不透明度)
  - [パス構築 & 基本描画](#パス構築--基本描画)
  - [パスのクローズ & レンダリング](#パスのクローズ--レンダリング)
  - [線スタイル設定](#線スタイル設定)
  - [応用図形描画メソッド](#応用図形描画メソッド)
  - [座標変換 (`xform`)](#座標変換-xform)
  - [クリッピング領域](#クリッピング領域)
  - [バーコード描画 (1D & 2D)](#バーコード描画-1d--2d)
  - [画像描画 (PNG / JPEG)](#画像描画-png--jpeg)
  - [シェーディング & グラデーション](#シェーディング--グラデーション)
  - [ドキュメントメタデータ](#ドキュメントメタデータ)
  - [デジタル署名](#デジタル署名)
  - [状態クリア & 出力](#状態クリア--出力)
  - [エマージェンシーハック](#エマージェンシーハック)
- [TypeScript 型・インターフェース定義](#typescript-型インターフェース定義)

---

## 概要 & アーキテクチャ

**PDFCursor** は、C++ WebAssembly (`emsdk`) で実装された、低レベルかつ軽量なクライアントサイド PDF 生成エンジンです。外部サーバーインフラに依存せず、ブラウザ上で直接 PDF 1.7 規格準拠のバイナリデータ（Blob）を高速に生成します。

### 座標系と単位
- **原点**: ページの左下隅 `(0, 0)` （$x$ は右方向、$y$ は上方向に増加）。
- **単位**: Point (pt) （**1.0 pt = 1/72 インチ** $pprox$ 約 0.3528 mm）。すべての座標、寸法、フォントサイズ、線幅はこの単位を使用します。
- **精度**: 浮動小数点座標は **小数点以下 2 桁（0.01 pt 精度）** まで有効です。

### エラー & 例外処理
以下のような操作を行った場合、API メソッドは standard JavaScript の `Error` 例外をスローします：
- **不正な引数**: 範囲外の数値指定、無効なカラー文字列、存在しないフォント名やバーコード種別の指定。
- **状態描画シーケンス違反**: パス構築中のカラー変更など、PDF 描画ルールに反する操作の実行。

---

## クラス: PDFCursor

WebAssembly モジュールから提供されるメインクラスです。

### コンストラクタ

```typescript
const pdc = new mod.PDFCursor();
```
`PDFCursor` インスタンスを生成します。

---

### リードオンリー状態プロパティ

PDFCursor は直前に設定・計算された描画パラメータをリードオンリープロパティとして保持しています。これらを参照することで、流れるような相対位置計算や自動レイアウトを構築できます。

| プロパティ | 型 | 説明 |
| :--- | :--- | :--- |
| `pdc.$W` | `number` | ページ幅 (pt)。 |
| `pdc.$H` | `number` | ページ高さ (pt)。 |
| `pdc.$x` | `number` | 最後に指定した $x$ 座標 (pt)。 |
| `pdc.$y` | `number` | 最後に指定した $y$ 座標 (pt)。 |
| `pdc.$f` | `number` | 最後に指定したフォントサイズ (pt)。 |
| `pdc.$a` | `number` | 最後に指定したテキストアンカー値 (`0.0`: 左揃え, `0.5`: 中央揃え, `1.0`: 右寄せ)。 |
| `pdc.$s` | `string` | 最後に指定した文字列。 |

---

### ドキュメント & ページライフサイクル

#### `beginPage(format: PaperFormat, options?: PageOptions): this`
#### `beginPage(width: number, height: number, options?: PageOptions): this`
標準用紙サイズ（例: `"A4"`, `"LETTER landscape"`, `"B4 JIS"`）またはミリ・pt直接指定の数値で新しいページを開始します。
各状態プロパティ（`$W`, `$H`, `$x`, `$y`, `$f`, `$a`, `$s`）は初期値にリセットされます。

```typescript
pdc.beginPage("A4 landscape", { title: "月次報告書" });
pdc.beginPage(595.28, 841.89, { title: "カスタムサイズ" });
```

#### `endPage(options?: PageOptions): this`
現在のページ描画を完了します。
- `options.title?: string`: ページメタデータのタイトル指定。

---

### フォント & テキスト描画

#### `font(name: StandardFont, size: number, options?: FontOptions | null): this`
アクティブなフォント名、フォントサイズ、および組版オプションを設定します。第 3 引数に `null` を渡すと組版オプション（`spacing`, `leading`, `narrow`）がデフォルトにリセットされます。

- **Standard Base 14 フォント:**
  - `Times-Roman`, `Times-Bold`, `Times-Italic`, `Times-BoldItalic`
  - `Helvetica`, `Helvetica-Bold`, `Helvetica-Oblique`, `Helvetica-BoldOblique`
  - `Courier`, `Courier-Bold`, `Courier-Oblique`, `Courier-BoldOblique`
  - `Symbol`, `ZapfDingbats`
- **CJK CID フォント (PDF 1.7 標準):**
  - 明朝体 (Serif): `Mincho-JP-H`, `Mincho-JP-V`, `Mincho-TW-H`, `Mincho-TW-V`, `Mincho-KR-H`, `Mincho-KR-V`, `Mincho-CN-H`, `Mincho-CN-V`
  - ゴシック体 (Sans-Serif): `Gothic-JP-H`, `Gothic-JP-V`, `Gothic-TW-H`, `Gothic-TW-V`, `Gothic-KR-H`, `Gothic-KR-V`, `Gothic-CN-H`, `Gothic-CN-V`

```typescript
pdc.font("Gothic-JP-H", 14, { spacing: 0.1, leading: 1.2, narrow: 0.9 });
pdc.font("Helvetica", 12, null); // オプションのリセット
```

#### `textStyle(options: TextStyleOptions | null): this`
テキストの変形行列、回転、レンダリングモード、アンカー位置を設定します。`null` でリセットします。

- `options.anchor`: アライメント位置 (`0.0`: 左揃え, `0.5`: 中央揃え, `1.0`: 右寄せ)。
- `options.mode`: レンダリングモード (`0`: 塗り潰し, `1`: 輪郭線, `2`: 塗り+輪郭, `3`: 非表示, `4`-`7`: クリッピング)。
- `options.angle` : 回転角度（度）。
- `options.scaleX`, `options.scaleY`: 拡大縮小率。
- `options.skewX`, `options.skewY`: 傾斜角度（度）。

#### `textAt(x: number, y: number, text?: string): this`
指定座標 `(x, y)` にテキストを配置して描画します。文字列中の改行コード (`
`, `
`, `
`) を自動検知し、`leading` に従った改行処理を行います。

#### `textAdd(text: string): this`
直前の `textAt()` の最終印字位置から連続してテキストを追加描画します。

#### `fontMetrics(): FontMetrics`
選択中のフォントおよびサイズに基づいて計算されたメトリクス情報（ascent, descent, bounding box, capHeight, underlinePos）を返します。

#### `textBBox(text: string): TextBBox`
改行を含む指定文字列の正確なバウンディングボックス (`xMin`, `yMin`, `xMax`, `yMax`, `width`, `height`) を返します。

#### `textWidth(text: string): number`
指定文字列の実際の印字幅 (pt) を返します。

---

### カラー & 不透明度

#### `color(options: ColorOptions | null): this`
線（`stroke`）および塗り（`fill`）のカラーを設定します。`null` でデフォルトに戻します。

対応フォーマット (`ColorSpec`):
- **グレースケール:** `0.0` 〜 `1.0` (数値) または `"#80"` (Hex)
- **RGB:** `[r, g, b]` (0.0-1.0 配列) または `"#RRGGBB"` / `"#RGB"` または `"0.5 0.2 0.8"`
- **CMYK:** `[c, m, y, k]` (0.0-1.0 配列) または `"#CCMMYYKK"` / `"#CMYK"` または `"0 0.5 1 0"`

```typescript
pdc.color({ stroke: "#FF0000", fill: "#00FF00" });
pdc.color({ fill: [0, 0.5, 1, 0] }); // CMYK
```

#### `alpha(options: AlphaOptions | null): this`
不透明度（アルファ値）を `0.00` (完全透明) 〜 `1.00` (完全不透明) で設定します。

```typescript
pdc.alpha({ stroke: 1.0, fill: 0.4 });
```

---

### パス構築 & 基本描画

- `pathAt(x: number, y: number): this` — 座標 `(x, y)` から新しいサブパスを開始します。
- `lineTo(x: number, y: number): this` — 座標 `(x, y)` へ直線を引きます。
- `curveTo(x1, y1, x2, y2, x3, y3): this` — 2つの制御点を持つ 3 次ベジェ曲線を追加します。
- `curveInTo(x1, y1, x2, y2): this` — 終点側に制御点を持つ曲線を追加します。
- `curveOutTo(x1, y1, x2, y2): this` — 始点側に制御点を持つ曲線を追加します。
- `rectAt(x, y, width, height): this` — 矩形サブパスを追加します。

---

### パスのクローズ & レンダリング

- `enclose(): this` — 現在のサブパスの始点へ直線を引いて閉じます。
- `stroke(): this` — パスの輪郭線を描画し、パスをクリアします。
- `fill(options?: FillOptions): this` — パスを塗り潰します。オプション: `{ close?: boolean, stroke?: boolean, evenOdd?: boolean }`。
- `discard(): this` — 未描画のパスを破棄し、警告メッセージを防止します。

---

### 線スタイル設定

#### `lineStyle(options?: LineStyleOptions | null): this`
線幅、端点形状 (`0`: Butt, `1`: Round, `2`: Square)、結合形状 (`0`: Miter, `1`: Round, `2`: Bevel)、マイター限界値、破線パターン配列および位相を設定します。`null` でリセットします。

```typescript
pdc.lineStyle({ width: 2.0, cap: 1, join: 1, dash: [4.5, 2.0], dashPhase: 0 });
```

---

### 応用図形描画メソッド

- `lineAt(x1, y1, x2, y2): this` — 2点間の直線。
- `hLineAt(x, y, len): this` — 長さ `len` の水平線。
- `vLineAt(x, y, len): this` — 長さ `len` の垂直線。
- `rRectAt(x, y, w, h, rx, ry?: number): this` — 角丸四角形。
- `hQuadAt(x, y, w1, angle, h, w2): this` — 水平方向の台形・平行四辺形。
- `vQuadAt(x, y, h1, angle, w, h2): this` — 垂直方向の台形・平行四辺形。
- `polygonAt(x, y, offsets: number[]): this` — 相対座標 `[dx, dy]` 配列による多角形。
- `regPolygonAt(x, y, r, v_count, phase): this` — 正多角形。
- `circleAt(x, y, r): this` — 円。
- `ellipseAt(x, y, rx, ry): this` — 楕円。
- `arcAt(x, y, r, angle1, angle2): this` — 円弧・扇形。

---

### 座標変換 (`xform`)

#### `xform(options: XFormOptions | null): this`
座標系の移動、拡大縮小、傾斜、回転を適用します。

> **注意:** 通常の PDF 行列変換は累積されますが、PDFCursor は内部的に前回変換の逆行列を自動乗算するため、`xform` で指定する値は常に**原点に対する絶対変換**として動作します。

```typescript
pdc.xform({ x: 300, y: 300, angle: 45 }); // (300, 300) を中心に45度回転
pdc.xform(null); // 座標系を初期状態にリセット
```

---

### クリッピング領域

#### `beginClip(options?: ClipOptions): this`
#### `endClip(): this`
描画領域をパスやテキストに制限するクリッピングブロックを開始・終了します。`beginClip()` 実行時のグラフィックス状態が自動保存され、`endClip()` 呼出時に復元されます。

```typescript
pdc.rectAt(100, 100, 200, 200);
pdc.beginClip();
  // 矩形内に制限された描画処理
pdc.endClip();
```

---

### バーコード描画 (1D & 2D)

#### `code1dAt(x, y, w, h, type: Barcode1DType, data: string): this`
1次元バーコードを描画します。対応種別: `'Code128'`, `'EAN13'`, `'EAN8'`, `'ITF'` (別名: `'128'`, `'13'`, `'8'`)。

#### `code2dAt(x, y, w, type: Barcode2DType, data: string): this`
2次元バーコードを描画します（正方形）。対応種別: `'QR'` (レベルM), `'QRH'` (レベルH), `'DataMatrix'` / `'DM'`。

---

### 画像描画 (PNG / JPEG)

#### `imageRef(data: Uint8Array): number`
バイナリ形式の JPEG または PNG 画像データを登録し、リソース ID（数値）を取得します。PNG のアルファ透過チャンネルに完全対応しています。

#### `imageAt(x, y, idx: number, options?: ImageAtOptions): this`
登録済みの画像 ID `idx` を `(x, y)` に描画します。オプション: `{ width?: number, height?: number, angle?: number }`。

---

### シェーディング & グラデーション

#### `shadeRef(colors: string[], options?: ShadeOptions): number`
線形または放射状のグラデーションシェーダーを登録します。※ `options.stops` の配列値（0.0 〜 1.0）は必ず昇順で指定します。`options.geom`: `[x1, y1, x2, y2]` (線形) または `[x1, y1, r1, x2, y2, r2]` (放射状)。

#### `shadeAt(x, y, idx: number, options?: ShadeAtOptions): this`
登録済みのグラデーション ID `idx` を `(x, y)` に適用します。オプション: `{ scaleX?: number, scaleY?: number, angle?: number }`。

---

### ドキュメントメタデータ

- `title(value: string): this` — ドキュメントのタイトル。
- `subject(value: string): this` — ドキュメントの件名。
- `author(value: string): this` — 作成者名。
- `creator(value: string): this` — 作成アプリケーション名。

---

### デジタル署名

#### `digest(): Uint8Array`
電子署名用に、現在の PDF ストリームの 32 バイト SHA-256 ダイジェストハッシュを取得します。

#### `digiSign(data: Uint8Array): this`
外部で生成された PKCS#7 / CMS 署名データを PDF に埋め込みます。

---

### 状態クリア & 出力

#### `clearPages(): this`
登録済み画像・シェーディングリソースを保持したまま、すべてのページ描画内容を消去します。

#### `clearAll(): this`
インスタンスを初期状態にリセットします（ページ、画像、グラデーション、メタデータをすべてクリア）。

#### `getBlob(): Blob`
現在の PDF 描画内容を確定し、非破壊的に Blob オブジェクト (`application/pdf`) を返します。

---

### エマージェンシーハック

#### `hack(op: string): this`
生の PDF オペレーター文字列をコンテンツストリームに直接注入します。

> **警告:** 非常時専用のエスケープハッチです。内部状態管理をバイパスするため、不適切な使用は PDF ストリームの破損を引き起こす可能性があります。

---

## TypeScript 型・インターフェース定義

`pdfCursor.d.mts` で提供されている全型定義の一覧です。

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
  /** 0.0 ～ 1.0 の範囲のグラデーション位置（必ず昇順で指定）。 */
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
