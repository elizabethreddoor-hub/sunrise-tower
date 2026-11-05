// 預覽 ceo-office v0.1：加蓋 8F 總經理室（只是場景預覽，不碰後端、不動任何現有角色）。
// 風格：深色木紋＋金邊（參考高階主管樓層），與大樓其他樓層同一套金色 #C9A24E。
// 版面（寬 30、深 20；後方三間房 z -9.7..-0.9，前方是電梯走道與大廳，電梯井在 x = ±14.25、z = 0 保持淨空）：
//   左：總經理辦公室（大辦公桌、高背主位椅＝空位，不新增角色；整面書櫃、側面整面落地窗、小沙發、地毯）
//   中：高層會議室（橢圓會議桌 6 席＋後牆大螢幕，螢幕只有抽象圖形，沒有數字或文字）
//   右：三間玻璃小辦公室：COO Mira、CTO Nova、CFO（待定空位）；只放椅子當預留座位，角色仍在原樓層。
// 公開／團隊兩種樣子：一般訪客看到整層霧面玻璃＋一扇關著的木門（看不到裡面、沒有人）；團隊觀看（🔑）才看得到內裝。
//   截圖：?shot=f8&mock=live&team=1 看內裝，?shot=f8&mock=live 看公開霧面版。
export function initCeo8F(ctx) {
  const { THREE, scene, floorY, T, SHOT, camera, controls, camPos, target } = ctx, D = document;
  if (floorY['8F'] === undefined) return;
  const y0 = floorY['8F'] + T, FH = 4.68;
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const L = c => new THREE.MeshLambertMaterial({ color: c });
  const GLOW = (c, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k == null ? 1 : k), toneMapped: false });
  const INT = new THREE.Group(); INT.name = 'CEO_8F_internal'; scene.add(INT);
  const PUB = new THREE.Group(); PUB.name = 'CEO_8F_public'; scene.add(PUB);
  const mk = grp => (g, m, x, y, z, ry) => { const o = new THREE.Mesh(g, m); o.position.set(x, y0 + y, z); if (ry) o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; o.raycast = () => {}; grp.add(o); return o; };
  const add = mk(INT), pub0 = mk(PUB), pub = (...a) => { const o = pub0(...a); o.castShadow = false; o.receiveShadow = false; return o; }; // 公開霧面版不投影，避免陰影條紋
  const MT = { floor: L(0x3A2A1F), plank: L(0x2E2118), wall: L(0x3B271A), panel: L(0x4E3423), wood: L(0x5C3B24), woodD: L(0x2A1A10), gold: L(0xC9A24E), leather: L(0x2A1E18), leatherB: L(0x3A2A20),
    rug: L(0x5B2E2A), rugC: L(0x2D3A4A), runner: L(0x4A3426), cream: L(0xEDE3D2), plant: L(0x4F7F5A), pot: L(0x2A1A10), dark: L(0x15171C),
    rose: L(0xB76E79), blue: L(0x2F6FB3), amber: L(0xB8934A), book: [L(0xA8473F), L(0x4C79A8), L(0xB59A4F), L(0x5E9070), L(0xE8DCC2), L(0x8A5C8A)] };
  const GL = new THREE.MeshStandardMaterial({ color: 0xD8E4EA, transparent: true, opacity: .16, roughness: .1, depthWrite: false });
  const WARM = GLOW(0xFFE2B0, .95), SOFT = GLOW(0xFFF1DC, .8);
  const ZB = -9.7, ZF = -0.9, ZC = (ZB + ZF) / 2; // 房間後牆、前牆（玻璃）、中心
  // ---- 地板：深色木地板＋淡淡的木板縫；後牆深木牆板＋金色細條 ----
  add(B(29.4, .02, 19.4), MT.floor, 0, .02, 0);
  for (let z = -9.4; z < 9.8; z += .8) add(B(29.4, .006, .03), MT.plank, 0, .033, z).castShadow = false;
  add(B(29.4, 4.3, .06), MT.wall, 0, 2.17, -9.72);
  for (let x = -14.4; x <= 14.4; x += 2.4) add(B(.04, 4.3, .02), MT.gold, x, 2.17, -9.68).castShadow = false;
  // 前方走道：深色地毯＋金邊（兩側電梯口連到中間）
  add(B(27.2, .02, 1.5), MT.runner, 0, .04, 2.7); [-1, 1].forEach(s => add(B(27.2, .022, .06), MT.gold, 0, .045, 2.7 + s * .75));
  // ---- 隔間：x = ±5.4 深木牆＋金頂；前牆 z = -0.9 全玻璃＋金框（左右房間的門留在靠中間那側） ----
  [-1, 1].forEach(s => { add(B(.14, 3.4, ZF - ZB), MT.wood, s * 5.4, 1.7, ZC); add(B(.18, .06, ZF - ZB), MT.gold, s * 5.4, 3.43, ZC); });
  const glassWall = (x0, x1, doorAt, doorW) => { const segs = doorAt == null ? [[x0, x1]] : [[x0, doorAt - doorW / 2], [doorAt + doorW / 2, x1]];
    segs.forEach(([a, b]) => { if (b - a < .05) return; const m = (a + b) / 2; add(B(b - a, 3.3, .04), GL, m, 1.65, ZF).renderOrder = 2; add(B(b - a, .05, .08), MT.gold, m, .03, ZF); });
    add(B(x1 - x0, .1, .12), MT.gold, (x0 + x1) / 2, 3.32, ZF); [x0, x1].forEach(x => add(B(.08, 3.3, .1), MT.gold, x, 1.65, ZF));
    if (doorAt != null) [doorAt - doorW / 2, doorAt + doorW / 2].forEach(x => add(B(.08, 3.3, .1), MT.gold, x, 1.65, ZF)); };
  glassWall(-14.6, -5.4, -6.6, 1.3); glassWall(-5.4, 5.4, 0, 1.6);
  // 小名牌（金底深字，掛在玻璃門楣上）；只寫職稱與名字
  const plate = (txt, x, z, w, grp) => { const cv = D.createElement('canvas'); cv.width = 512; cv.height = 96; const g = cv.getContext('2d'); g.fillStyle = '#2A1A10'; g.fillRect(0, 0, 512, 96); g.strokeStyle = '#C9A24E'; g.lineWidth = 6; g.strokeRect(4, 4, 504, 88);
    g.fillStyle = '#E9C77B'; g.font = 'bold 50px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 256, 52);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 96 / 512), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false, color: 0xDDDDDD })); s.position.set(x, y0 + 2.95, z); s.raycast = () => {}; (grp || INT).add(s); return s; };

  // ===================== 左：總經理辦公室 =====================
  { const cx = -10, cz = -5.4;
    add(B(7.4, .02, 6.6), MT.rug, cx, .045, cz); [[0, 3.3, 7.4, .06], [0, -3.3, 7.4, .06]].forEach(e => add(B(e[2], .022, e[3]), MT.gold, cx, .05, cz + e[1])); [-1, 1].forEach(s => add(B(.06, .022, 6.6), MT.gold, cx + s * 3.7, .05, cz));
    // 整面書櫃（後牆）：深木＋金色層板，書用幾種低彩度顏色
    const bx0 = -13.9, bx1 = -6.1, bw = bx1 - bx0, bz = -9.42; add(B(bw, 3.1, .06), MT.woodD, (bx0 + bx1) / 2, 1.55, bz - .22); // 書櫃背板（書放在前面，不能被實心櫃體包住）
    let k = 0; for (let t = 0; t < 5; t++) { const sy = .25 + t * .6; add(B(bw - .1, .04, .52), MT.gold, (bx0 + bx1) / 2, sy, bz + .01);
      if (t === 4) break; for (let x = bx0 + .2; x < bx1 - .2;) { const w = .07 + ((k * 7) % 5) * .025, h = .32 + ((k * 13) % 4) * .05; if ((k * 11) % 9 === 0) { x += .35; k++; continue; } add(B(w, h, .32), MT.book[(k * 5 + t) % 6], x + w / 2, sy + .02 + h / 2, bz + .05).castShadow = false; x += w + .01; k++; } }
    [-1, 1].forEach(s => add(B(.08, 3.12, .54), MT.gold, (bx0 + bx1) / 2 + s * bw / 2, 1.56, bz + .01));
    // 大辦公桌：深木＋金邊、前方擋板；桌上一台螢幕、檯燈、文件匣
    const dz = -6.0; add(B(3.0, .08, 1.25), MT.wood, cx, .78, dz); add(B(3.04, .03, 1.29), MT.gold, cx, .735, dz);
    add(B(2.9, .7, .08), MT.woodD, cx, .38, dz + .58); [-1, 1].forEach(s => add(B(.5, .72, 1.1), MT.woodD, cx + s * 1.2, .37, dz));
    add(B(.8, .46, .04), MT.dark, cx + 1.0, 1.12, dz - .35); add(B(.74, .4, .01), GLOW(0x22344E, .9), cx + 1.0, 1.12, dz - .325).castShadow = false; add(B(.06, .3, .06), MT.dark, cx + 1.0, .95, dz - .38);
    add(new THREE.CylinderGeometry(.02, .02, .45, 6), MT.gold, cx - 1.15, 1.04, dz - .3); add(new THREE.ConeGeometry(.16, .16, 12, 1, true), WARM, cx - 1.15, 1.3, dz - .3).castShadow = false;
    add(B(.4, .06, .3), MT.leatherB, cx - .55, .85, dz + .1); add(B(.3, .08, .05), MT.gold, cx, .86, dz + .4);
    // 主位：高背皮椅（空位，面向前方 +z）
    const pz = dz - 1.05; add(B(.75, .14, .7), MT.leather, cx, .52, pz); add(B(.78, 1.2, .14), MT.leather, cx, 1.15, pz - .34); add(B(.82, .05, .18), MT.gold, cx, 1.77, pz - .34);
    [-1, 1].forEach(s => { add(B(.1, .25, .6), MT.leatherB, cx + s * .4, .72, pz); }); add(new THREE.CylinderGeometry(.05, .05, .4, 8), MT.gold, cx, .25, pz); add(new THREE.CylinderGeometry(.34, .34, .04, 5), MT.gold, cx, .03, pz);
    // 兩張客椅（面向桌子）
    [-.75, .75].forEach(dx => { const gz = dz + 1.35; add(B(.6, .1, .6), MT.leatherB, cx + dx, .48, gz); add(B(.6, .55, .1), MT.leatherB, cx + dx, .8, gz + .28); [-1, 1].forEach(s => add(B(.06, .48, .06), MT.gold, cx + dx + s * .26, .24, gz)); });
    // 窗邊小沙發＋茶几（側面整面落地窗就是窗景）
    add(B(.8, .42, 2.2), MT.leather, -13.75, .21, -3.0); add(B(.2, .55, 2.2), MT.leather, -14.1, .62, -3.0); [-1, 1].forEach(s => add(B(.8, .55, .18), MT.leather, -13.75, .4, -3.0 + s * 1.1));
    add(new THREE.CylinderGeometry(.42, .42, .05, 16), MT.gold, -12.65, .45, -3.0); add(new THREE.CylinderGeometry(.05, .05, .42, 6), MT.woodD, -12.65, .21, -3.0);
    add(new THREE.CylinderGeometry(.25, .2, .5, 10), MT.pot, -13.9, .25, -1.5); add(new THREE.IcosahedronGeometry(.5, 0), MT.plant, -13.9, 1.0, -1.5);
    add(new THREE.CylinderGeometry(.25, .2, .5, 10), MT.pot, -6.0, .25, -8.6); add(new THREE.IcosahedronGeometry(.5, 0), MT.plant, -6.0, 1.0, -8.6);
    // 吊燈＋暖光
    add(new THREE.CylinderGeometry(.015, .015, 1.0, 4), MT.gold, cx, 3.95, dz + .3); add(new THREE.CylinderGeometry(.5, .5, .06, 20), WARM, cx, 3.42, dz + .3).castShadow = false;
    const pl = new THREE.PointLight(0xFFDDB0, 6, 11, 1.4); pl.position.set(cx, y0 + 3.2, cz); INT.add(pl);
    const bl = new THREE.PointLight(0xFFE2B8, 5, 7, 1.4); bl.position.set(cx, y0 + 2.6, -7.6); INT.add(bl); // 書櫃補光
    plate('總經理室', -10, ZF + .04, 1.5);
  }

  // ===================== 中：高層會議室 =====================
  { const tz = -4.9;
    add(B(9.2, .02, 7.2), MT.rugC, 0, .045, -5.2); [[0, -1.6], [0, -8.8]].forEach(e => add(B(9.2, .022, .06), MT.gold, 0, .05, e[1])); [-1, 1].forEach(s => add(B(.06, .022, 7.2), MT.gold, s * 4.6, .05, -5.2));
    // 橢圓會議桌：深木桌面＋金色邊（壓扁的圓柱）、中間柱腳
    const top = add(new THREE.CylinderGeometry(1, 1, .08, 40), MT.wood, 0, .78, tz); top.scale.set(2.0, 1, .95);
    const rim = add(new THREE.CylinderGeometry(1, 1, .04, 40), MT.gold, 0, .73, tz); rim.scale.set(2.04, 1, .99);
    [-1, 1].forEach(s => { const leg = add(new THREE.CylinderGeometry(.18, .26, .7, 12), MT.woodD, s * .9, .36, tz); });
    // 6 席：長邊各 2、兩端各 1（皆面向桌子）
    const SEATS = [[-.85, tz - 1.35, 0], [.85, tz - 1.35, 0], [-.85, tz + 1.35, Math.PI], [.85, tz + 1.35, Math.PI], [-2.75, tz, Math.PI / 2], [2.75, tz, -Math.PI / 2]];
    SEATS.forEach(([x, z, ry]) => { const g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.y = ry; INT.add(g);
      const p = (geo, m, a, b, c) => { const o = new THREE.Mesh(geo, m); o.position.set(a, b, c); o.castShadow = true; o.raycast = () => {}; g.add(o); };
      p(B(.58, .12, .58), MT.leather, 0, .5, 0); p(B(.58, .75, .1), MT.leather, 0, .92, -.27); p(B(.6, .04, .12), MT.gold, 0, 1.31, -.27); p(new THREE.CylinderGeometry(.04, .04, .4, 6), MT.gold, 0, .25, 0); p(new THREE.CylinderGeometry(.3, .3, .04, 5), MT.gold, 0, .03, 0); });
    // 後牆大螢幕（抽象圖形：折線、長條、圓環；沒有數字、沒有文字）
    const cv = D.createElement('canvas'); cv.width = 512; cv.height = 256; const g = cv.getContext('2d'); g.fillStyle = '#0A0E16'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = 'rgba(201,162,78,.18)'; g.lineWidth = 1; for (let x = 0; x <= 512; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); } for (let y = 0; y <= 256; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
    let sd = 7; const R = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    g.strokeStyle = '#E9C77B'; g.lineWidth = 4; g.beginPath(); let v = 180; for (let x = 16; x <= 300; x += 12) { v = Math.max(40, Math.min(200, v - 6 + (R() - .45) * 24)); x > 16 ? g.lineTo(x, v) : g.moveTo(x, v); } g.stroke();
    for (let i = 0; i < 9; i++) { const h = 30 + R() * 90; g.fillStyle = i % 3 ? '#4FA37A' : '#5AA9FF'; g.fillRect(24 + i * 30, 240 - h, 18, h); }
    g.lineWidth = 12; [[56, '#C9A24E', .72], [36, '#4FA37A', .55], [18, '#5AA9FF', .85]].forEach(([r, col, f]) => { g.strokeStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.arc(410, 120, r, 0, 7); g.stroke(); g.strokeStyle = col; g.beginPath(); g.arc(410, 120, r, -1.57, -1.57 + f * 6.28); g.stroke(); });
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    add(B(4.8, 2.5, .08), MT.dark, 0, 2.05, -9.62); add(B(4.9, .05, .1), MT.gold, 0, 3.32, -9.6); add(B(4.9, .05, .1), MT.gold, 0, .78, -9.6);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.3), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false, color: 0xDDDDDD })); scr.position.set(0, y0 + 2.05, -9.57); scr.raycast = () => {}; INT.add(scr);
    // 長條吊燈＋暖光；角落植栽
    [-1, 1].forEach(s => add(new THREE.CylinderGeometry(.012, .012, .9, 4), MT.gold, s * 1.4, 4.0, tz)); add(B(3.2, .06, .14), WARM, 0, 3.55, tz).castShadow = false; add(B(3.3, .03, .2), MT.gold, 0, 3.6, tz);
    const pl = new THREE.PointLight(0xFFE6BE, 6, 10, 1.4); pl.position.set(0, y0 + 3.2, tz); INT.add(pl);
    [[-4.7, -9.0], [4.7, -9.0]].forEach(p => { add(new THREE.CylinderGeometry(.25, .2, .5, 10), MT.pot, p[0], .25, p[1]); add(new THREE.IcosahedronGeometry(.5, 0), MT.plant, p[0], 1.0, p[1]); });
    plate('高層會議室', 0, ZF + .04, 1.7);
  }

  // ===================== 右：三間玻璃小辦公室 =====================
  { const XS = [5.4, 8.47, 11.53, 14.6], ROOMS = [['COO · Mira', MT.rose], ['CTO · Nova', MT.blue], ['CFO · 待定', MT.amber]];
    // 房間之間的玻璃隔間（金框）
    [XS[1], XS[2]].forEach(x => { add(B(.04, 3.3, ZF - ZB), GL, x, 1.65, ZC).renderOrder = 2; add(B(.08, .1, ZF - ZB), MT.gold, x, 3.32, ZC); add(B(.08, .05, ZF - ZB), MT.gold, x, .03, ZC); });
    ROOMS.forEach(([name, acc], i) => { const x0 = XS[i], x1 = XS[i + 1], cx = (x0 + x1) / 2, w = x1 - x0;
      glassWall(x0, x1, x0 + .75, 1.0);
      add(B(w - .5, .02, 5.6), acc, cx, .045, -5.6); add(B(w - .5, .022, .05), MT.gold, cx, .05, -2.8); add(B(w - .5, .022, .05), MT.gold, cx, .05, -8.4);
      // 小書桌（面向前方）、螢幕、椅子（預留座位）、後牆矮櫃、植栽
      const dz = -5.8; add(B(1.7, .06, .75), MT.wood, cx, .76, dz); add(B(1.74, .025, .79), MT.gold, cx, .72, dz); [-1, 1].forEach(s => add(B(.06, .72, .7), MT.woodD, cx + s * .8, .36, dz)); add(B(1.6, .5, .05), MT.woodD, cx, .45, dz + .35);
      add(B(.62, .38, .03), MT.dark, cx, 1.06, dz - .22); add(B(.58, .34, .01), GLOW(0x22344E, .9), cx, 1.06, dz - .2).castShadow = false; add(B(.05, .22, .05), MT.dark, cx, .88, dz - .25);
      const pz = dz - .85; add(B(.58, .12, .55), acc, cx, .5, pz); add(B(.58, .8, .1), MT.leather, cx, .95, pz - .27); add(B(.6, .04, .12), MT.gold, cx, 1.37, pz - .27); add(new THREE.CylinderGeometry(.04, .04, .4, 6), MT.gold, cx, .25, pz); add(new THREE.CylinderGeometry(.28, .28, .04, 5), MT.gold, cx, .03, pz);
      add(B(w - .6, .9, .45), MT.woodD, cx, .45, -9.4); add(B(w - .58, .03, .47), MT.gold, cx, .915, -9.4);
      [[-.6, .25, MT.book[i]], [.1, .35, MT.cream], [.6, .18, MT.gold]].forEach(q => add(B(.3, q[1], .25), q[2], cx + q[0], .93 + q[1] / 2, -9.4));
      add(new THREE.CylinderGeometry(.18, .15, .4, 10), MT.pot, x1 - .45, .2, -1.4); add(new THREE.IcosahedronGeometry(.35, 0), MT.plant, x1 - .45, .75, -1.4);
      const pl = new THREE.PointLight(0xFFE6BE, 3, 6, 1.4); pl.position.set(cx, y0 + 3.2, -4.8); INT.add(pl);
      add(B(.9, .04, .9), WARM, cx, 4.2, -5.2).castShadow = false;
      plate(name, cx, ZF + .04, 1.6); });
  }
  // 前方大廳：兩組金邊植栽（靠前窗兩側，不擋視線）、一盞暖光
  [[-9, 8.6], [9, 8.6]].forEach(p => { add(new THREE.CylinderGeometry(.3, .24, .6, 10), MT.pot, p[0], .3, p[1]); add(new THREE.IcosahedronGeometry(.6, 0), MT.plant, p[0], 1.15, p[1]); add(new THREE.CylinderGeometry(.31, .31, .04, 10), MT.gold, p[0], .6, p[1]); });
  { const pl = new THREE.PointLight(0xFFE6BE, 4, 14, 1.4); pl.position.set(0, y0 + 3.4, 4); INT.add(pl); }

  // ===================== 公開樣子：整層霧面玻璃＋關著的木門 =====================
  { const FR = new THREE.MeshStandardMaterial({ color: 0xE4E1DA, transparent: true, opacity: .93, roughness: .6, depthWrite: true }), H = FH - T - .08;
    const fz = 9.6; pub(B(29.2, H, .04), FR, 0, H / 2, fz).renderOrder = 3;
    [-1, 1].forEach(s => pub(B(.04, H, 19.2), FR, s * 14.78, H / 2, 0));
    pub(B(29.2, .05, .06), MT.gold, 0, H - .02, fz + .03); pub(B(29.2, .05, .06), MT.gold, 0, .03, fz + .03);
    // 關著的雙開木門（深木＋金框＋金把手）與一盞門口暖燈
    // 門框只用金色細條（不再用整塊金板，避免跟霧面玻璃重疊閃爍）
    [-1, 1].forEach(s => pub(B(.1, 2.9, .1), MT.gold, s * 1.2, 1.45, fz + .1)); pub(B(2.5, .1, .1), MT.gold, 0, 2.9, fz + .1);
    const DW = new THREE.MeshBasicMaterial({ color: 0x3E2616 }), DW2 = new THREE.MeshBasicMaterial({ color: 0x5A3A22 }); // 門用不受光材質，夜景下仍看得出木色
    [-1, 1].forEach(s => { pub(B(1.12, 2.8, .08), DW, s * .575, 1.4, fz + .1); pub(B(.9, 2.4, .02), DW2, s * .575, 1.42, fz + .15);
      pub(B(.05, .5, .06), MT.gold, s * .1, 1.25, fz + .17); });
    [-1, 1].forEach(s => { pub(new THREE.CylinderGeometry(.09, .09, .3, 10), SOFT, s * 1.55, 2.45, fz + .14).castShadow = false; pub(B(.12, .04, .14), MT.gold, s * 1.55, 2.28, fz + .1); });
    plate('總經理室', 0, fz + .14, 1.1, PUB).position.y = y0 + 3.3;
  }
  const apply = on => { INT.visible = !!on; PUB.visible = !on; };
  apply(D.body.classList.contains('team'));
  const prev = window.P7_teamChanged; window.P7_teamChanged = on => { if (prev) prev(on); apply(on); };
  window.P7_ceo8f = { internal: () => INT.visible };
  // 截圖機位：f8＝8F 正面全層；f8l＝近看左側總經理辦公室；f8r＝近看右側三間小辦公室
  const set = (t, p) => { controls.minDistance = 1; target.copy(t); camPos.copy(p); camera.position.copy(p); controls.target.copy(t); };
  const sync = f => D.querySelectorAll('#fbar button').forEach(x => x.classList.toggle('on', x.dataset.f === f));
  if (SHOT === 'f8') { sync('8F'); set(new THREE.Vector3(0, y0 + 1.6, -4), new THREE.Vector3(0, y0 + 3.2, 35)); }
  if (SHOT === 'f8l') { sync('8F'); set(new THREE.Vector3(-10, y0 + 1.2, -6.6), new THREE.Vector3(-6.8, y0 + 3.9, 3.2)); }
  if (SHOT === 'f8r') { sync('8F'); set(new THREE.Vector3(10, y0 + 1.1, -6), new THREE.Vector3(9, y0 + 3.6, 7.5)); }
}
