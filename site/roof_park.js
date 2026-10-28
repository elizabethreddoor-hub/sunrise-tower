// 屋頂公園 v0.3（步道三案＋電梯亭）：庭彣 10/28 19:09 要求拿掉環形步道、電梯直達屋頂。
//   ROOF_PATH：A＝L 形折線（造型師）、B＝日出放射（Vera）、C＝Y 形（Nova）；預覽可用 ?path=A|B|C 覆蓋。
//   電梯亭：對齊大樓右側電梯井（index.html ELEV_X = W/2 - .75、ELEV_Z = 0）往上延伸，門朝前（+z），門前 2×2 格金邊入口平台，步道一律從平台接出。
// 屋頂公園 v0.2（B 方案＋品牌元素）：整個屋頂做成一片平面公園，取代原本的兩層階梯與尖塔（index.html 已拿掉）。
// 位置全部由 build() 記下的 window.P7_roof（最頂層頂面 deckY、樓板寬深）計算，不寫死高度；大樓加蓋重跑 build() 時，
// build() 會呼叫 window.P7_roofBuild() 把公園重建到新的頂層。
// 內容：石板鋪面、矮石牆（金邊）、整片草地、環形淺木棧道、中央小涼亭（地標，取代尖塔）、方塊樹 3 棵、低矮花圃、
//       木長椅 2 張、一排暖金色低亮度小燈柱、中間一片空草坪、Mira 圓形小草坪舞台。
// 配色只用：暖灰石板 #A39A8E、淺木、玉綠 #4FA37A（樹冠另用同色系深一階）、金邊 #C9A24E。不用紅色、不用 #8C040C。
// 只有燈具會發光（燈柱燈頭、涼亭吊燈）；其餘一律不自發光的 Lambert 材質。不加點光源，避免搶各層呼吸燈條的焦點。
// 屋頂上沒有任何文字、LOGO、招牌或數字。隔壁紅九九Lite 不動。這版不做角色上屋頂散步。
const ROOF_PATH_DEFAULT = 'A';
export function initRoofPark(ctx) {
  const { THREE, scene, SHOT, Q, camera, controls, camPos, target } = ctx;
  const ROOF_PATH = (Q && /^[ABC]$/.test(Q.get('path') || '') ? Q.get('path') : ROOF_PATH_DEFAULT);
  const STONE = 0xA39A8E, WOOD = 0xD9B98C, WOOD2 = 0xC4A274, JADE = 0x4FA37A, JADE2 = 0x3E8A64, GOLD = 0xC9A24E, STONE2 = 0x8E8679;
  const M = c => new THREE.MeshLambertMaterial({ color: c });
  const MAT = { stone: M(STONE), wood: M(WOOD), wood2: M(WOOD2), jade: M(JADE), jade2: M(JADE2), gold: M(GOLD), stone2: M(STONE2) };
  const GLASS = new THREE.MeshStandardMaterial({ color: 0xCFE0E6, transparent: true, opacity: .3, roughness: .15, metalness: .1, depthWrite: false });
  const LAMP = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xE9C887).multiplyScalar(.78), toneMapped: false }); // 低亮度暖金
  let cam = false;
  function build() {
    const R = window.P7_roof; if (!R || R.deckY == null) return;
    const old = scene.getObjectByName('ROOF_PARK'); if (old) scene.remove(old);
    const g = new THREE.Group(); g.name = 'ROOF_PARK'; scene.add(g);
    const y0 = R.deckY, HW = R.w / 2, HD = R.d / 2;
    const box = (w, h, d, m, x, y, z, sh = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; g.add(o); return o; };
    const cyl = (r0, r1, h, m, x, y, z, seg = 24) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
    // 石板鋪面（整片）＋四周矮石牆（0.4 m，上緣金邊）
    box(R.w, .06, R.d, MAT.stone, 0, y0 + .03, 0, false);
    const PH = .4, PT = .28, py = y0 + .06;
    [[0, HD - PT / 2, R.w, PT], [0, -HD + PT / 2, R.w, PT], [HW - PT / 2, 0, PT, R.d - 2 * PT], [-HW + PT / 2, 0, PT, R.d - 2 * PT]].forEach(([x, z, w, d]) => {
      box(w, PH, d, MAT.stone, x, py + PH / 2, z); box(w + .02, .04, d + .02, MAT.gold, x, py + PH + .02, z, false); });
    // 草地（石牆內整片）
    const gy = py + .05; box(R.w - 2 * PT - .5, .1, R.d - 2 * PT - .5, MAT.jade, 0, py + .05, 0, false);
    // v0.3：拿掉環形棧道。A 只留給燈柱排距用（原橢圓半徑）。
    const A = Math.min(12, HW - 2.6);
    // 中央小涼亭（地標）：石台基＋四根淺木柱＋金邊四角錐石屋頂＋金色頂飾；吊一盞低亮度暖燈。中心略偏後，前方留空草坪。
    const PX = 0, PZ = -2.2, base = gy + .1;
    box(3.6, .22, 3.6, MAT.stone, PX, base + .11, PZ); box(3.64, .03, 3.64, MAT.gold, PX, base + .235, PZ, false);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(.2, 2.3, .2, MAT.wood, PX + sx * 1.45, base + .22 + 1.15, PZ + sz * 1.45));
    const rb = base + .22 + 2.3; box(3.5, .14, 3.5, MAT.wood, PX, rb + .07, PZ); box(3.56, .04, 3.56, MAT.gold, PX, rb + .16, PZ, false);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.75, 1.4, 4), MAT.stone); roof.rotation.y = Math.PI / 4; roof.position.set(PX, rb + .18 + .7, PZ); roof.castShadow = true; g.add(roof);
    cyl(.08, .14, .35, MAT.gold, PX, rb + .18 + 1.4 + .12, PZ, 8);
    box(.03, .5, .03, MAT.gold, PX, rb - .25, PZ, false); box(.26, .3, .26, LAMP, PX, rb - .62, PZ, false);
    // 中間空草坪：涼亭前方盡量留空（之後活動用）；B、C 案有步道穿過，A 案完整保留。
    // ── 共用：步道小工具。石板 #A39A8E、每 1 m 一條深一階暖灰接縫（對齊方塊格線）。頂面 = gy + .11（草地頂 gy + .05），略高於草地。
    const TY = gy + .05;
    const seg = (x1, z1, x2, z2, w, w2 = w) => { // 直線步道（w→w2 可做漸寬的放射光芒）
      const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz), ux = dx / len, uz = dz / len, nx = -uz, nz = ux;
      const shp = new THREE.Shape([[0, -w / 2], [len, -w2 / 2], [len, w2 / 2], [0, w / 2]].map(([a, b]) => new THREE.Vector2(a, b)));
      const geo = new THREE.ExtrudeGeometry(shp, { depth: .06, bevelEnabled: false }); geo.rotateX(Math.PI / 2);
      const o = new THREE.Mesh(geo, MAT.stone); o.position.set(x1, TY + .06, z1); o.rotation.y = -Math.atan2(dz, dx); o.receiveShadow = true; g.add(o);
      for (let t = 1; t < len - .3; t += 1) { const ww = w + (w2 - w) * t / len, j = box(.05, .012, ww * .96, MAT.stone2, x1 + ux * t, TY + .066, z1 + uz * t, false); j.rotation.y = -Math.atan2(dz, dx); }
      return { ux, uz, nx, nz, len }; };
    const tiles = (x0, z0, x1, z1) => { // 方格鋪面（整數格，x0<x1、z0<z1），格線接縫
      box(x1 - x0, .06, z1 - z0, MAT.stone, (x0 + x1) / 2, TY + .03, (z0 + z1) / 2, false);
      for (let x = Math.ceil(x0 + .01); x < x1 - .01; x++) box(.05, .012, z1 - z0, MAT.stone2, x, TY + .066, (z0 + z1) / 2, false);
      for (let z = Math.ceil(z0 + .01); z < z1 - .01; z++) box(x1 - x0, .012, .05, MAT.stone2, (x0 + x1) / 2, TY + .066, z, false); };
    const goldFrame = (x0, z0, x1, z1, y) => { const t = .07;
      box(x1 - x0 + t, .03, t, MAT.gold, (x0 + x1) / 2, y, z0, false); box(x1 - x0 + t, .03, t, MAT.gold, (x0 + x1) / 2, y, z1, false);
      box(t, .03, z1 - z0, MAT.gold, x0, y, (z0 + z1) / 2, false); box(t, .03, z1 - z0, MAT.gold, x1, y, (z0 + z1) / 2, false); };
    // 方塊樹（淺木樹幹＋兩層方塊樹冠）
    const tree = (x, z, s) => { box(.28 * s, 1.3 * s, .28 * s, MAT.wood2, x, gy + .1 + .65 * s, z);
      box(1.5 * s, 1.1 * s, 1.5 * s, MAT.jade2, x, gy + .1 + 1.75 * s, z); box(1.0 * s, .7 * s, 1.0 * s, MAT.jade, x, gy + .1 + 2.6 * s, z); };
    // 低矮花圃：石框＋深綠植栽＋金色小花（不用紅色）
    const bed = (x, z, w, d) => { box(w, .3, d, MAT.stone, x, gy + .15, z); box(w - .16, .12, d - .16, MAT.jade2, x, gy + .3, z, false);
      const nx = Math.max(2, Math.round(w / .55)), nz = Math.max(1, Math.round(d / .55));
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) if ((i + j) % 2 === 0) box(.14, .1, .14, MAT.gold, x - w / 2 + (i + .5) * w / nx, gy + .41, z - d / 2 + (j + .5) * d / nz, false); };
    // 木長椅：淺木座面＋椅背，石椅腳；面向前方（+z）。wide＝雙人座（中間金色扶手分成左右兩格）
    const bench = (x, z, wide) => { const sy = gy + .1 + .42, BW = wide ? 2.6 : 1.7; box(BW, .08, .48, MAT.wood, x, sy, z); box(BW, .36, .07, MAT.wood, x, sy + .24, z - .22);
      [-1, 1].forEach(s => box(.1, .42, .44, MAT.stone, x + s * (BW / 2 - .13), gy + .1 + .21, z)); box(BW + .04, .03, .5, MAT.gold, x, sy + .055, z, false);
      if (wide) box(.07, .26, .44, MAT.gold, x, sy + .17, z, false); };
    // ── 電梯亭（三案共用）：右側電梯井（ELEV_X = W/2 - .75，屋頂樓板 w = W - .12 ⇒ R.w/2 + .06 - .75）往上延伸出屋頂。
    //    亭身 2.3×2.4 m 蓋住井道，內縮到矮牆內；石台基、淺木角柱、三面玻璃、後牆石材、金邊；門朝前（+z）一對玻璃門＋金色門框；
    //    小四角錐石屋頂（呼應中央涼亭）。門楣一盞低亮度暖燈（唯一發光件）。門前 2×2 格入口平台、鑲金邊。
    const SHAFT_X = R.w / 2 + .06 - .75, EX = Math.min(SHAFT_X, HW - PT - 1.2), EZ = 0, KW = 2.3, KD = 2.4, KH = 2.9, kb = gy + .1;
    box(KW + .3, .2, KD + .3, MAT.stone, EX, kb + .1, EZ); box(KW + .34, .03, KD + .34, MAT.gold, EX, kb + .215, EZ, false);
    const k0 = kb + .2, kx0 = EX - KW / 2, kx1 = EX + KW / 2, kz0 = EZ - KD / 2, kz1 = EZ + KD / 2;
    [[kx0, kz0], [kx1, kz0], [kx0, kz1], [kx1, kz1]].forEach(([x, z]) => box(.2, KH, .2, MAT.wood, x, k0 + KH / 2, z));
    box(KW, KH, .14, MAT.stone, EX, k0 + KH / 2, kz0 + .07);                       // 後牆（井道側）
    [kx0, kx1].forEach(x => box(.04, KH - .1, KD - .2, GLASS, x, k0 + KH / 2, EZ, false)); // 左右玻璃
    box(KW - .2, .5, .14, MAT.wood, EX, k0 + KH - .25, kz1);                        // 門楣
    box(.08, KH - .5, .12, MAT.gold, EX - .62, k0 + (KH - .5) / 2, kz1); box(.08, KH - .5, .12, MAT.gold, EX + .62, k0 + (KH - .5) / 2, kz1);
    box(1.32, .06, .12, MAT.gold, EX, k0 + KH - .52, kz1);
    [-1, 1].forEach(s => box(.58, KH - .58, .04, GLASS, EX + s * .3, k0 + (KH - .58) / 2, kz1, false)); box(.025, KH - .58, .06, MAT.gold, EX, k0 + (KH - .58) / 2, kz1, false);
    [-1, 1].forEach(s => box(.5, KH - .1, .04, GLASS, EX + s * .9, k0 + KH / 2, kz1, false));
    const kr = k0 + KH; box(KW + .5, .14, KD + .5, MAT.wood, EX, kr + .07, EZ); box(KW + .56, .04, KD + .56, MAT.gold, EX, kr + .16, EZ, false);
    const kroof = new THREE.Mesh(new THREE.ConeGeometry(2.0, .95, 4), MAT.stone); kroof.rotation.y = Math.PI / 4; kroof.scale.set(1, 1, KD / KW); kroof.position.set(EX, kr + .18 + .475, EZ); kroof.castShadow = true; g.add(kroof);
    cyl(.06, .1, .25, MAT.gold, EX, kr + .18 + .95 + .08, EZ, 8);
    box(.3, .06, .14, MAT.gold, EX, k0 + KH - .05, kz1 + .12, false); box(.2, .08, .1, LAMP, EX, k0 + KH - .12, kz1 + .14, false);
    // 入口平台：門前 2×2 格（1 m 格），四周金邊
    const PFx0 = EX - 1, PFx1 = EX + 1, PFz0 = kz1 + .15, PFz1 = PFz0 + 2;
    tiles(PFx0, PFz0, PFx1, PFz1); goldFrame(PFx0, PFz0, PFx1, PFz1, TY + .075);
    const elevator = { x: EX, z: EZ, door: { x: EX, z: kz1 }, pad: [PFx0, PFz0, PFx1, PFz1] };

    // ── 三案共用的固定物：後排三棵角落樹、後方長花圃、右長椅
    tree(-HW + 1.6, -HD + 1.5, 1.05); tree(HW - 1.6, -HD + 1.5, 1.0);
    bed(0, -HD + 1.1, 5.0, .9);
    bench(6.6, -1.9);
    // ★ Mira 預設位置（B、C 案）：左側長椅（MIRA_BENCH）＋正前方圓形小草坪舞台（MIRA_STAGE）。A 案改到角落小廣場（見下）。
    let MIRA_BENCH = { x: -6.6, z: -1.9 }, MIRA_STAGE = { x: -6.6, z: 1.1, r: 1.5 }, lampSkip = () => false;
    if (ROOF_PATH === 'A') {
      // A＝L 形折線（造型師）：對齊 1 m 方格。入口平台往前（+z）直走 3 m，在右前角轉 90 度，沿前緣內側往左直達左前角小廣場。
      const LZ0 = PFz1 + 2, LZ1 = LZ0 + 2;                 // 橫向段 z 範圍（2 格寬）
      tiles(PFx0, PFz1, PFx1, LZ1);                         // 縱向段（含轉角）
      const PLx0 = -HW + PT + .4, PLx1 = PLx0 + 6, PLz0 = LZ0 - 2, PLz1 = HD - PT - .4; // 左前角小廣場
      tiles(PLx1, LZ0, PFx0, LZ1);                          // 橫向段
      tiles(PLx0, PLz0, PLx1, PLz1); goldFrame(PLx0, PLz0, PLx1, PLz1, TY + .075);
      tree(PFx1 - .2, LZ1 + 1.1, .85);                      // 轉角方塊樹（外角）
      bed(-1.5, LZ0 - .7, 5.0, .7); bed(5.6, LZ0 - .7, 5.0, .7); // 沿橫向段內側的低花圃（中間留缺口通往涼亭前草坪）
      bed(PFx0 - 1.6, PFz0 + 1, 1.6, .7);
      // ★ Mira 位置：小廣場後緣一張雙人長椅，面向鏡頭（+z）。左格＝Mira 固定站位（MIRA_BENCH），右格留位給之後的角色，現在都不放角色。
      const bx = (PLx0 + PLx1) / 2, bz = PLz0 + .6; bench(bx, bz, true);
      MIRA_BENCH = { x: bx - .65, z: bz }; /* MIRA_BENCH_RESERVED = { x: bx + .65, z: bz } 右格留位 */
      MIRA_STAGE = { x: bx, z: (bz + PLz1) / 2 + .35, r: 1.2 }; // 長椅前方的圓形小舞台
      bench(-6.6, -1.9);                                     // 原左長椅保留為一般座位
      lampSkip = x => x < PLx1 + .3;                         // 小廣場範圍內不放燈柱
    } else if (ROOF_PATH === 'B') {
      // B＝日出放射（Vera）：中央涼亭當太陽，前方半圓石環（金邊）是「日出」，五道漸寬的光芒石板路放射出去；
      //    最右一道接電梯入口平台、最左一道停在 Mira 舞台邊，中間三道朝前緣燈柱。
      const SR0 = 2.75, SR1 = 3.45;
      const sun = new THREE.Shape(); sun.absarc(0, 0, SR1, 0, Math.PI, false); sun.lineTo(-SR0, 0); sun.absarc(0, 0, SR0, Math.PI, 0, true); sun.lineTo(SR1, 0);
      const sg = new THREE.ExtrudeGeometry(sun, { depth: .06, bevelEnabled: false, curveSegments: 48 }); sg.rotateX(Math.PI / 2);
      const so = new THREE.Mesh(sg, MAT.stone); so.position.set(PX, TY + .06, PZ); so.receiveShadow = true; g.add(so);
      const arcG = r => { const t = new THREE.Mesh(new THREE.TorusGeometry(r, .035, 6, 64, Math.PI), MAT.gold); t.rotation.x = Math.PI / 2; t.position.set(PX, TY + .075, PZ); g.add(t); };
      arcG(SR1); arcG(SR0);
      const ray = (tx, tz, stop) => { const dx = tx - PX, dz = tz - PZ, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, e = L - stop;
        seg(PX + ux * SR1, PZ + uz * SR1, PX + ux * e, PZ + uz * e, .7, 1.35); };
      ray(EX, PFz0 + 1, 1.0 + .05);                           // → 電梯入口平台（平台中心內 1 m 處接上）
      ray(MIRA_STAGE.x, MIRA_STAGE.z, MIRA_STAGE.r + .15);   // → Mira 舞台邊（不壓到舞台）
      ray(0, HD, 1.6); ray(-5.2, HD, 1.6); ray(5.2, HD, 1.6); // → 前緣三道
      bed(-HW + 2.2, HD - 1.3, 3.2, .9); bed(10.2, 6.4, 2.4, .8); tree(HW - 1.5, HD - 1.5, .85);
    } else {
      // C＝Y 形（Nova）：電梯入口平台往左一條直線主軸到分岔點，分成兩支：一支上到中央涼亭正前方，一支到 Mira 圓形舞台。
      const NX = 2.6, NZ = PFz0 + 1.6;                        // 分岔點（涼亭前方偏右）
      seg(PFx0, PFz0 + 1, NX, NZ, 1.6);                      // 主軸（寬 1.6）
      const nd = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, .06, 32), MAT.stone); nd.position.set(NX, TY + .03, NZ); nd.receiveShadow = true; g.add(nd); // 分岔小圓台
      const nr = new THREE.Mesh(new THREE.TorusGeometry(1.15, .035, 6, 40), MAT.gold); nr.rotation.x = Math.PI / 2; nr.position.set(NX, TY + .075, NZ); g.add(nr);
      seg(NX, NZ, PX + .9, PZ + 1.8 + .15, 1.2);             // 分支 1 → 涼亭台基前緣
      const sdx = MIRA_STAGE.x - NX, sdz = MIRA_STAGE.z - NZ, sl = Math.hypot(sdx, sdz), so = (MIRA_STAGE.r + .15) / sl;
      seg(NX, NZ, MIRA_STAGE.x - sdx * so, MIRA_STAGE.z - sdz * so, 1.2); // 分支 2 → Mira 舞台邊
      bed(-HW + 2.2, HD - 1.3, 3.2, .9); bed(7.4, NZ + 2.0, 3.0, .8); bed(-1.6, NZ + 2.6, 3.2, .8); tree(HW - 1.5, HD - 1.5, .85);
    }
    // Mira 位置：長椅（B、C 在左側 -6.6；A 在小廣場的雙人椅已經放好）
    if (ROOF_PATH !== 'A') bench(MIRA_BENCH.x, MIRA_BENCH.z);
    // ★ Mira 活動區：圓形小草坪舞台（MIRA_STAGE）：石基座＋玉綠草面＋金邊，無文字無標誌。
    cyl(MIRA_STAGE.r, MIRA_STAGE.r + .05, .2, MAT.stone, MIRA_STAGE.x, gy + .2, MIRA_STAGE.z, 40);
    cyl(MIRA_STAGE.r - .12, MIRA_STAGE.r - .12, .04, MAT.jade, MIRA_STAGE.x, gy + .32, MIRA_STAGE.z, 40);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(MIRA_STAGE.r - .06, .035, 6, 48), MAT.gold); rim.rotation.x = Math.PI / 2; rim.position.set(MIRA_STAGE.x, gy + .31, MIRA_STAGE.z); g.add(rim);
    // 一排暖金色低亮度小燈柱：沿屋頂前緣內側一排 9 盞（0.9 m 高，金色細桿＋小燈頭），只有燈頭發光
    const LZ = HD - PT - .55, LN = 9;
    for (let i = 0; i < LN; i++) { const x = -A + 1.2 + i * (2 * A - 2.4) / (LN - 1); if (lampSkip(x)) continue;
      box(.06, .8, .06, MAT.gold, x, gy + .1 + .4, LZ, false); box(.16, .04, .16, MAT.gold, x, gy + .1 + .82, LZ, false); box(.11, .12, .11, LAMP, x, gy + .1 + .9, LZ, false); }
    g.userData = { MIRA_BENCH, MIRA_STAGE, y: gy + .1, path: ROOF_PATH };
    window.P7_roofPark = { y: gy + .1, path: ROOF_PATH, miraBench: MIRA_BENCH, miraStage: MIRA_STAGE, pavilion: { x: PX, z: PZ }, elevator };
    // 截圖用：roofpark＝右前上方近看整個屋頂
    // 截圖用：roofpathclose＝從左前方近看電梯亭、入口平台和步道接口
    if (SHOT === 'roofpathclose' && camera && !cam) { cam = true; controls.minDistance = 1; controls.minAzimuthAngle = -3; controls.maxAzimuthAngle = 3; controls.maxDistance = 200; controls.minPolarAngle = .2;
      target.set(EX - 3.5, y0 + 1, 3.5); camPos.set(EX - 14, y0 + 10.5, 20); camera.position.copy(camPos); controls.target.copy(target); }
    // 截圖用：roofpath＝退遠一點、看得到整片屋頂＋右側電梯亭（步道三案比較用）
    if (SHOT === 'roofpath' && camera && !cam) { cam = true; controls.minDistance = 1; controls.minAzimuthAngle = -3; controls.maxAzimuthAngle = 3; controls.maxDistance = 200; controls.minPolarAngle = .2;
      target.set(0, y0, 1.5); camPos.set(9, y0 + 27, 39); camera.position.copy(camPos); controls.target.copy(target); }
    if (SHOT === 'roofpark' && camera && !cam) { cam = true; controls.minDistance = 1; controls.minAzimuthAngle = -3; controls.maxAzimuthAngle = 3; controls.maxDistance = 200; controls.minPolarAngle = .2;
      target.set(-1, y0 + .6, 0); camPos.set(13, y0 + 14, 27); camera.position.copy(camPos); controls.target.copy(target); }
  }
  window.P7_roofBuild = build; build();
}
