// 紅九九 Lite：左側第二棟，三層做完（1F 店面、2F 電商、3F 辦公室）加屋頂。
// 基地用 index.html 算好的約 2/3 足跡（P7_annex.box），跟日上昇大樓之間留車寬通道。純場景，不放角色、不碰後端。
// 顏色：品牌紅 #B53131（招牌、雨遮緣、旗、椅、燈線）、米白與淺木（牆、地、桌）、墨黑 #231815（角柱、門框、文字）。
// 招牌只寫純文字「紅九九Lite」，不是標誌、不加特效。菜單燈箱只寫品名。
// 外牆呼吸燈條在 lightstrip.js，跟主棟同一組時鐘（1F 不延後、2F 0.3 秒、3F 0.6 秒）。
// 截圖：?shot=lite 外觀、?shot=lite1 店面、?shot=lite2 電商、?shot=lite3 辦公室、?shot=literoof 屋頂。?shot=liteall 用首頁全景（人物凍結）。
export function initLiteBuilding(ctx) {
  const A = window.P7_annex;
  if (!A || !A.box || !A.floors) return;
  const { THREE, scene, SHOT, camera, controls, camPos, target } = ctx;
  const { x0, x1, z0, z1, cx, cz } = A.box, floors = A.floors;
  const bw = x1 - x0, bd = z1 - z0, H1 = floors[0].h, roofTop = floors[2].y + floors[2].h;
  const grp = new THREE.Group(); grp.name = 'LITE_HONG99'; scene.add(grp); A.grp = grp;
  const M = {
    red: new THREE.MeshLambertMaterial({ color: 0xB53131 }),
    ink: new THREE.MeshLambertMaterial({ color: 0x231815 }),
    cream: new THREE.MeshLambertMaterial({ color: 0xF6F1E8 }),
    cream2: new THREE.MeshLambertMaterial({ color: 0xE6DDD0 }),
    wood: new THREE.MeshLambertMaterial({ color: 0xE4C79A }),
    wood2: new THREE.MeshLambertMaterial({ color: 0xCFA56E }),
    wood3: new THREE.MeshLambertMaterial({ color: 0xF3E2C4 }),
    card: new THREE.MeshLambertMaterial({ color: 0xE8CBA4 }),
    card2: new THREE.MeshLambertMaterial({ color: 0xD7B48A }),
    plant: new THREE.MeshLambertMaterial({ color: 0x5E9A68 }),
    plant2: new THREE.MeshLambertMaterial({ color: 0x3F7D54 }),
    pot: new THREE.MeshLambertMaterial({ color: 0xF4EFE6 }),
    ceramic: new THREE.MeshLambertMaterial({ color: 0x6B5148 }),
    hvac: new THREE.MeshLambertMaterial({ color: 0xD9D3C8 }),
    seat: new THREE.MeshLambertMaterial({ color: 0xE7D9C8 })
  };
  const GL = new THREE.MeshStandardMaterial({ color: 0xD5EAF3, transparent: true, opacity: .12, roughness: .05, metalness: .04, depthWrite: false, side: THREE.DoubleSide });
  const REDL = new THREE.MeshStandardMaterial({ color: 0xB53131, emissive: 0xB53131, emissiveIntensity: .8, roughness: .4 });
  const WHTL = new THREE.MeshStandardMaterial({ color: 0xFFF6EC, emissive: 0xFFF1DE, emissiveIntensity: .65, roughness: .45 });
  const BROTH = new THREE.MeshStandardMaterial({ color: 0xB53131, emissive: 0x8E2424, emissiveIntensity: .35, roughness: .45 });
  const BULB = new THREE.MeshStandardMaterial({ color: 0xFFF3D8, emissive: 0xFFE2B0, emissiveIntensity: .7, roughness: .35 });
  const SCREEN = new THREE.MeshStandardMaterial({ color: 0x1A3048, emissive: 0x7EB4E0, emissiveIntensity: .85, roughness: .22 });
  const RING = new THREE.MeshStandardMaterial({ color: 0xFFE7C4, emissive: 0xFFD9A4, emissiveIntensity: .85, roughness: .3 });
  const CEIL = new THREE.MeshBasicMaterial({ color: 0xE6DDD0 });
  const STEAM = new THREE.MeshBasicMaterial({ color: 0xF7FBFD, transparent: true, opacity: .42, depthWrite: false });
  let _sd = 17; const rnd = () => (_sd = (_sd * 16807) % 2147483647) / 2147483647;
  const box = (w, h, d, x, y, z, mat, no) => {
    if (w < .02 || h < .02 || d < .02) return null;
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    o.position.set(x, y, z); o.castShadow = !no; o.receiveShadow = true; o.raycast = () => {}; grp.add(o); return o;
  };
  const cyl = (rt, rb, h, x, y, z, mat, seg) => {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 12), mat);
    o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; o.raycast = () => {}; grp.add(o); return o;
  };
  const ico = (r, x, y, z, mat) => {
    const o = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat);
    o.position.set(x, y, z); o.castShadow = true; o.raycast = () => {}; grp.add(o); return o;
  };
  const FONT = '"WenQuanYi Micro Hei", "Noto Sans TC", sans-serif';
  function label(text, opt) {
    const cw = opt.cw || 1024, ch = opt.ch || 256, cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    const g = cv.getContext('2d'); if (opt.bg) { g.fillStyle = opt.bg; g.fillRect(0, 0, cw, ch); } else g.clearRect(0, 0, cw, ch);
    if (opt.bar) { g.fillStyle = '#B53131'; g.fillRect(0, 0, cw, Math.round(ch * .14)); }
    g.fillStyle = opt.fg || '#231815'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let px = opt.px || Math.floor(ch * .62);
    const setF = () => { g.font = 'bold ' + px + 'px ' + FONT; };
    setF(); while (px > 24 && g.measureText(text).width > cw * .88) { px -= 4; setF(); }
    g.fillText(text, cw / 2, ch / 2 + (opt.bar ? ch * .04 : 0));
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const mat = opt.glow
      ? new THREE.MeshStandardMaterial({ map: tex, emissive: 0xFFF4E6, emissiveMap: tex, emissiveIntensity: .4, roughness: .55, color: 0xFFFFFF })
      : new THREE.MeshBasicMaterial({ map: tex, transparent: !opt.bg, depthWrite: false, color: 0xE4E4E4 });
    const o = new THREE.Mesh(new THREE.PlaneGeometry(opt.w, opt.h), mat);
    o.raycast = () => {}; o.castShadow = false; grp.add(o); return o;
  }
  // 沿 X 或沿 Z 的牆，開窗處放玻璃與淺木窗框。face：+1 代表外側在固定軸的正方向。
  function facade(axis, fixed, a0, a1, y0, y1, thick, openings, face) {
    const wall = (a, b, yb, yt) => {
      if (b - a < .04 || yt - yb < .04) return;
      if (axis === 'x') box(b - a, yt - yb, thick, (a + b) / 2, (yb + yt) / 2, fixed, M.cream);
      else box(thick, yt - yb, b - a, fixed, (yb + yt) / 2, (a + b) / 2, M.cream);
    };
    if (!openings.length) { wall(a0, a1, y0, y1); return; }
    const sill = Math.min.apply(null, openings.map(o => o.y0)), head = Math.max.apply(null, openings.map(o => o.y1));
    wall(a0, a1, y0, Math.min(sill, y1)); wall(a0, a1, Math.max(head, y0), y1);
    const ops = openings.slice().sort((p, q) => p.a0 - q.a0); let c = a0;
    ops.forEach(o => {
      wall(c, o.a0, sill, head);
      const gy = (o.y0 + o.y1) / 2, gh = o.y1 - o.y0 - .02, gw = o.a1 - o.a0 - .02;
      const glass = axis === 'x'
        ? box(gw, gh, .04, (o.a0 + o.a1) / 2, gy, fixed, GL, true)
        : box(.04, gh, gw, fixed, gy, (o.a0 + o.a1) / 2, GL, true);
      if (glass) glass.renderOrder = 2;
      const t = .055, proud = face * .05, fz = axis === 'x' ? fixed + proud : fixed, fx = axis === 'z' ? fixed + proud : fixed;
      const fm = o.ink ? M.ink : M.wood2;
      if (axis === 'x') {
        box(o.a1 - o.a0 + t, t, .045, (o.a0 + o.a1) / 2, o.y0 + t / 2, fz, fm, true);
        box(o.a1 - o.a0 + t, t, .045, (o.a0 + o.a1) / 2, o.y1 - t / 2, fz, fm, true);
        box(t, o.y1 - o.y0, .045, o.a0, gy, fz, fm, true);
        box(t, o.y1 - o.y0, .045, o.a1, gy, fz, fm, true);
      } else {
        box(.045, t, o.a1 - o.a0 + t, fx, o.y0 + t / 2, (o.a0 + o.a1) / 2, fm, true);
        box(.045, t, o.a1 - o.a0 + t, fx, o.y1 - t / 2, (o.a0 + o.a1) / 2, fm, true);
        box(.045, o.y1 - o.y0, t, fx, gy, o.a0, fm, true);
        box(.045, o.y1 - o.y0, t, fx, gy, o.a1, fm, true);
      }
      c = o.a1;
    });
    wall(c, a1, sill, head);
  }
  function rowWins(a0, a1, y0, y1, n, gap) {
    const w = (a1 - a0 - gap * (n + 1)) / n, out = [];
    for (let i = 0; i < n; i++) { const a = a0 + gap + i * (w + gap); out.push({ a0: a, a1: a + w, y0, y1 }); }
    return out;
  }
  function chair(x, z, gy, ry, red) {
    const g = new THREE.Group(); g.position.set(x, gy, z); g.rotation.y = ry || 0; grp.add(g);
    const seat = red ? M.red : M.seat, leg = red ? M.red : M.wood2;
    const add = (w, h, d, lx, ly, lz, mat) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(lx, ly, lz); o.castShadow = true; o.receiveShadow = true; o.raycast = () => {}; g.add(o); };
    add(.46, .07, .44, 0, .48, 0, seat); add(.46, .5, .06, 0, .78, -.2, seat);
    [[-.18, -.16], [.18, -.16], [-.18, .16], [.18, .16]].forEach(([a, b]) => add(.05, .48, .05, a, .24, b, leg));
  }
  function plant(x, z, gy, s) {
    s = s || 1; cyl(.16 * s, .13 * s, .28 * s, x, gy + .14 * s, z, M.pot, 10);
    ico(.32 * s, x, gy + .42 * s, z, M.plant); ico(.2 * s, x + .08 * s, gy + .62 * s, z, M.plant2);
  }
  const steams = [];
  function hotpot(x, z, gy) {
    cyl(.17, .145, .12, x, gy + .86, z, M.ceramic, 14);
    cyl(.135, .135, .03, x, gy + .925, z, BROTH, 14);
    box(.08, .03, .045, x - .2, gy + .88, z, M.ink, true); box(.08, .03, .045, x + .2, gy + .88, z, M.ink, true);
    cyl(.028, .028, .03, x + .04, gy + .95, z + .02, M.plant, 8);
    cyl(.022, .022, .025, x - .045, gy + .95, z - .02, M.wood3, 8);
    [0.18, 0.4, 0.64].forEach((h, i) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(.12 - i * .025, 8, 6), STEAM);
      s.position.set(x + (i - 1) * .03, gy + 1.02 + h, z); s.castShadow = false; s.raycast = () => {}; grp.add(s); steams.push(s);
    });
  }
  function table(x, z, gy) {
    box(.8, .07, .8, x, gy + .74, z, M.wood3);
    [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]].forEach(([a, b]) => box(.055, .7, .055, x + a, gy + .35, z + b, M.wood2));
  }
  // 軸向燈線：奇數段品牌紅、偶數段白。
  function runX(xa, xb, y, z) {
    const n = Math.max(2, Math.round(Math.abs(xb - xa) / 1.15)), seg = (xb - xa) / n;
    for (let i = 0; i < n; i++) box(Math.abs(seg) - .07, .07, .045, xa + (i + .5) * seg, y, z, i % 2 ? WHTL : REDL, true);
  }
  function runZ(za, zb, y, x) {
    const n = Math.max(2, Math.round(Math.abs(zb - za) / 1.15)), seg = (zb - za) / n;
    for (let i = 0; i < n; i++) box(.045, .07, Math.abs(seg) - .07, x, y, za + (i + .5) * seg, i % 2 ? WHTL : REDL, true);
  }

  // ---------- 樓板與外殼 ----------
  floors.forEach(f => {
    box(bw, .18, bd, cx, f.y + .09, cz, M.cream, true);
    box(bw - .55, .04, bd - .55, cx, f.y + .2, cz, M.wood, true);
    for (let z = z0 + 1.3; z < z1 - .7; z += 1.2) box(bw - .8, .008, .028, cx, f.y + .224, z, M.wood2, true);
    box(bw - .7, .03, bd - .7, cx, f.y + f.h - .08, cz, CEIL, true);
  });
  const PS = .44;
  [[x0, z0], [x0, z1], [x1, z0], [x1, z1]].forEach(([x, z]) => {
    box(PS, roofTop - .18, PS, x + (x < cx ? PS / 2 : -PS / 2), (roofTop + .18) / 2, z + (z < cz ? PS / 2 : -PS / 2), M.ink);
  });
  const glassTop = A.signY - .52;
  const doorW = 1.9, dL = cx - doorW / 2, dR = cx + doorW / 2;
  // 1F：前面整片玻璃門窗；側面各兩扇窗；後面實牆（廚房）
  facade('x', z1 - .08, x0 + .15, x1 - .15, .18, H1, .16, [
    { a0: x0 + .55, a1: dL - .06, y0: .24, y1: glassTop },
    { a0: dL, a1: dR, y0: .24, y1: glassTop - .02, ink: true },
    { a0: dR + .06, a1: x1 - .55, y0: .24, y1: glassTop }
  ], 1);
  // 玻璃門中梃與把手
  box(.055, glassTop - .3, .06, cx, (.24 + glassTop) / 2, z1 + .02, M.ink, true);
  box(.04, .18, .05, cx - .14, 1.15, z1 + .08, M.wood3, true);
  box(.04, .18, .05, cx + .14, 1.15, z1 + .08, M.wood3, true);
  const mullion = (xa, xb) => { for (let x = xa + 2.15; x < xb - .4; x += 2.15) box(.05, glassTop - .36, .05, x, (.3 + glassTop) / 2, z1 + .01, M.wood2, true); };
  mullion(x0 + .55, dL - .06); mullion(dR + .06, x1 - .55);
  facade('z', x0 + .08, z0 + .2, z1 - .2, .18, H1, .16, rowWins(z0 + .8, z1 - 1.6, .85, 2.7, 2, .7), -1);
  facade('z', x1 - .08, z0 + .2, z1 - .2, .18, H1, .16, rowWins(z0 + .8, z1 - 1.6, .85, 2.7, 2, .7), 1);
  facade('x', z0 + .08, x0 + .15, x1 - .15, .18, H1, .16, [], -1);
  // 2F、3F：四面開窗，前面窗較大，室內從外面看得進來
  floors.slice(1).forEach(f => {
    const y0 = f.y + .18, y1 = f.y + f.h, wy0 = f.y + .85, wy1 = f.y + f.h - .62;
    facade('x', z1 - .08, x0 + .15, x1 - .15, y0, y1, .16, rowWins(x0 + .45, x1 - .45, wy0, wy1, 4, .55), 1);
    facade('x', z0 + .08, x0 + .15, x1 - .15, y0, y1, .16, rowWins(x0 + .9, x1 - .9, wy0 + .15, wy1 - .1, 3, .8), -1);
    facade('z', x0 + .08, z0 + .25, z1 - .25, y0, y1, .16, rowWins(z0 + .7, z1 - .7, wy0, wy1, 3, .6), -1);
    facade('z', x1 - .08, z0 + .25, z1 - .25, y0, y1, .16, rowWins(z0 + .7, z1 - .7, wy0, wy1, 3, .6), 1);
  });
  // 招牌橫帶（純文字）＋淺木雨遮。紅帶比字寬，字只放中間。
  box(bw - 1.7, .9, .14, cx, A.signY, z1 + .04, M.red);
  const sign = label('紅九九Lite', { w: 6.6, h: .64, cw: 1400, ch: 200, fg: '#F6F1E8', px: 132 });
  sign.position.set(cx, A.signY, z1 + .12);
  box(bw - 1.35, .08, 1.5, cx, A.signY + .52, z1 + .58, M.wood3, true);
  box(bw - 1.35, .05, .08, cx, A.signY + .48, z1 + 1.28, M.red, true);
  // 1F、2F 頂各一條紅帶，標出樓層線；3F 頂交給屋頂紅壓頂
  [0, 1].forEach(i => { const top = floors[i].y + floors[i].h; box(bw - .7, .16, .05, cx, top - .16, z1 + .02, M.red, true); });

  // ---------- 屋頂：女兒牆、紅壓頂、機電箱、植栽、兩面素色紅旗 ----------
  const py = roofTop + .2;
  box(bw - .28, .2, bd - .28, cx, roofTop + .1, cz, M.cream, true); // 內縮，不蓋住 3F 燈條
  const inset = .28, ph = .7;
  box(bw - .36, ph, .16, cx, py + ph / 2, z1 - inset, M.cream);
  box(bw - .36, ph, .16, cx, py + ph / 2, z0 + inset, M.cream);
  box(.16, ph, bd - .7, x0 + inset, py + ph / 2, cz, M.cream);
  box(.16, ph, bd - .7, x1 - inset, py + ph / 2, cz, M.cream);
  const cope = py + ph + .04;
  box(bw - .28, .07, .24, cx, cope, z1 - inset, M.red, true);
  box(bw - .28, .07, .24, cx, cope, z0 + inset, M.red, true);
  box(.24, .07, bd - .55, x0 + inset, cope, cz, M.red, true);
  box(.24, .07, bd - .55, x1 - inset, cope, cz, M.red, true);
  box(2.5, 1.0, 1.45, cx - 5.5, py + .5, cz - 2.8, M.hvac);
  for (let i = 0; i < 4; i++) box(2.1, .035, .03, cx - 5.5, py + .28 + i * .2, cz - 2.8 + .74, M.ink, true);
  [[cx + 3.2, cz - 1.5, 1], [cx + 6.2, cz + 1.4, .85], [cx - 1.2, cz + 2.2, .95]].forEach(([x, z, s]) => {
    cyl(.34 * s, .28 * s, .4, x, py + .2, z, M.wood2, 10); ico(.48 * s, x, py + .62, z, M.plant); ico(.3 * s, x, py + .95, z, M.plant2);
  });
  [[x0 + 1.7, 1], [x1 - 1.7, -1]].forEach(([x, dir]) => {
    cyl(.03, .03, 1.55, x, py + .78, z1 - .85, M.ink, 8);
    box(.78, .42, .03, x + dir * .46, py + 1.32, z1 - .85, M.red, true);
  });

  // ---------- 1F 店面：一個人安靜用餐 ----------
  const g1 = .22;
  runZ(z0 + 1.5, z1 - 2.3, g1 + 1.6, x0 + .24); runZ(z0 + 1.5, z1 - 2.3, g1 + 2.55, x0 + .24);
  runZ(z0 + 1.5, z1 - 2.3, g1 + 1.6, x1 - .24); runZ(z0 + 1.5, z1 - 2.3, g1 + 2.55, x1 - .24);
  runX(cx - 6.2, cx + 6.2, g1 + 3.15, z0 + .22);
  // 後牆三個菜單燈箱，只寫品名
  ['個人湯鍋', '乾拌鍋', '滷味便當'].forEach((name, i) => {
    const x = cx + (i - 1) * 3.35;
    box(2.55, 1.12, .08, x, g1 + 2.05, z0 + .2, M.red, true);
    const m = label(name, { w: 2.35, h: .92, cw: 768, ch: 320, bg: '#FFF8F2', fg: '#231815', px: 148, glow: true });
    m.position.set(x, g1 + 2.05, z0 + .26);
  });
  // 後櫃（備餐），淺木
  box(12.5, .9, .62, cx, g1 + .45, z0 + .72, M.wood);
  box(12.6, .06, .7, cx, g1 + .93, z0 + .72, M.wood3);
  [[-4.2, M.ceramic], [-2.2, M.cream], [1.6, M.wood2], [3.4, M.pot]].forEach(([dx, mat], i) => {
    cyl(.1 - (i % 2) * .02, .08, .08, cx + dx, g1 + 1.0, z0 + .72, mat, 10);
  });
  // 兩組單人座，各一鍋熱氣
  [[cx - 3.7, cz + .55, cx - 3.7, cz + 1.3, Math.PI], [cx + 3.5, cz - .35, cx + 4.25, cz - .35, -Math.PI / 2]].forEach(([tx, tz, chx, chz, ry]) => {
    table(tx, tz, g1); chair(chx, chz, g1, ry, true); hotpot(tx, tz, g1);
    const cordTop = H1 - .25, by = g1 + 2.15;
    box(.02, cordTop - by, .02, tx, (cordTop + by) / 2, tz, M.ink, true);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.12, 14, 10), BULB); bulb.position.set(tx, by, tz); bulb.raycast = () => {}; grp.add(bulb);
  });
  // 靠窗單人吧台
  [[x0 + 1.35, cx - 1.85], [cx + 1.85, x1 - 1.35]].forEach(([a, b], side) => {
    const z = z1 - 1.2, mid = (a + b) / 2;
    box(b - a, .08, .42, mid, g1 + 1.02, z, M.wood3);
    box(b - a, .9, .08, mid, g1 + .45, z + .16, M.wood);
    const seats = [a + (b - a) * .28, a + (b - a) * .72];
    seats.forEach(x => chair(x, z - .55, g1, 0, true));
    if (!side) cyl(.09, .07, .05, seats[0], g1 + 1.08, z, M.cream, 10);
  });
  plant(x0 + 1.15, z0 + 1.7, g1, 1.05); plant(x1 - 1.3, cz + 1.2, g1, .9);
  box(1.25, .02, .7, cx, .165, z1 + .75, M.red, true); // 門口一小塊紅地墊
  plant(cx - 1.85, z1 + 1.15, .145, .8); plant(cx + 1.85, z1 + 1.15, .145, .8);
  const pl1 = new THREE.PointLight(0xFFF1DC, 4.5, 16, 1.6); pl1.position.set(cx - 1, g1 + 3.6, cz + .4); grp.add(pl1);
  const pl1b = new THREE.PointLight(0xFFF6EA, 3.2, 12, 1.8); pl1b.position.set(cx + 3, g1 + 2.8, z1 - 2.2); grp.add(pl1b);

  // ---------- 2F 電商：封箱桌、紙箱層架、小直播桌 ----------
  const g2 = floors[1].y + .22;
  function shelf(x, z, len, along) {
    const depth = .48, levels = 4;
    for (let i = 0; i < levels; i++) {
      const y = g2 + .32 + i * .48;
      if (along === 'z') box(depth, .045, len, x, y, z, M.wood2);
      else box(len, .045, depth, x, y, z, M.wood2);
      const n = Math.max(3, Math.round(len / .7));
      for (let j = 0; j < n; j++) {
        const bh = .14 + rnd() * .1, bw0 = .26 + rnd() * .1, u = (j + .5) / n - .5;
        const mat = rnd() > .5 ? M.card : M.card2;
        const px = along === 'z' ? x : x + u * (len - .25), pz = along === 'z' ? z + u * (len - .25) : z;
        if (along === 'z') box(.3, bh, bw0, px, y + .02 + bh / 2, pz, mat);
        else box(bw0, bh, .3, px, y + .02 + bh / 2, pz, mat);
        if (rnd() > .62) {
          if (along === 'z') box(.32, .025, bw0 * .55, px, y + .02 + bh * .55, pz, M.red, true);
          else box(bw0 * .55, .025, .32, px, y + .02 + bh * .55, pz, M.red, true);
        }
      }
    }
    if (along === 'z') { box(.06, 2.05, .06, x, g2 + 1.05, z - len / 2, M.wood2); box(.06, 2.05, .06, x, g2 + 1.05, z + len / 2, M.wood2); }
    else { box(.06, 2.05, .06, x - len / 2, g2 + 1.05, z, M.wood2); box(.06, 2.05, .06, x + len / 2, g2 + 1.05, z, M.wood2); }
  }
  shelf(x0 + .7, cz - .3, 8.2, 'z');
  shelf(cx + 3.6, z0 + .78, 6.4, 'x');
  function pack(x, z) {
    box(2.15, .08, 1.0, x, g2 + .78, z, M.wood3);
    [[-.95, -.4], [.95, -.4], [-.95, .4], [.95, .4]].forEach(([a, b]) => box(.06, .74, .06, x + a, g2 + .37, z + b, M.wood2));
    box(2.05, .62, .06, x, g2 + .34, z - .42, M.wood);
    box(.4, .26, .34, x - .55, g2 + .97, z + .05, M.card);
    const oy = g2 + .86;
    box(.48, .04, .36, x + .2, oy, z, M.card2);
    box(.48, .18, .03, x + .2, oy + .11, z + .17, M.card2); box(.48, .18, .03, x + .2, oy + .11, z - .17, M.card2);
    box(.03, .18, .36, x + .2 - .22, oy + .11, z, M.card2); box(.03, .18, .36, x + .2 + .22, oy + .11, z, M.card2);
    box(.28, .05, .18, x + .2, oy + .07, z, M.cream, true);
    const tape = new THREE.Mesh(new THREE.TorusGeometry(.08, .022, 8, 16), M.red); tape.rotation.x = Math.PI / 2; tape.position.set(x + .72, g2 + .9, z - .2); tape.raycast = () => {}; grp.add(tape);
  }
  pack(cx - 1.4, cz + 1.7); pack(cx - 1.4, cz - 1.5);
  chair(cx - 1.4, cz + 1.7 - .85, g2, 0, false);
  // 直播小桌：螢幕朝前、環形補光、一台小攝影機、兩只素色紙箱
  const lx = cx + 5.4, lz = cz + 1.9;
  box(1.7, .07, .72, lx, g2 + .78, lz, M.wood3);
  [[-.75, -.28], [.75, -.28], [-.75, .28], [.75, .28]].forEach(([a, b]) => box(.06, .74, .06, lx + a, g2 + .37, lz + b, M.wood2));
  box(.68, .4, .04, lx, g2 + 1.2, lz + .24, M.ink, true);
  box(.58, .3, .02, lx, g2 + 1.2, lz + .27, SCREEN, true);
  box(.08, .2, .06, lx, g2 + .92, lz + .2, M.ink, true);
  box(.34, .025, .12, lx, g2 + .83, lz - .02, M.ink, true);
  chair(lx, lz - .72, g2, 0, false);
  cyl(.02, .02, 1.25, lx + .95, g2 + .62, lz + .1, M.ink, 6);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.26, .032, 8, 22), RING); ring.position.set(lx + .95, g2 + 1.4, lz + .1); ring.raycast = () => {}; grp.add(ring);
  box(.16, .11, .12, lx - .82, g2 + 1.05, lz + .4, M.ink, true);
  cyl(.035, .04, .06, lx - .82, g2 + 1.05, lz + .48, SCREEN, 8);
  box(.2, .14, .16, lx + .38, g2 + .9, lz - .12, M.card); box(.15, .11, .13, lx - .32, g2 + .88, lz - .14, M.card2);
  const s2 = label('電商', { w: 1.7, h: .46, cw: 640, ch: 200, bg: '#F6F1E8', fg: '#231815', px: 120, bar: true });
  s2.position.set(cx - 2.2, g2 + 3.15, z0 + .2);
  const p2 = new THREE.PointLight(0xFFF4E2, 3.6, 16, 1.7); p2.position.set(cx, g2 + 3.5, cz); grp.add(p2);
  const p2b = new THREE.PointLight(0xFFF1DC, 2.4, 10, 1.8); p2b.position.set(lx, g2 + 2.4, lz + .4); grp.add(p2b);

  // ---------- 3F 辦公室：桌子與電腦 ----------
  const g3 = floors[2].y + .22;
  function desk(x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, g3, z); g.rotation.y = ry; grp.add(g);
    const add = (w, h, d, lx, ly, lz, mat) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(lx, ly, lz); o.castShadow = true; o.receiveShadow = true; o.raycast = () => {}; g.add(o); return o; };
    add(1.5, .07, .72, 0, .76, 0, M.wood3);
    [[-.66, -.28], [.66, -.28], [-.66, .28], [.66, .28]].forEach(([a, b]) => add(.06, .72, .06, a, .36, b, M.wood2));
    add(1.4, .55, .05, 0, .32, -.3, M.wood);
    add(.64, .38, .04, 0, 1.16, .26, M.ink); add(.54, .28, .02, 0, 1.16, .29, SCREEN); add(.07, .18, .05, 0, .9, .24, M.ink);
    add(.32, .022, .11, 0, .81, 0, M.ink);
    const dx = Math.sin(ry), dz = Math.cos(ry);
    chair(x - dx * .78, z - dz * .78, g3, ry, false);
  }
  desk(cx - 4.4, cz + 2.3, 0); desk(cx + 1.8, cz + 2.3, 0);
  desk(cx - 5.6, cz - 2.0, Math.PI / 2); desk(cx + 5.4, cz - 1.5, -Math.PI / 2);
  plant(cx + .2, cz - 3.6, g3, 1.1); plant(x1 - 1.4, cz + 3.2, g3, .85);
  const s3 = label('辦公室', { w: 2.15, h: .48, cw: 720, ch: 200, bg: '#F6F1E8', fg: '#231815', px: 112, bar: true });
  s3.position.set(cx, g3 + 3.15, z0 + .2);
  const p3 = new THREE.PointLight(0xFFF6EA, 3.6, 16, 1.7); p3.position.set(cx, g3 + 3.5, cz); grp.add(p3);
  const p3b = new THREE.PointLight(0xFFF1DC, 2.2, 11, 1.8); p3b.position.set(cx - 3, g3 + 2.6, cz + 1.5); grp.add(p3b);

  steams.forEach(s => { s.userData.baseY = s.position.y; });
  if (!SHOT) (function tick() { requestAnimationFrame(tick); const t = performance.now() / 1000; steams.forEach((s, i) => { s.position.y = s.userData.baseY + Math.sin(t * 1.25 + i) * .045; }); })();
  window.P7_lite = { ready: true, sign: '紅九九Lite', menus: ['個人湯鍋', '乾拌鍋', '滷味便當'], floors: ['1F', '2F', '3F'] };

  function aim(name, t, p, fov) {
    if (SHOT !== name || !camera) return;
    controls.minDistance = .3; controls.maxDistance = 300;
    // 方位角必須落在 ±π 裡面。超過 ±π 會被折返，鏡頭會被甩到樓的背面。
    controls.minAzimuthAngle = -2.6; controls.maxAzimuthAngle = 2.6;
    controls.minPolarAngle = .35; controls.maxPolarAngle = 1.75;
    camera.near = .12;
    if (fov) camera.fov = fov;
    camera.updateProjectionMatrix();
    target.set(t[0], t[1], t[2]); camPos.set(p[0], p[1], p[2]);
    camera.position.copy(camPos); controls.target.copy(target); controls.update();
  }
  const g2y = floors[1].y, g3y = floors[2].y;
  aim('lite', [cx, 6.6, cz], [cx + 13, 9.2, z1 + 22], 34);
  aim('lite1', [cx - .4, g1 + 1.35, cz - 1.2], [cx + .2, g1 + 1.65, 8.6], 50);
  aim('lite2', [cx + 2.6, g2y + 1.15, cz + .6], [cx - 1.6, g2y + 1.7, 8.0], 50);
  aim('lite3', [cx - 1.8, g3y + 1.15, cz + .2], [cx + 2.8, g3y + 1.65, 7.6], 48);
  aim('literoof', [cx, roofTop + 1.2, cz + .4], [cx + 1.5, roofTop + 11, z1 + 14], 52);
}
