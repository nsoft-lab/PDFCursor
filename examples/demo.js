/* Copyright(c) 2026, NSoFT Co., Ltd. */
///////////////////////////////////////////////////////////////////////////////
// demo.js - PDFCursor WASM Demo

import Module from './pdfCursor.mjs';
const mod = await Module();
const pdc = new mod.PDFCursor();

document.querySelector('#btn').addEventListener('click', demo);
const link = document.getElementById("link");
const viewer = document.getElementById('viewer');

function page1() {
    pdc.beginPage("a4 landscape", {title:"page1-Text"})
       .font("Courier", 12)
       .textAt(pdc.$W * 0.4, pdc.$H - 30, new Date().toLocaleString('sv-SE'));
    pdc.font("Helvetica-Bold", 22)
       .color({fill:"#1E3A8A"}) 
       .textAt(pdc.$W * 0.02, pdc.$H - 30, "PDFCursor Showcase")
       .color({stroke:"#CBD5E1"})
       .hLineAt(pdc.$x, pdc.$y - 8, pdc.$W * 0.96)
       .stroke();

    //--- Serif
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#508050"})
       .textAt(30, pdc.$H - 60, "Times-Roman (serif)")
       .color(null)
       .font("Times-Roman", 13, {leading:1.2})
       .textAt(pdc.$x + 10, pdc.$y - 18,
            "\x95 Price: \u20AC125.50 / \xA399.99 / \xA515,000 (\xA9 2026 PDFCursor\u2122)"
         +"\n\x95 Accent: Fran\xE7ois & No\xEB1 visit K\xF8benhavn, M\xFCnchen & Z\xFCrich."
       );
    //--- Sans-Serif
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#508050"})
       .textAt(30, pdc.$y - 32, "Helvetica (sans-serif)")
       .color(null)
       .font("Helvetica", 13)
       .textAt(pdc.$x + 10, pdc.$y - 18,
          "~ Clean & Modern typeface for UI, titles and body text."
         +"\n~ Supports 4 weights: Regular, Bold, Oblique, BoldOblique."
       );
    //--- Monospace
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#508050"})
       .textAt(30, pdc.$y - 32, "Courier (monospace)")
       .color(null)
       .font("Courier", 11, {leading:1.0})
       .textAt(pdc.$x + 10, pdc.$y - 16, 
            "0x0100: 41 42 43 44  45 46 47 48 |ABCD EFGH|"
         +"\n0x0108: 80 82 83 84  A1 A2 A3 A4 |\u20AC\u201A\u0192\u201E \xA1\xA2\xA3\xA4|"
         +"\n0x0110: A9 AA AB AC  AE B0 B1 B7 |\xA9\xAA\xAB\xAC \xAE\xB0\xB1\xB7|"
       );
    //--- Symbol
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#508050"})
       .textAt(30, pdc.$y - 40, "Symbol")
       .font("Symbol", 13)
       .color(null)
       .textAt(pdc.$x + 10, pdc.$y - 18,
           "S (a + b) = p   |   \xF2 f(x)dx = \xA5   |   \x61 \x62 \x67 \x64 \x70 \x77"
       );
    //--- ZapfDingbats
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#508050"})
       .textAt(30, pdc.$y - 20, "ZapfDingbats")
       .font("ZapfDingbats", 13)
       .color({fill:"#059669"}) // (Check)
       .textAt(pdc.$x + 10, pdc.$y - 18, "\x33 ")
       .color({fill:"#DC2626"}) // (Cross)
       .textAdd("\x35 ")
       .color({fill:"#D97706"}) // (Star: 0x38)
       .textAdd("\x38 ")
       .color({fill:"#E11D48"}) // (Heart: 0xAA)
       .textAdd("\xAA ")
       .color({fill:"#2563EB"}) // (Arrow: 0xD4)
       .textAdd("\xD4 ")
       .color({fill:"#7C3AED"}) // (Pencil: 0x27)
       .textAdd("\x30 ")
       .color({fill:"#0891B2"}) // (Circled 4: 0xCD)
       .textAdd("\xCD");
    //--- CJK
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#508050"})
       .textAt(30, pdc.$y - 20, "CID Fonts (CJK)")
       .color(null)
       .font("Mincho-JP-H", 12)
       .textAt(pdc.$x + 10, pdc.$y - 16, "JP (日本語): こんにちは、PDFCursor™ へようこそ！")
       .font("Mincho-TW-H", 12)
       .textAt(pdc.$x, pdc.$y - 16, "TW (繁體中文): 歡迎使用 PDFCursor™ 輕量化引擎！")
       .font("Mincho-KR-H", 12)
       .textAt(pdc.$x, pdc.$y - 16, "KR (한국어): PDFCursor™ 엔진에 오신 것을 환영합니다.")
       .font("Mincho-CN-H", 12)
       .textAt(pdc.$x, pdc.$y - 16, "CN (简体中文): 欢迎使用 PDFCursor™ 高效渲染引擎！")

    //--- anchor 1.0
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#805050"})
       .textAt(pdc.$W * 0.52, pdc.$H - 60, "anchor:1.0")
       .color(null)
       .font("Times-Roman", 12, {leading:1.2})
       .textStyle({anchor:1.0});
    let bb = pdc.textBBox(
        "There are only two kinds of languages:"
      + "\nthe ones people complain about and the ones nobody uses."
      + "\n\x97 Bjarne Stroustrup"
    ).padding(5);
    pdc.textAt(pdc.$x + pdc.$a * bb.length + 7, pdc.$y - 22, pdc.$s)
       .rectAt(pdc.$x + bb.xMin, pdc.$y + bb.yMin, bb.width, bb.height)
       .stroke()
       .textStyle(null);
    //--- anchor 0.7
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#805050"})
       .textAt(pdc.$W * 0.52, pdc.$H - 133, "anchor:0.7")
       .color(null)
       .font("Times-Roman", 12)
       .textStyle({anchor:0.7});
    bb = pdc.textBBox(
        "If you're as clever as you can be when writing code,"
      + "\nhow will you ever debug it?"
      + "\n\x97 Brian Kernighan"
    ).padding(5);
    pdc.textAt(pdc.$x + pdc.$a * bb.length + 7, pdc.$y - 22, pdc.$s)
       .rectAt(pdc.$x + bb.xMin , pdc.$y + bb.yMin , bb.width , bb.height)
       .stroke()
       .textStyle(null);
    //--- anchor 0.3
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#805050"})
       .textAt(pdc.$W * 0.52, pdc.$H - 206, "anchor:0.33")
       .color(null)
       .font("Times-Roman", 12)
       .textStyle({anchor:0.33});
    bb = pdc.textBBox(
        "Most of the really great innovations"
      + "\ncome from small groups of dedicated people, not large teams."
      + "\n\x97 Bill Joy"
    ).padding(5);
    pdc.textAt(pdc.$x + pdc.$a * bb.length + 7, pdc.$y - 22, pdc.$s)
       .rectAt(pdc.$x + bb.xMin , pdc.$y + bb.yMin , bb.width , bb.height)
       .stroke()
       .textStyle(null);
    //--- anchor 0.5
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#805050"})
       .textAt(pdc.$W * 0.52, pdc.$H - 279, "anchor:0.5")
       .color(null)
       .font("Times-Roman", 12)
       .textStyle({anchor:0.5});
    bb = pdc.textBBox(
        "Easy things should be easy,"
      + "\nand hard things possible."
      + "\n\x97 Larry Wall \xA0\xA0"
    ).padding(5);
    pdc.textAt(pdc.$x + pdc.$a * bb.length + 7, pdc.$y - 22, pdc.$s)
       .rectAt(pdc.$x + bb.xMin , pdc.$y + bb.yMin , bb.width , bb.height)
       .stroke()
       .textStyle(null);

    //--- skew & angle
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#505080"})
       .textAt(pdc.$W * 0.74, pdc.$H - 300, "skew & angle")
       .color(null)
       .font("Helvetica", 40)
       .textStyle({skewX:20}).textAt(pdc.$x + 20, pdc.$y - 50, "R")
       .textStyle({skewY:30}).textAt(pdc.$x + 40, pdc.$y, "R")
       .textStyle({angle:35}).textAt(pdc.$x + 60, pdc.$y, "R")
       .textStyle(null);

    //--- Data Matrix
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#707070"})
       .textAt(pdc.$W * 0.62, pdc.$H - 380, "Data Matrix")
       .color(null)
       .lineStyle(null)
       .code2dAt(pdc.$x, pdc.$y - 110, 100, "DM"
           , "Data Matrix GS1 ISO IEC 16022 Specification");
    //--- QR
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#707070"})
       .textAt(pdc.$W * 0.8, pdc.$H - 380, "QR")
       .color(null)
       .code2dAt(pdc.$x, pdc.$y - 110, 100, "QR"
           , "QR Code ISO IEC 18004 Standard Specification");

    //--- Code 128
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#707070"})
       .textAt(pdc.$W * 0.05, 125, "Code 128")
       .color(null)
       .code1dAt(pdc.$x, pdc.$y - 60, 200, 55, "128", "SN-2026#001-a");
    //--- EAN-13
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#707070"})
       .textAt(pdc.$W * 0.33, 135, "EAN-13")
       .color(null)
       .code1dAt(pdc.$x, pdc.$y - 53, 120, 48, "13", "490123456789");
    //--- EAN-8
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#707070"})
       .textAt(pdc.$W * 0.36, 65, "EAN-8")
       .color(null)
       .code1dAt(pdc.$x, pdc.$y - 45, 85, 40, "8", "4901234");
    //--- ITF
    pdc.font("Helvetica-Oblique", 11)
       .color({fill:"#707070"})
       .textAt(pdc.$W * 0.52, 85, "ITF")
       .color(null)
       .code1dAt(pdc.$x, pdc.$y - 50, 180, 45, "itf", "1490123456789");

    //--- PDF CURSOR
    pdc.font("Helvetica-Bold", 50, null)
       .lineStyle({width:2})
       .color({fill:"#A0C020"})
       .textStyle({anchor:0.5, mode:2})
       .textAt(pdc.$W * 0.33, pdc.$H * 0.29, "PDF CURSOR")
       .textStyle({skewX:-60, scaleY:-0.5, mode:0})
       .color({fill:0.4})
       .textAt(pdc.$x, pdc.$y, pdc.$s)
       .textStyle(null);

    pdc.endPage();
}

let buf = new Uint8Array(await (await fetch("./img1.png")).arrayBuffer());
const img1 = pdc.imageRef(buf);

buf = new Uint8Array(await (await fetch("./img2.jpg")).arrayBuffer());
const img2 = pdc.imageRef(buf);

buf = new Uint8Array(await (await fetch("./img3.png")).arrayBuffer());
const img3 = pdc.imageRef(buf);

buf = new Uint8Array(await (await fetch("./img4.png")).arrayBuffer());
const img4 = pdc.imageRef(buf);

buf = new Uint8Array(await (await fetch("./img5.png")).arrayBuffer());
const img5 = pdc.imageRef(buf);

buf = new Uint8Array(await (await fetch("./img6.jpg")).arrayBuffer());
const img6 = pdc.imageRef(buf);

const shd1 = pdc.shadeRef(["#E0F7FA", "#B2EBF2", "#FFF59D", "#4DD0E1", "#0097A7"]
                        , {geom: [0, 0, 1, 0.1] });

const shd2 = pdc.shadeRef(["#fff", "#7f00ff", "#00f", "#0ff"
                        , "#0f0", "#ff0", "#ff7f00", "#f00", "#fff"]
                        , {geom:[0, 0, 1, 0, 0, 1.4], extS:false, extE:false});

function page2() {
    pdc.beginPage("a4 landscape", {title:"page2-Graphics"})
       .font("Courier", 12)
       .textAt(pdc.$W * 0.4, pdc.$H - 30, new Date().toLocaleString('sv-SE'));
    pdc.font("Helvetica-Bold", 22)
       .color({fill:"#1E3A8A"}) 
       .textAt(pdc.$W * 0.02, pdc.$H - 30, "PDFCursor Showcase")
       .color({stroke:"#CBD5E1"})
       .hLineAt(pdc.$x, pdc.$y - 8, pdc.$W * 0.96)
       .stroke();

    //--- line, curve & circle
    pdc.color(null)
       .font("Times-Italic", 12, {narrow:0.8})
       .textAt(35, pdc.$y - 25, "line, curve & circle");
    pdc.lineStyle({width:1.5})
       .pathAt(20, pdc.$H - 90)
       .lineTo(pdc.$x + 130, pdc.$y)
       .pathAt(pdc.$x - 25, pdc.$y)
       .curveTo(pdc.$x, pdc.$y + 35, pdc.$x + 30, pdc.$y + 45, pdc.$x + 60, pdc.$y + 30)
       .curveTo(pdc.$x + 12, pdc.$y - 6, pdc.$x + 15, pdc.$y - 10, pdc.$x + 30, pdc.$y)
       .stroke()
       .color({stroke:0.8})
       .lineStyle({width:1, cap:1});
    let f = 10;
    pdc.vLineAt(24, pdc.$H - 90, -20);
    for (let i = 0; i < 20; ++i) {
       pdc.vLineAt(pdc.$x + f, pdc.$y, -20);
       f *= 0.944;
    }
    pdc.stroke()
       .color(null)
       .lineStyle({width:0.5, cap:0})
       .circleAt(pdc.$x + 25, pdc.$y - 10, 24)
       .circleAt(pdc.$x, pdc.$y, 16)
       .stroke()
       .hLineAt(20, pdc.$H - 93, 204)
       .hLineAt(20, pdc.$y - 3, 202)
       .hLineAt(20, pdc.$y - 3, 200)
       .stroke()
       .lineStyle({width:1})
       .hLineAt(20, pdc.$y - 3, 198)
       .hLineAt(20, pdc.$y - 3, 196)
       .hLineAt(20, pdc.$y - 3, 194)
       .stroke()
       .lineStyle(null);

    //--- rect & quad
    pdc.textAt(35, pdc.$H - 140, "rect & quad")
       .lineStyle({join:1})
       .rectAt(40, pdc.$y - 110, 50, 80)
       .stroke()
       .color({fill:0.8})
       .hQuadAt(pdc.$x, pdc.$y + 80, 50, 45, 15, 50)
       .fill({stroke:true})
       .color({fill:0.5})
       .vQuadAt(pdc.$x + 50, pdc.$y, -80, 45, 15, 80)
       .fill({stroke:true})
       .color(null);
    pdc.textAt(pdc.$x + 30, pdc.$y + 30, "xform\n(angle:-20)")
       .xform({x:pdc.$x + 10, y:pdc.$y - 100, angle:-20})
       .rectAt(0, 0, 50, 80)
       .stroke()
       .color({fill:0.8})
       .hQuadAt(pdc.$x, pdc.$y + 80, 50, 45, 15, 50)
       .fill({stroke:true})
       .color({fill:0.5})
       .vQuadAt(pdc.$x + 50, pdc.$y, -80, 45, 15, 80)
       .fill({stroke:true})
       .xform(null)
       .color(null)
       .lineStyle(null);

    //--- ellipse & even-odd fill
    pdc.textAt(35, pdc.$H - 280, "ellipse & even-odd fill")
       .color({fill:"#f88", stroke:"#523"})
       .ellipseAt(pdc.$x + 65, pdc.$y - 50, 60, 25)
       .ellipseAt(pdc.$x + 20, pdc.$y + 15, 60, 25)
       .ellipseAt(pdc.$x + 35, pdc.$y - 25, 60, 25)
       .fill({stroke:true, evenOdd:true})
       .color(null);

    //--- dash
    pdc.textAt(35, pdc.$H - 390, "dash")
       .lineStyle({dash:[2,2]})
       .hLineAt(pdc.$x, pdc.$y - 15, 180)
       .stroke()
       .lineStyle({dash:[6,3]})
       .hLineAt(pdc.$x, pdc.$y - 15, 180)
       .stroke()
       .lineStyle({dash:[8,3,2,3]})
       .hLineAt(pdc.$x, pdc.$y - 15, 180)
       .stroke()
       .lineStyle(null);

    //--- rounded react
    pdc.textAt(35, pdc.$y - 35, "rounded rect")
    pdc.rRectAt(pdc.$x, pdc.$y - 10, 160, -50, 10)
    pdc.rRectAt(pdc.$x + 25, pdc.$y - 20, 160, -50, 20, 30)
       .stroke()

    //--- arc
    pdc.textAt(pdc.$W * 0.32, pdc.$H - 60, "arc")
       .arcAt(pdc.$x, pdc.$y - 40, 5, -40, 40);
    for (let i = 0; i < 10; ++i) {
        pdc.arcAt(pdc.$x, pdc.$y, 5 + 5 * i, -40, 40);
    }
    pdc.stroke()
       .color({fill:"#F"})
       .arcAt(pdc.$x + 125, pdc.$y - 25, 58, 90, 100)
       .lineTo(pdc.$x, pdc.$y)
       .fill({stroke:true})
       .color({fill:"#F77"})
       .arcAt(pdc.$x, pdc.$y, 58, 100, 160)
       .lineTo(pdc.$x, pdc.$y)
       .fill({stroke:true})
       .color({fill:"#7F7"})
       .arcAt(pdc.$x, pdc.$y, 58, 160, -80)
       .lineTo(pdc.$x, pdc.$y)
       .fill({stroke:true})
       .color({fill:"#77F"})
       .arcAt(pdc.$x, pdc.$y, 58, -80, 90)
       .lineTo(pdc.$x, pdc.$y)
       .fill({stroke:true})
       .color(null);

    //--- reguler polygon
    pdc.textAt(pdc.$W * 0.6, pdc.$H - 60, "reguler polygon");
    let x = pdc.$x + 35, y = pdc.$y - 65;
    let r = 60;
    let phase = -90;
    for (let i = 0; i < 17; i++) {
        pdc.regPolygonAt(x, y, r, 7, phase);
        r -= 3;
        phase += 6;
    }
    pdc.stroke();

    //--- polygon & opacity
    pdc.textAt(pdc.$W * 0.74, pdc.$H - 60, "polygon & opacity");
    const ofs = [10, 30, 0, 60, 100, 60, 120, 30, 100, 0, 0, 0];
    pdc.color({fill:"#5040c0", stroke:"#8"})
       .alpha({fill:0.3})
       .polygonAt(pdc.$x, pdc.$y - 70, ofs)
       .fill({stroke:true})
       .color({fill:"#ff2080"})
       .polygonAt(pdc.$x + 40, pdc.$y - 20, ofs)
       .fill({stroke:true})
       .color({fill:"#70ff60"})
       .polygonAt(pdc.$x + 33, pdc.$y - 20, ofs)
       .fill({stroke:true})
       .color(null)
       .alpha(null);

    //--- image
    pdc.textAt(pdc.$W * 0.29, pdc.$H - 190, "image")
       .lineStyle({width:10, dash:[10, 10]})
       .color({stroke:0.5, fill:"#b0b0c0"})
       .rectAt(pdc.$x, pdc.$y - 15, 410, -170)
       .fill()
       .hLineAt(pdc.$x, pdc.$y - 5, 410);
    for (let i = 0; i < 8; ++i) {
       pdc.hLineAt(pdc.$x + 10, pdc.$y - 10, 390)
          .hLineAt(pdc.$x - 10, pdc.$y - 10, 410);
    }
    pdc.stroke()
       .color(null).alpha(null)
       .font("Courier", 9, null)
       .textAt(pdc.$x, pdc.$y - 14, "checker pattern by dash:[10,10]")
       .imageAt(pdc.$x + 20, pdc.$y + 15, img1, {width:160})
       .imageAt(pdc.$x + 180, pdc.$y + 70, img2, {width:130, angle:-30})
       .imageAt(pdc.$x - 20, pdc.$y - 85, img3, {width:70})
       .imageAt(pdc.$x + 165, pdc.$y + 10, img4, {width:60})
       .imageAt(pdc.$x - 310, pdc.$y + 175, img5, {width:40})
       .color(null).alpha(null)
       .lineStyle(null);

    //--- QR-H
    pdc.font("Times-Italic", 12, {narrow:0.8})
       .textAt(pdc.$W * 0.81, pdc.$H - 220, "QR Level-H")
       .code2dAt(pdc.$x, pdc.$y - 150, 130, "QRH"
           , "QR Code ISO IEC 18004 Standard Specification")
       .imageAt(pdc.$x + 48, pdc.$y + 50, img2, {width:33});

    //--- clipping
    pdc.textAt(pdc.$W * 0.29, pdc.$H - 415, "clipping")
       .beginClip({textMode:7})
       .font("Helvetica-Bold", 90, {leading:0.65, spacing:-0.1, narrow:0.8})
       .textAt(pdc.$x, pdc.$y - 75, "PDF\nCURSOR")
       .textAt(pdc.$x + 7, pdc.$y, pdc.$s)
       .font("Helvetica-Bold", 30)
       .textStyle({angle:20})
       .textAt(pdc.$x + 150, pdc.$y + 10, "WASM")
       .imageAt(pdc.$x - 170, pdc.$y - 70, img6, {width:300})
       .endClip();

    //--- shading
    pdc.font("Times-Italic", 12, {narrow:0.8})
       .textAt(pdc.$W * 0.63, pdc.$H - 400, "shading")
       .font("Courier", 11, {narrow:0.8})
       .rectAt(pdc.$x, pdc.$y - 10, 280, -150)
       .beginClip()
           .shadeAt(pdc.$x, pdc.$y - 150, shd1, {scaleX:280, scaleY:150})
           .textAt(pdc.$x + 10, pdc.$y + 15, "linear")
       .endClip()
       .textAt(pdc.$x + 10, 15, "radial")
       .alpha({fill:0.7})
       .shadeAt(pdc.$W, -110, shd2, {scaleX:210, scaleY:190});

    pdc.endPage();
}

function demo() {
    pdc.clearPages()
       .title("PDFCursor Demo")
       .subject("PDF rendering showcase")
       .author("nsoft.co.jp")
       .creator("javascript");
    page1();
    page2();
    const pdf = pdc.getBlob();
    const pdfurl = window.URL.createObjectURL(pdf);
    viewer.data = pdfurl;
    link.href = pdfurl;
}

demo();
