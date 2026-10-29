// 預覽 floors-6-7 v0.1：加蓋 6F 網紅間、7F 戰情室（公開名稱只用「戰情室」）。純場景，不碰後端與心跳。
// 6F：左右各一間直播間（左＝Mira、右＝Nova；環形補光燈、三腳架攝影機、商品小桌、商品層架、背景板），
//     中間是小會議廳（本層會議桌 6 張椅子，作息表「開會」就坐這裡），電梯出來沿前方走道（z 2.7）可走到中間。
// 7F：深色房間，上下雙排電腦螢幕（每個工作站 3＋3），後排墊高，後牆大螢幕牆兩排；螢幕只有抽象折線、長條、圓環、點陣，
//     沒有任何數字或文字。目前沒人進駐，只留空椅子。
// 座標與 index.html 一致：寬 30、深 20、樓高 4.68；電梯井在 x = ±14.25、z = 0。站位與會議椅座標在 index.html 的 STATION / MCH6。
export function initFloors67(ctx) {
  const { THREE, scene, floorY, T, SHOT, Q, camera, controls, camPos, target } = ctx, D = document;
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const L = c => new THREE.MeshLambertMaterial({ color: c });
  const GLOW = (c, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k == null ? 1 : k), toneMapped: false });
  const set = (t, p) => { controls.minDistance = 1; target.copy(t); camPos.copy(p); camera.position.copy(p); controls.target.copy(t); };
  const sync = f => D.querySelectorAll('#fbar button').forEach(x => x.classList.toggle('on', x.dataset.f === f));

  // ===================== 6F 網紅間 =====================
  if (floorY['6F'] !== undefined) {
    const y0 = floorY['6F'] + T, grp = new THREE.Group(); grp.name = 'LIVE_6F'; scene.add(grp);
    const add = (g, m, x, y, z, ry) => { const o = new THREE.Mesh(g, m); o.position.set(x, y0 + y, z); if (ry) o.rotation.y = ry; o.castShadow = true; o.receiveShadow = true; o.raycast = () => {}; grp.add(o); return o; };
    const MT = { white: L(0xF4F6F9), gold: L(0xC9A24E), blue: L(0x2F6FB3), orange: L(0xF08A24), floor: L(0xEDE6DD), runner: L(0xC9BBA8), dark: L(0x22262E), wood: L(0xD9B98C), seat: L(0x6FA6DA), seatO: L(0xF08A24), plant: L(0x5E9E6A), pot: L(0xF4F6F9),
      roseBg: L(0xE7A9B5), roseLt: L(0xF6E3E6), roseDeep: L(0xB76E79), blueBg: L(0x2F6FB3), blueLt: L(0xDCE7F3), blueDeep: L(0x1F4E85), rugM: L(0x4A8FD0) };
    const GL = new THREE.MeshStandardMaterial({ color: 0xCFE0E6, transparent: true, opacity: .18, roughness: .15, depthWrite: false });
    const RING = GLOW(0xFFF6E8, .92), SOFT = GLOW(0xFFF1DC, .8), ONAIR = GLOW(0xF08A24, .9), LENS = GLOW(0x5AA9FF, .6);
    add(B(29.4, .02, 19.4), MT.floor, 0, .02, 0);
    // 前方走道：兩側電梯口到中間，一條淺暖灰地毯＋金邊
    add(B(27.2, .02, 1.5), MT.runner, 0, .035, 2.7); [-1, 1].forEach(s => add(B(27.2, .022, .06), MT.gold, 0, .04, 2.7 + s * .75));
    // 兩間直播間（s = -1 左 Mira、+1 右 Nova）
    [-1, 1].forEach(s => { const cx = s * 8.8, F = s < 0 ? { lt: MT.roseLt, bg: MT.roseBg, deep: MT.roseDeep } : { lt: MT.blueLt, bg: MT.blueBg, deep: MT.blueDeep };
      add(B(7.3, .02, 10.6), F.lt, s * 8.8, .04, -4.6); // 房間地毯
      // 隔間：內側（與中間會議廳之間）x = ±5.0；外側 x = ±12.6 到電梯前停住
      add(B(.12, 3.3, 10.8), MT.white, s * 5.0, 1.65, -4.4); add(B(.14, .06, 10.8), MT.gold, s * 5.0, 3.32, -4.4);
      add(B(.12, 3.3, 8.6), MT.white, s * 12.6, 1.65, -5.5); add(B(.14, .06, 8.6), MT.gold, s * 12.6, 3.32, -5.5);
      // 前面玻璃隔間（中間留門，對齊站位走道 x = ±10.6），上方金色門楣＋一盞直播中燈（只發光，沒有字）
      const gx0 = s * 5.06, gx1 = s * 9.85, gx2 = s * 11.35, gx3 = s * 12.54;
      [[gx0, gx1], [gx2, gx3]].forEach(([a, b]) => { const w = Math.abs(b - a), m = (a + b) / 2; add(B(w, 3.2, .04), GL, m, 1.6, 1.0).renderOrder = 2; add(B(w, .05, .08), MT.gold, m, .03, 1.0); });
      add(B(7.6, .12, .14), MT.gold, s * 8.8, 3.28, 1.0); [gx1, gx2].forEach(x => add(B(.08, 3.2, .1), MT.gold, x, 1.6, 1.0));
      add(B(.5, .22, .1), MT.dark, s * 10.6, 2.95, 1.05); add(B(.36, .12, .04), ONAIR, s * 10.6, 2.95, 1.12);
      // 背景板（Mira 玫瑰粉、Nova 品牌藍）＋金框＋幾何裝飾
      add(B(4.8, 2.9, .12), F.bg, cx, 1.55, -6.2); [[0, 1.47, 4.96, .08], [0, -1.47 + .05, 4.96, .08]].forEach(e => add(B(e[2], e[3], .14), MT.gold, cx + e[0], 1.55 + e[1], -6.18)); [-1, 1].forEach(d => add(B(.08, 2.96, .14), MT.gold, cx + d * 2.44, 1.55, -6.18));
      if (s < 0) { [[-1.2, 2.1, .55], [1.3, 1.1, .4], [.2, 2.45, .25]].forEach(c => { const o = add(new THREE.CircleGeometry(c[2], 28), c[2] > .3 ? F.lt : MT.gold, cx + c[0], c[1], -6.13); o.castShadow = false; }); }
      else { [-1.6, -1.1, 1.1, 1.6].forEach(dx => add(B(.14, 2.5, .03), F.lt, cx + dx, 1.5, -6.13)); add(B(1.6, .06, .03), MT.gold, cx, 2.55, -6.12); }
      // 主播椅（站位 x = cx、z = -4.4，面向鏡頭）與商品小桌（z = -3.4）
      add(B(.6, .45, .6), MT.dark, cx, .23, -4.4); add(B(.6, .7, .12), MT.dark, cx, .8, -4.7);
      add(B(1.9, .06, .8), MT.white, cx, .78, -3.4); add(B(1.9, .7, .05), F.bg, cx, .4, -3.02); add(B(1.94, .03, .05), MT.gold, cx, .76, -3.0);
      [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(o => add(B(.05, .75, .05), MT.gold, cx + o[0] * .88, .375, -3.4 + o[1] * .33));
      [[-.6, .14, MT.orange], [-.25, .2, MT.blue], [.5, .12, MT.gold]].forEach(q => add(B(.26, q[1], .2), q[2], cx + q[0], .81 + q[1] / 2, -3.3));
      add(new THREE.CylinderGeometry(.06, .06, .28, 10), F.deep, cx + .15, .95, -3.25); add(new THREE.CylinderGeometry(.05, .05, .22, 10), MT.white, cx + .8, .92, -3.3);
      // 環形補光燈（內側）＋三腳架攝影機（外側），都朝向主播
      const rx = cx - s * 1.2, rz = -1.9; add(new THREE.CylinderGeometry(.025, .025, 1.5, 6), MT.dark, rx, .75, rz);
      [0, 2.1, 4.2].forEach(a => { const l = add(B(.03, .03, .45), MT.dark, rx + Math.sin(a) * .18, .05, rz + Math.cos(a) * .18); l.rotation.y = a; });
      const ring = add(new THREE.TorusGeometry(.42, .045, 8, 32), RING, rx, 1.62, rz); ring.lookAt(cx, y0 + 1.4, -4.4); ring.castShadow = false;
      const tx = cx + s * .95, tz = -1.6; [0, 2.1, 4.2].forEach(a => { const l = add(new THREE.CylinderGeometry(.018, .018, 1.35, 5), MT.dark, tx + Math.sin(a) * .2, .65, tz + Math.cos(a) * .2); l.rotation.set(Math.cos(a) * -.17, 0, Math.sin(a) * .17); });
      const cam = add(B(.34, .22, .22), MT.dark, tx, 1.38, tz); cam.lookAt(cx, y0 + 1.3, -4.4); const lens = add(new THREE.CylinderGeometry(.07, .08, .14, 12), LENS, tx, 1.38, tz); lens.lookAt(cx, y0 + 1.3, -4.4); lens.rotateX(Math.PI / 2); lens.translateY(.16);
      // 商品層架（外側牆，3 層彩色盒子）
      const shx = s * 12.25; add(B(.5, 2.2, 4.4), MT.white, shx, 1.1, -5.2); let k = 0;
      for (let t = 0; t < 3; t++) { add(B(.54, .04, 4.44), MT.gold, shx, .5 + t * .62, -5.2); for (let z = -7.1; z < -3.3; z += .42) { const c = [MT.orange, MT.blue, F.bg, MT.gold, F.deep][(k++ * 7 + t) % 5], h = .2 + ((k * 13) % 5) * .04; add(B(.32, h, .3), c, shx - s * .02, .52 + t * .62 + h / 2, z); } }
      // 柔光箱（背景板旁）＋房間暖光
      const sbx = cx - s * 3.0; add(new THREE.CylinderGeometry(.025, .025, 1.9, 6), MT.dark, sbx, .95, -5.2); const sb = add(B(.7, .55, .08), SOFT, sbx, 2.0, -5.2); sb.lookAt(cx, y0 + 1.4, -4.2); sb.castShadow = false;
      const pl = new THREE.PointLight(s < 0 ? 0xFFE2E6 : 0xE6F0FF, 4, 9, 1.4); pl.position.set(cx, y0 + 3.1, -2.6); grp.add(pl);
    });
    // 中間小會議廳（x -4.9..4.9）：藍地毯＋金邊、會議桌（中心 0,-3）、6 張椅子（座標同 index.html MCH6）、兩張小沙發、吊燈、植栽、後牆主視覺
    add(B(8.6, .02, 9.4), MT.rugM, 0, .045, -4.9);
    [[0, -.2, 8.6, .06], [0, -9.6, 8.6, .06]].forEach(e => add(B(e[2], .022, e[3]), MT.gold, e[0], .05, e[1])); [-1, 1].forEach(s => add(B(.06, .022, 9.4), MT.gold, s * 4.3, .05, -4.9));
    add(B(3.4, .07, 1.3), MT.white, 0, .76, -3); add(B(3.44, .03, 1.34), MT.gold, 0, .73, -3); add(B(2.4, .72, .3), MT.blue, 0, .36, -3);
    const CH = [[-1.2, -4.1], [0, -4.1], [1.2, -4.1], [-1.2, -1.9], [0, -1.9], [1.2, -1.9]];
    CH.forEach((c, i) => { const f = c[1] < -3 ? -1 : 1; add(B(.5, .45, .5), i % 2 ? MT.seatO : MT.seat, c[0], .23, c[1]); add(B(.5, .55, .1), i % 2 ? MT.seatO : MT.seat, c[0], .72, c[1] + f * .25); });
    [-1, 1].forEach(s => { add(B(.8, .42, 2.2), MT.seat, s * 3.85, .21, -7.4); add(B(.2, .5, 2.2), MT.seat, s * 4.2, .6, -7.4); add(new THREE.CylinderGeometry(.35, .35, .05, 12), MT.gold, s * 2.9, .5, -7.4); add(new THREE.CylinderGeometry(.04, .04, .5, 6), MT.gold, s * 2.9, .25, -7.4); });
    [-1.2, 0, 1.2].forEach(x => { add(new THREE.CylinderGeometry(.015, .015, 1.1, 4), MT.gold, x, 3.95, -3); const sh = add(new THREE.ConeGeometry(.32, .26, 12, 1, true), SOFT, x, 3.3, -3); sh.castShadow = false; });
    const pl = new THREE.PointLight(0xFFF1DC, 4, 10, 1.4); pl.position.set(0, y0 + 3.2, -3); grp.add(pl);
    [[-4.4, .4], [4.4, .4], [-4.4, -9.2], [4.4, -9.2]].forEach(p => { add(new THREE.CylinderGeometry(.25, .2, .5, 10), MT.pot, p[0], .25, p[1]); add(new THREE.IcosahedronGeometry(.5, 0), MT.plant, p[0], 1.0, p[1]); });
    // 後牆主視覺：白底金框板，上面一個抽象的「雙圓」（左粉右藍，代表兩間直播間）＋招牌「網紅間」
    add(B(6.4, 2.4, .1), MT.white, 0, 2.0, -9.72); add(B(6.56, .06, .12), MT.gold, 0, 3.22, -9.7); add(B(6.56, .06, .12), MT.gold, 0, .8, -9.7);
    add(new THREE.CircleGeometry(.62, 32), MT.roseBg, -.55, 2.0, -9.66).castShadow = false; add(new THREE.CircleGeometry(.62, 32), MT.blueBg, .55, 2.0, -9.65).castShadow = false;
    { const cv = D.createElement('canvas'); cv.width = 512; cv.height = 96; const g = cv.getContext('2d'); g.fillStyle = '#2F6FB3'; g.fillRect(0, 0, 512, 96); g.fillStyle = '#E9C77B'; g.font = 'bold 56px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('網紅間', 256, 50);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Mesh(new THREE.PlaneGeometry(2.4, .45), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false, color: 0xDDDDDD })); s.position.set(0, y0 + 3.6, -9.65); s.raycast = () => {}; grp.add(s); }
  }

  // ===================== 7F 戰情室 =====================
  const SCR = [];
  if (floorY['7F'] !== undefined) {
    const y0 = floorY['7F'] + T, grp = new THREE.Group(); grp.name = 'WARROOM_7F'; scene.add(grp);
    const add = (g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x, y0 + y, z); o.castShadow = true; o.receiveShadow = true; o.raycast = () => {}; grp.add(o); return o; };
    const DK = { floor: L(0x121826), wall: L(0x0B0F18), desk: L(0x2E3A4E), deskTop: L(0x44526A), chair: L(0x343E52), seat: L(0x2F6FB3), frame: L(0x0A0D13), plat: L(0x161C28), gold: L(0xC9A24E) };
    const EDGE = GLOW(0x2AD1C9, .75), EDGE2 = GLOW(0x2F6FB3, .9);
    add(B(29.4, .02, 19.4), DK.floor, 0, .02, 0); add(B(29.4, 4.4, .06), DK.wall, 0, 2.2, -9.74);
    [-1, 1].forEach(s => { add(B(.04, 4.4, 19.2), DK.wall, s * 14.86, 2.2, 0); });
    // 抽象螢幕畫面（沒有數字、沒有文字）：0 折線、1 長條、2 圓環＋放射、3 點陣地圖感
    const mkTex = k => { const c = D.createElement('canvas'); c.width = 256; c.height = 160; const g = c.getContext('2d'); g.fillStyle = '#06101C'; g.fillRect(0, 0, 256, 160);
      g.strokeStyle = 'rgba(90,169,255,.18)'; g.lineWidth = 1; for (let x = 0; x <= 256; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 160); g.stroke(); } for (let y = 0; y <= 160; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
      let sd = 11 + k * 7; const R = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      if (k === 0) { [['#2AD1C9', 3], ['#C9A24E', 2], ['#4FA37A', 2]].forEach(([col, w], j) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); let v = 60 + j * 30; for (let x = 0; x <= 256; x += 8) { v += (R() - .5) * 22; v = Math.max(18, Math.min(142, v)); const yy = x === 256 ? 60 + j * 30 : v; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }); }
      if (k === 1) { for (let x = 6; x < 256; x += 12) { const h = 20 + R() * 110, up = R() > .45; g.fillStyle = up ? '#4FA37A' : '#5AA9FF'; g.fillRect(x, 150 - h, 7, h); } g.strokeStyle = '#C9A24E'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= 256; x += 16) { const yy = 70 + Math.sin(x / 30) * 30; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
      if (k === 2) { g.lineWidth = 6; [[48, '#2AD1C9', .7], [34, '#C9A24E', .45], [20, '#4FA37A', .85]].forEach(([r, col, f]) => { g.strokeStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.arc(80, 80, r, 0, 7); g.stroke(); g.strokeStyle = col; g.beginPath(); g.arc(80, 80, r, -1.57, -1.57 + f * 6.28); g.stroke(); });
        g.strokeStyle = '#5AA9FF'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(150, 30 + i * 20); g.lineTo(150 + 30 + R() * 70, 30 + i * 20); g.stroke(); } }
      if (k === 3) { for (let i = 0; i < 160; i++) { const x = 10 + R() * 236, y = 12 + R() * 136, d = Math.hypot(x - 128, (y - 80) * 1.6); if (d > 110 && R() > .2) continue; g.fillStyle = R() > .85 ? '#C9A24E' : 'rgba(42,209,201,.75)'; g.fillRect(x, y, 3, 3); }
        g.strokeStyle = 'rgba(201,162,78,.8)'; g.lineWidth = 1.5; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(40 + R() * 60, 40 + R() * 80); g.quadraticCurveTo(128, 10, 160 + R() * 70, 40 + R() * 80); g.stroke(); } }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (k === 0 || k === 1) { t.wrapS = THREE.RepeatWrapping; } return t; };
    const TEX = [0, 1, 2, 3].map(mkTex), SM = TEX.map(t => new THREE.MeshBasicMaterial({ map: t, toneMapped: false, color: 0xE0E0E0 }));
    const lists = [[], [], [], []], frames = [];
    const screen = (w, h, x, y, z, ry, k) => { lists[k].push({ w, h, x, y, z, ry }); frames.push({ w: w + .05, h: h + .05, x, y, z, ry }); };
    // 後牆大螢幕牆：上下兩排各 7 面
    for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) screen(1.85, 1.0, -11.4 + i * 3.8, 2.75 + r * 1.1, -9.66, 0, (i + r * 3) % 4);
    // 工作站：三排，面向後牆（人背對鏡頭坐，螢幕朝鏡頭方向），後排墊高；每站上下兩排各 3 面螢幕（左右兩面略向內轉）
    const ROWS = [{ z: -6.6, h: .5 }, { z: -3.4, h: .25 }, { z: -.2, h: 0 }], XS = [-10, -5, 0, 5, 10];
    ROWS.forEach((R, ri) => { if (R.h) { add(B(25, R.h, 2.9), DK.plat, 0, R.h / 2, R.z + .45); add(B(25, .02, .04), EDGE2, 0, R.h + .01, R.z + 1.88); }
      XS.forEach((x, xi) => { const by = R.h; add(B(4.1, .06, .85), DK.deskTop, x, by + .76, R.z); add(B(4.1, .7, .06), DK.desk, x, by + .37, R.z - .4); [-1, 1].forEach(s => add(B(.06, .74, .8), DK.desk, x + s * 2.0, by + .37, R.z));
        add(B(4.1, .015, .02), EDGE, x, by + .79, R.z + .43);
        [-1, 0, 1].forEach(c => { const ry = c * -.28, sx = x + c * 1.24, sz = R.z - .2 + Math.abs(c) * .14; [0, 1].forEach(row => screen(1.18, .66, sx, by + 1.2 + row * .72, sz, ry, (xi + ri + c + 1 + row * 2) % 4)); });
        add(B(.08, 1.4, .08), DK.frame, x, by + 1.5, R.z - .32); add(B(.5, .03, .22), DK.frame, x, by + .8, R.z + .1);
        // 空椅子（沒人進駐）
        [-1.1, 1.1].forEach(dx => { const cx = x + dx, cz = R.z + .95; add(B(.55, .1, .55), DK.chair, cx, by + .48, cz); add(B(.55, .66, .08), DK.chair, cx, by + .86, cz + .26); add(B(.5, .03, .5), DK.seat, cx, by + .54, cz); add(new THREE.CylinderGeometry(.04, .04, .4, 6), DK.frame, cx, by + .22, cz); add(new THREE.CylinderGeometry(.28, .28, .04, 5), DK.frame, cx, by + .03, cz); }); }); });
    // 合併成 instanced：每種畫面一組、外框一組
    const o3 = new THREE.Object3D(), pg = new THREE.PlaneGeometry(1, 1);
    lists.forEach((li, k) => { const im = new THREE.InstancedMesh(pg, SM[k], li.length); li.forEach((s, i) => { o3.position.set(s.x, y0 + s.y, s.z + .03 * Math.cos(s.ry)); o3.rotation.set(0, s.ry, 0); o3.scale.set(s.w, s.h, 1); o3.updateMatrix(); im.setMatrixAt(i, o3.matrix); }); im.raycast = () => {}; im.name = 'WAR_SCREENS_' + k; grp.add(im); SCR.push(im); });
    { const im = new THREE.InstancedMesh(B(1, 1, .05), DK.frame, frames.length); frames.forEach((s, i) => { o3.position.set(s.x, y0 + s.y, s.z); o3.rotation.set(0, s.ry, 0); o3.scale.set(s.w, s.h, 1); o3.updateMatrix(); im.setMatrixAt(i, o3.matrix); }); im.castShadow = true; im.raycast = () => {}; grp.add(im); }
    // 招牌「戰情室」（後牆螢幕牆上方，小字）＋幾盞低亮度藍光
    { const cv = D.createElement('canvas'); cv.width = 512; cv.height = 96; const g = cv.getContext('2d'); g.fillStyle = '#0B0F18'; g.fillRect(0, 0, 512, 96); g.fillStyle = '#2AD1C9'; g.font = 'bold 54px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('戰情室', 256, 50);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Mesh(new THREE.PlaneGeometry(2.0, .38), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false, color: 0xCCCCCC })); s.position.set(0, y0 + 1.95, -9.68); s.raycast = () => {}; grp.add(s); }
    [-8, 0, 8].forEach(x => { const l = new THREE.PointLight(0x5A8FE0, 6, 14, 1.4); l.position.set(x, y0 + 3.6, -1); grp.add(l); });
    // 折線、長條畫面慢慢往左捲動（截圖時不動）
    if (!SHOT) { let lt = performance.now(); (function tick() { requestAnimationFrame(tick); const n = performance.now(), dt = (n - lt) / 1000; lt = n; TEX[0].offset.x += dt * .03; TEX[1].offset.x += dt * .015; })(); }
  }
  window.P7_floors67 = { screens: SCR.reduce((a, m) => a + m.count, 0) };
  if (SHOT === 'f6' && floorY['6F'] !== undefined) { const y = floorY['6F'] + T; sync('6F'); set(new THREE.Vector3(0, y + 1.9, -2), new THREE.Vector3(3.2, y + 4.2, 37)); }
  if (SHOT === 'f6l' && floorY['6F'] !== undefined) { const y = floorY['6F'] + T; sync('6F'); set(new THREE.Vector3(-8.8, y + 1.3, -3.6), new THREE.Vector3(-7.6, y + 3.4, 6.5)); }
  if (SHOT === 'f7' && floorY['7F'] !== undefined) { const y = floorY['7F'] + T; sync('7F'); set(new THREE.Vector3(0, y + 1.9, -2), new THREE.Vector3(3.2, y + 4.2, 37)); }
}
