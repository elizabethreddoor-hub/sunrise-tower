// 屋頂公園 v0.2（B 方案＋品牌元素）：整個屋頂做成一片平面公園，取代原本的兩層階梯與尖塔（index.html 已拿掉）。
// 位置全部由 build() 記下的 window.P7_roof（最頂層頂面 deckY、樓板寬深）計算，不寫死高度；大樓加蓋重跑 build() 時，
// build() 會呼叫 window.P7_roofBuild() 把公園重建到新的頂層。
// 內容：石板鋪面、矮石牆（金邊）、整片草地、環形淺木棧道、中央小涼亭（地標，取代尖塔）、方塊樹 3 棵、低矮花圃、
//       木長椅 2 張、一排暖金色低亮度小燈柱、中間一片空草坪、Mira 圓形小草坪舞台。
// 配色只用：暖灰石板 #A39A8E、淺木、玉綠 #4FA37A（樹冠另用同色系深一階）、金邊 #C9A24E。不用紅色、不用 #8C040C。
// 只有燈具會發光（燈柱燈頭、涼亭吊燈）；其餘一律不自發光的 Lambert 材質。不加點光源，避免搶各層呼吸燈條的焦點。
// 屋頂上沒有任何文字、LOGO、招牌或數字。隔壁紅九九Lite 不動。這版不做角色上屋頂散步。
export function initRoofPark(ctx) {
  const { THREE, scene, SHOT, camera, controls, camPos, target } = ctx;
  const STONE = 0xA39A8E, WOOD = 0xD9B98C, WOOD2 = 0xC4A274, JADE = 0x4FA37A, JADE2 = 0x3E8A64, GOLD = 0xC9A24E;
  const M = c => new THREE.MeshLambertMaterial({ color: c });
  const MAT = { stone: M(STONE), wood: M(WOOD), wood2: M(WOOD2), jade: M(JADE), jade2: M(JADE2), gold: M(GOLD) };
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
    // 環形淺木棧道：橢圓環，外徑 12×7.6、寬 1.2；棧道上每隔一段一條淺色接縫
    const A = Math.min(12, HW - 2.6), Bz = Math.min(7.6, HD - 2.2), PW = 1.2;
    const sh = new THREE.Shape(); sh.absellipse(0, 0, A, Bz, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Path(); hole.absellipse(0, 0, A - PW, Bz - PW, 0, Math.PI * 2, true, 0); sh.holes.push(hole);
    const pg = new THREE.ExtrudeGeometry(sh, { depth: .06, bevelEnabled: false, curveSegments: 72 }); pg.rotateX(-Math.PI / 2);
    const path = new THREE.Mesh(pg, MAT.wood); path.position.y = gy + .05; path.receiveShadow = true; g.add(path);
    for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2, rx = A - PW / 2, rz = Bz - PW / 2, x = rx * Math.cos(a), z = rz * Math.sin(a);
      const s = box(.05, .012, PW * .96, MAT.wood2, x, gy + .116, z, false); s.rotation.y = Math.atan2(rz * Math.cos(a), rx * Math.sin(a)); }
    // 中央小涼亭（地標）：石台基＋四根淺木柱＋金邊四角錐石屋頂＋金色頂飾；吊一盞低亮度暖燈。中心略偏後，前方留空草坪。
    const PX = 0, PZ = -2.2, base = gy + .1;
    box(3.6, .22, 3.6, MAT.stone, PX, base + .11, PZ); box(3.64, .03, 3.64, MAT.gold, PX, base + .235, PZ, false);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(.2, 2.3, .2, MAT.wood, PX + sx * 1.45, base + .22 + 1.15, PZ + sz * 1.45));
    const rb = base + .22 + 2.3; box(3.5, .14, 3.5, MAT.wood, PX, rb + .07, PZ); box(3.56, .04, 3.56, MAT.gold, PX, rb + .16, PZ, false);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.75, 1.4, 4), MAT.stone); roof.rotation.y = Math.PI / 4; roof.position.set(PX, rb + .18 + .7, PZ); roof.castShadow = true; g.add(roof);
    cyl(.08, .14, .35, MAT.gold, PX, rb + .18 + 1.4 + .12, PZ, 8);
    box(.03, .5, .03, MAT.gold, PX, rb - .25, PZ, false); box(.26, .3, .26, LAMP, PX, rb - .62, PZ, false);
    // 中間空草坪：涼亭前方、橢圓環內正中，半徑約 3 m 範圍內不放任何東西（之後活動用）。
    // 方塊樹 3 棵（淺木樹幹＋兩層方塊樹冠），放在環外的三個角落
    const tree = (x, z, s) => { box(.28 * s, 1.3 * s, .28 * s, MAT.wood2, x, gy + .1 + .65 * s, z);
      box(1.5 * s, 1.1 * s, 1.5 * s, MAT.jade2, x, gy + .1 + 1.75 * s, z); box(1.0 * s, .7 * s, 1.0 * s, MAT.jade, x, gy + .1 + 2.6 * s, z); };
    tree(-HW + 1.6, -HD + 1.5, 1.05); tree(HW - 1.6, -HD + 1.5, 1.0); tree(HW - 1.5, HD - 1.5, .85);
    // 低矮花圃：石框＋深綠植栽＋金色小花（不用紅色）
    const bed = (x, z, w, d) => { box(w, .3, d, MAT.stone, x, gy + .15, z); box(w - .16, .12, d - .16, MAT.jade2, x, gy + .3, z, false);
      const nx = Math.max(2, Math.round(w / .55)), nz = Math.max(1, Math.round(d / .55));
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) if ((i + j) % 2 === 0) box(.14, .1, .14, MAT.gold, x - w / 2 + (i + .5) * w / nx, gy + .41, z - d / 2 + (j + .5) * d / nz, false); };
    bed(-HW + 2.2, HD - 1.3, 3.2, .9); bed(0, -HD + 1.1, 5.0, .9); bed(6.4, 1.6, 2.4, .9);
    // 木長椅：淺木座面＋椅背，石椅腳；面向前方（+z）
    const bench = (x, z) => { const sy = gy + .1 + .42; box(1.7, .08, .48, MAT.wood, x, sy, z); box(1.7, .36, .07, MAT.wood, x, sy + .24, z - .22);
      [-1, 1].forEach(s => box(.1, .42, .44, MAT.stone, x + s * .72, gy + .1 + .21, z)); box(1.74, .03, .5, MAT.gold, x, sy + .055, z, false); };
    // ★ Mira 固定站位：左側這張長椅（MIRA_BENCH）。這次不放 Mira 角色，只留位置；之後要放時，坐在長椅正中、面向 +z。
    const MIRA_BENCH = { x: -6.6, z: -1.9 }; bench(MIRA_BENCH.x, MIRA_BENCH.z);
    bench(6.6, -1.9);
    // ★ Mira 活動區：長椅正前方的圓形小草坪舞台（MIRA_STAGE）：石基座＋玉綠草面＋金邊，無文字無標誌。
    const MIRA_STAGE = { x: -6.6, z: 1.1, r: 1.5 };
    cyl(MIRA_STAGE.r, MIRA_STAGE.r + .05, .2, MAT.stone, MIRA_STAGE.x, gy + .2, MIRA_STAGE.z, 40);
    cyl(MIRA_STAGE.r - .12, MIRA_STAGE.r - .12, .04, MAT.jade, MIRA_STAGE.x, gy + .32, MIRA_STAGE.z, 40);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(MIRA_STAGE.r - .06, .035, 6, 48), MAT.gold); rim.rotation.x = Math.PI / 2; rim.position.set(MIRA_STAGE.x, gy + .31, MIRA_STAGE.z); g.add(rim);
    // 一排暖金色低亮度小燈柱：沿屋頂前緣內側一排 9 盞（0.9 m 高，金色細桿＋小燈頭），只有燈頭發光
    const LZ = HD - PT - .55, LN = 9;
    for (let i = 0; i < LN; i++) { const x = -A + 1.2 + i * (2 * A - 2.4) / (LN - 1);
      box(.06, .8, .06, MAT.gold, x, gy + .1 + .4, LZ, false); box(.16, .04, .16, MAT.gold, x, gy + .1 + .82, LZ, false); box(.11, .12, .11, LAMP, x, gy + .1 + .9, LZ, false); }
    g.userData = { MIRA_BENCH, MIRA_STAGE, y: gy + .1 };
    window.P7_roofPark = { y: gy + .1, miraBench: MIRA_BENCH, miraStage: MIRA_STAGE, pavilion: { x: PX, z: PZ } };
    // 截圖用：roofpark＝右前上方近看整個屋頂
    if (SHOT === 'roofpark' && camera && !cam) { cam = true; controls.minDistance = 1; controls.minAzimuthAngle = -3; controls.maxAzimuthAngle = 3; controls.maxDistance = 200; controls.minPolarAngle = .2;
      target.set(-1, y0 + .6, 0); camPos.set(13, y0 + 14, 27); camera.position.copy(camPos); controls.target.copy(target); }
  }
  window.P7_roofBuild = build; build();
}
