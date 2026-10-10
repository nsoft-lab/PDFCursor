<p>
  <img src="assets/pdfcursor_logo.png" alt="PDFCursor Logo" width="320" />
  &emsp; 
  <a href="https://nsoft-lab.github.io/PDFCursor/examples/">
    <img src="https://img.shields.io/badge/DEMO-2ea44f?style=for-the-badge&logo=github" alt="DEMO" />
  </a>
</p>

[English](README.md) | **Japanese**

**PDFCursor** は、WebAssembly（C++ / emsdk）によって動作する、JavaScript 向けの軽量なクライアントサイド PDF 生成ライブラリです。

サーバーサイドのレンダリングエンジンや外部依存を必要とせず、ブラウザ上で低レベルな PDF ストリームを最小限のオーバーヘッドで生成できます。TypeScript 型定義ファイル (`pdfCursor.d.mts`) も標準で同梱されています。

---

## 特徴 (Features)

- 🪶 **軽量な実行環境**: C++ (emsdk) で実装された WebAssembly コアエンジンにより、極めて軽量なフットプリントと高速なクライアントサイド処理を実現。
- 📐 **実寸指向の設計**: PDF 標準仕様に従った「左下原点」「1/72 inch (pt) 単位」での正確な座標管理（有効精度: 小数点第2位 / 0.01 pt）。
- 🔤 **Base14 & CJK CID フォント対応**: 重いフォントファイルを埋め込むことなく、Standard Base14 フォントおよび日・中・韓・台湾向けの CJK CID フォント（明朝・ゴシック）をサポート。
- 🎨 **豊富な描画 API**: 直線、ベジェ曲線、角丸四角形、多角形、星型、台形、円・楕円・扇形などの多様なベクター図形描画。
- 📊 **バーコード生成対応**: 1次元バーコード (Code128, EAN13, JAN8, ITF) および 2次元バーコード (QR, DataMatrix) の直接描画。
- 🖼️ **画像・グラデーション (Shading)**: 透過 PNG / JPEG の埋め込み、線形・放射状グラデーション描画。
- ✂️ **クリッピング & 座標変換**: テキストやパスによるクリッピング領域の保護、累積しない絶対指定の座標変換 (`xform`)。
- ✍️ **デジタル署名対応**: SHA-256 ダイジェスト算出 (`digest()`) および PKCS#7 / CMS 署名データの埋め込み (`digiSign()`)。
- 📏 **レイアウト計算ヘルパー**: 文字列バウンディングボックス (`textBBox`) やフォントメトリクス (`fontMetrics`) による高度な位置計算支援。

---

## 構成ファイル (Files)

PDFCursor は以下のファイルで構成されています。

- `pdfCursor.wasm`: C++ でビルドされた WebAssembly コアエンジン
- `pdfCursor.mjs`: ES Module インターフェース
- `pdfCursor.d.mts`: TypeScript 型定義ファイル

---

## クイックスタート (Quick Start)

### JavaScript (ES Modules)

```html
<script type="module">
import Module from './pdfCursor.mjs';

async function generatePDF() {
  const mod = await Module();
  const pdc = new mod.PDFCursor();

  // A4 横向きページを開始して描画
  pdc.beginPage("A4 landscape", { title: "サンプル文書" })
     .font("Helvetica", 16)
     .textAt(100, 100, "Hello, World!") // 座標 (100pt, 100pt) にテキスト配置
     .endPage();

  // Blob オブジェクトとして出力
  const pdfBlob = pdc.getBlob();
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // プレビュー表示やダウンロードに利用
  document.getElementById("viewer").data = pdfUrl;
}

generatePDF();
</script>
```

### TypeScript での使用例

PDFCursor には TypeScript 型定義 (`pdfCursor.d.mts`) が同梱されているため、強力な自動補完と厳密な型チェックを活用できます。

```typescript
import Module from './pdfCursor.mjs';
import type { PDFCursor, PaperFormat, StandardFont } from './pdfCursor';

async function generatePDF(): Promise<void> {
  const mod = await Module();
  const pdc: PDFCursor = new mod.PDFCursor();

  const paper: PaperFormat = 'A4 landscape';
  const fontName: StandardFont = 'Helvetica';

  pdc.beginPage(paper, { title: 'TypeScript サンプル' })
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

## 座標系と単位 (Coordinates & Units)

- **原点**: ページの左下隅 `(0, 0)`
- **単位**: Point (pt) （1.0 pt = 1/72 インチ ≒ 約 0.3528 mm）
- **精度**: 小数点以下 2 桁（0.01 pt 精度）

```javascript
// 例: 実寸 pt で指定して改行コードを含むテキストを出力
pdc.font("Mincho-JP-H", 12)
   .textAt(92.44, 102.56, "PDFCursor へようこそ\n2行目のテキスト");
```

---

## 主な機能と API 概要

### 1. テキストとフォント (Text & Typography)

```javascript
// フォント設定 (Base14 または CJK CID フォント)
pdc.font("Gothic-JP-H", 14, { spacing: 0.1, leading: 1.2, narrow: 0.9 });

// 中央揃え / 右寄せ設定
pdc.textStyle({ anchor: 0.5 }); // 0.0: 左揃え, 0.5: 中央揃え, 1.0: 右寄せ

// テキスト描画と自動改行
pdc.textAt(200, 150, "中央揃えテキスト\n2行目")
   .textAdd(" (追記テキスト)");

// 実寸計算ヘルパー
const bbox = pdc.textBBox("計測対象文字列");
const width = pdc.textWidth("計測対象文字列");
const metrics = pdc.fontMetrics();
```

### 2. カラーと不透明度 (Color & Opacity)

RGB、CMYK、グレースケール、16進数カラーコード（#HEX）および不透明度（Alpha）に対応しています。

```javascript
// HEX カラー指定
pdc.color({ stroke: "#FF0000", fill: "#00FF00" });

// CMYK / RGB / グレースケール指定 (0.0 ～ 1.0)
pdc.color({ fill: [0, 0.5, 1, 0] }); // CMYK

// 不透明度 (Alpha)
pdc.alpha({ stroke: 1.0, fill: 0.4 }); // Fill の不透明度 40%
```

### 3. ベクターグラフィック & パス (Vector Graphics & Paths)

```javascript
// パス構築と描画
pdc.pathAt(100, 100)
   .lineTo(200, 100)
   .curveTo(240, 150, 260, 50, 300, 100)
   .stroke();

// 図形ヘルパーメソッド
pdc.rectAt(50, 50, 100, 80)                     // 矩形
   .rRectAt(200, 50, 100, 80, 10)               // 角丸矩形
   .circleAt(350, 90, 40)                       // 円
   .regPolygonAt(100, 200, 30, 5, 0)            // 正五角形
   .hQuadAt(200, 200, 100, 15, 50, 80)          // 台形
   .stroke();
```

### 4. バーコード描画 (Barcodes)

```javascript
// 1次元バーコード (Code128, EAN13, EAN8, ITF)
pdc.code1dAt(50, 300, 200, 40, "CODE128", "1234567890");

// 2次元バーコード (QR, QRH, DataMatrix)
pdc.code2dAt(300, 300, 80, "QR", "https://github.com");
```

### 5. 画像とグラデーション (Images & Gradients)

```javascript
// 画像の登録と描画 (PNG / JPEG)
const imageHandle = pdc.imageRef(pngUint8Array);
pdc.imageAt(50, 400, imageHandle, { width: 150, angle: 15 });

// グラデーションの登録と描画
const bgShade = pdc.shadeRef(["#b0ffa0", "#ffa0a0"], { geom: [0, 0, 0, 1], stops: [0.0, 1.0] });
pdc.shadeAt(0, 0, bgShade, { scaleY: pdc.$H });
```

### 6. 状態読み取りプロパティ (Read-Only State Properties)

直前に設定・計算された値を参照するリードオンリープロパティを活用して、流れるようなレイアウト構築が可能です。

- `pdc.$W`: ページ幅
- `pdc.$H`: ページ高さ
- `pdc.$x`, `pdc.$y`: 最後に指定した X, Y 座標
- `pdc.$f`: 最後に指定したフォントサイズ
- `pdc.$a`: 最後に指定したアンカー値
- `pdc.$s`: 最後に指定したした文字列

```javascript
// 例: ページの左上ヘッダー位置に印字する例
pdc.textAt(pdc.$W * 0.1, pdc.$H * 0.9, "Header Text");
```

---

## 開発背景 & ポリシー (Design Philosophy & Background)

PDFCursor は、現代の Web アプリケーションにおける軽量な帳票・PDF 生成ニーズに向けて開発されました。
外部サーバーインフラや大規模なクラウドサービスに依存せず、クライアントサイド（JavaScript）で実寸計算を行いながら、軽量な描画処理を完結させることを目的としています。

重いカスタムフォント（TTF/OTF）を埋め込むのではなく、PDF 1.7 仕様に基づいた標準 Base14 フォントおよび CJK CID フォントを活用することで、超軽量なバイナリサイズと瞬時な動的 PDF 生成を実現しています。

---

## ライセンス & 商用利用条件 (License & Terms)

PDFCursor はすべての機能を無料でお試しいただけます。

### ライセンス形態 (License Types)

- **Trial Version (無料)**: 全機能を無制限に使用可能。生成される PDF ページに `"Trial Version"` の透かしが入ります（評価・開発テスト用）。
- **Personal License (買い切り / 一括払い)**: 透かしを解除。1 プロダクションサイト（関連する開発・ステージング環境含む）で有効。個人開発者やソロプロジェクト向け。
- **Team / Enterprise License (買い切り / 一括払い)**: 透かしを解除。1 プロダクションサイト（関連する開発・ステージング環境含む）で有効。法人・組織・チーム開発向け。

### ライセンスの適用範囲と利用規約 (License Scope & Terms)

- **1 ライセンス = 1 プロダクションサイト**: 購入された 1 つのライセンスキーにつき、1 つの商用／本番サイト（または 1 アプリケーション）でご使用いただけます。
- **開発・ステージング環境の同梱**: 本番サイトに関連する非商用開発・検証環境（`localhost`、ステージングサーバー、テスト環境など）は、同一ライセンスの範囲内でご利用いただけます。
- **複数プロダクションサイトでの利用**: 複数の商用本番サイトやアプリケーションで展開する場合は、サイトごとに個別ライセンスの購入が必要です。

### 購入とアクティベーション (How to Purchase)

商用ライセンスキーの販売は現在準備中です：

👉 **PDFCursor ライセンス（準備中 / Coming Soon）**

*(※販売開始までは、Trial Version として全機能を無料でお試しいただけます)*

コード内でのライセンスキー適用方法：

```javascript
pdc.licenseKey = "YOUR_LICENSE_KEY";
```

### 著作権表記 (Copyright)

Copyright © 2026 **NSOFT**. All rights reserved.
