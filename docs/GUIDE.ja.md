# PDFCursor 実践ガイド & レシピ集

[English](GUIDE.md) | **Japanese**

本ガイドでは、**PDFCursor** を使用して実際の Web アプリケーションで高品質な帳票や PDF ドキュメントを構築するための、実践的なコード例とレシピを解説します。

---

## 目次

1. [データテーブル（表組み）とレイアウト配置](#1-データテーブル表組みとレイアウト配置)
2. [バーコード・QRコードの配置と応用](#2-バーコードqrコードの配置と応用)
3. [デジタル署名とセキュリティ](#3-デジタル署名とセキュリティ)
4. [ウォーターマーク・画像クリッピング・グラデーション](#4-ウォーターマーク画像クリッピンググラデーション)
5. [複数ページ帳票とヘッダー・フッターの配置](#5-複数ページ帳票とヘッダーフッターの配置)
6. [実寸計算ヘルパーを活用した自動レイアウト調整](#6-実寸計算ヘルパーを活用した自動レイアウト調整)

---

## 1. データテーブル（表組み）とレイアウト配置

複数カラムの表組み、1行おきの背景色設定、数値の右寄せ揃え、小計・合計計算を含むデータテーブルの実装例です。

```typescript
import Module from './pdfCursor.mjs';

async function generateTableReport() {
  const mod = await Module();  const pdc = new mod.PDFCursor();

  // ドキュメント情報の基本設定
  pdc.title("月次集計レポート")
     .author("株式会社NSOFT")
     .beginPage("A4", { title: "集計レポート" });

  const marginX = 40;
  const pageWidth = pdc.$W; // A4幅 (約 595.28 pt)
  let currentY = pdc.$H - 50; // ページ上部から開始 (A4高さ 約 841.89 pt)

  // 1. ヘッダータイトルとドキュメント番号
  pdc.font("Gothic-JP-H", 20)
     .color({ fill: "#003366" })
     .textAt(marginX, currentY, "月次集計レポート")
     .font("Gothic-JP-H", 9)
     .color({ fill: "#666666" })
     .textStyle({ anchor: 1.0 }) // 右寄せ
     .textAt(pageWidth - marginX, currentY, "文書ID: DOC-2026-01\n発行日: 2026年10月01日")
     .textStyle(null);

  currentY -= 50;

  // 2. 表ヘッダー (テーブル構成)
  const colX = [marginX, marginX + 220, marginX + 300, pageWidth - marginX];
  const tableWidth = pageWidth - marginX * 2;

  pdc.color({ fill: "#003366" })
     .rectAt(marginX, currentY - 5, tableWidth, 22)
     .fill()
     .font("Gothic-JP-H", 9)
     .color({ fill: "#FFFFFF" })
     .textAt(colX[0] + 10, currentY, "項目 / カテゴリ")
     .textAt(colX[1] + 10, currentY, "数量")
     .textAt(colX[2] + 10, currentY, "単価")
     .textStyle({ anchor: 1.0 })
     .textAt(colX[3] - 10, currentY, "金額 (円)")
     .textStyle(null);

  currentY -= 25;

  // 3. 明細行の描画
  const items = [
    { desc: "システムライセンス パッケージ A", qty: 1, price: 45000 },
    { desc: "標準運用サポート作業", qty: 4, price: 12000 },
    { desc: "年間メンテナンス保守パッケージ", qty: 1, price: 18000 },
  ];

  pdc.font("Gothic-JP-H", 9).color({ fill: "#222222" });

  let subtotal = 0;
  items.forEach((item, index) => {
    const amount = item.qty * item.price;
    subtotal += amount;

    // 1行おきの背景色設定
    if (index % 2 === 1) {
      pdc.color({ fill: "#F8F9FA" })
         .rectAt(marginX, currentY - 4, tableWidth, 20)
         .fill();
    }

    pdc.color({ fill: "#222222" })
       .textAt(colX[0] + 10, currentY, item.desc)
       .textAt(colX[1] + 10, currentY, item.qty.toString())
       .textAt(colX[2] + 10, currentY, `¥${item.price.toLocaleString()}`)
       .textStyle({ anchor: 1.0 })
       .textAt(colX[3] - 10, currentY, `¥${amount.toLocaleString()}`)
       .textStyle(null);

    // 罫線 (水平線)
    pdc.lineStyle({ width: 0.5 })
       .color({ stroke: "#E0E0E0" })
       .hLineAt(marginX, currentY - 6, tableWidth)
       .stroke();

    currentY -= 20;
  });

  // 4. 合計金額表示
  currentY -= 15;
  pdc.font("Gothic-JP-H", 9)
     .textStyle({ anchor: 1.0 })
     .textAt(colX[2] + 60, currentY, "合計金額:")
     .textAt(colX[3] - 10, currentY, `¥${subtotal.toLocaleString()}`)
     .textStyle(null);

  pdc.endPage();

  return pdc.getBlob();
}
```

---

## 2. バーコード・QRコードの配置と応用

PDFCursor は1次元バーコードおよび2次元バーコード（QRコード等）を標準で内蔵しており、外部ライブラリ無しで直接ベクトル描画できます。

```javascript
// 1次元バーコード (Code128, JAN13, JAN8, ITF)
pdc.code1dAt(50, 600, 200, 40, "CODE128", "DOC-2026-01")
   .code1dAt(300, 600, 180, 40, "JAN13", "4901234567890");

// 2次元バーコード (QR: レベルM, QRH: レベルH, DataMatrix)
pdc.code2dAt(50, 480, 80, "QR", "https://example.com/verify/DOC-2026-01")
   .code2dAt(200, 480, 80, "QRH", "https://example.com/verify/DOC-2026-01")
   .code2dAt(350, 480, 80, "DataMatrix", "ID:1234567890;BATCH:99");

// 応用例: 誤り訂正率の高い QRH を使用し、QRコード中央にロゴ/テキストを重ねる
pdc.code2dAt(50, 350, 100, "QRH", "https://github.com")
   .color({ fill: "#FFFFFF" })
   .rectAt(85, 385, 30, 30) // 中央を白塗りマスク
   .fill()
   .font("Helvetica-Bold", 10)
   .color({ fill: "#000000" })
   .textStyle({ anchor: 0.5 })
   .textAt(100, 396, "PDF")
   .textStyle(null);
```

---

## 3. デジタル署名とセキュリティ

PDFCursor は SHA-256 ダイジェスト算出と PKCS#7 / CMS デジタル署名データの埋め込みに対応しています。

```javascript
async function createDigitallySignedPDF(pkcs7Signer) {
  const mod = await Module();
  const pdc = new mod.PDFCursor();

  pdc.beginPage("A4")
     .font("Gothic-JP-H", 14)
     .textAt(100, 700, "電子署名付き公式文書")
     .endPage();

  // 1. SHA-256 ダイジェスト（32バイト）を取得
  const hashDigest = pdc.digest();

  // 2. 外部 PKI サービスで署名し PKCS#7 バイナリを生成
  const pkcs7Signature = await pkcs7Signer(hashDigest);

  // 3. デジタル署名バイナリを埋め込み
  pdc.digiSign(pkcs7Signature);

  return pdc.getBlob();
}
```

---

## 4. ウォーターマーク・画像クリッピング・グラデーション

### 透かし (Watermark) の傾けて描画
```javascript
// 半透明な「社外秘」の対角ウォーターマーク
pdc.beginPage("A4")
   .alpha({ fill: 0.15 }) // 不透明度 15%
   .color({ fill: "#FF0000" })
   .font("Gothic-JP-H", 60)
   .textStyle({ angle: 45, anchor: 0.5 })
   .textAt(pdc.$W / 2, pdc.$H / 2, "社 外 秘")
   .textStyle(null)
   .alpha(null); // 不透明度リセット
```

### 角丸マスクによる画像のクリッピング
```javascript
// 角丸四角形のパスで画像をトリミング描画
const imageHandle = pdc.imageRef(pngUint8Array);

pdc.rRectAt(100, 500, 200, 150, 15) // 角丸パス構築
   .beginClip() // クリッピング領域を開始
   .imageAt(100, 500, imageHandle, { width: 220 }) // 領域内だけに描画される
   .endClip(); // グラフィックス状態の復元
```

---

## 5. 複数ページ帳票とヘッダー・フッターの配置

ページサイズ読み取りプロパティ (`pdc.$W`, `pdc.$H`) を活用して、全ページ共通のヘッダー・フッターを描画します。

```javascript
function renderReportPage(pdc, pageNum, totalPages, titleStr) {
  pdc.beginPage("A4", { title: titleStr });

  // 共通ヘッダー
  pdc.font("Gothic-JP-H", 9)
     .color({ fill: "#888888" })
     .textAt(40, pdc.$H - 30, titleStr)
     .hLineAt(40, pdc.$H - 36, pdc.$W - 80)
     .stroke();

  // 共通フッター (ページ番号)
  pdc.font("Gothic-JP-H", 9)
     .color({ fill: "#888888" })
     .textStyle({ anchor: 1.0 })
     .textAt(pdc.$W - 40, 30, `ページ ${pageNum} / ${totalPages}`)
     .textStyle(null)
     .hLineAt(40, 42, pdc.$W - 80)
     .stroke()
     .endPage();
}
```

---

## 6. 実寸計算ヘルパーを活用した自動レイアウト調整

`textBBox` や `fontMetrics` を利用して、テキストの描画前に正確なサイズを取得し、文字を囲む背景枠や下線を自動調整します。

```javascript
const textStr = "動的タイトル文字列\n2行目の説明文";

pdc.font("Gothic-JP-H", 16)
   .textStyle({ anchor: 0.5 }); // 中央揃え

const bbox = pdc.textBBox(textStr);
const x = pdc.$W / 2;
const y = 600;

// テキスト背後に適切なパディングを持つ背景ボックスを描画
const padding = 8;
pdc.color({ fill: "#EBF3FA", stroke: "#0066CC" })
   .rRectAt(x + bbox.xMin - padding, y + bbox.yMin - padding, bbox.width + padding * 2, bbox.height + padding * 2, 4)
   .fill({ stroke: true })
   .color({ fill: "#003366" })
   .textAt(x, y, textStr);
```
