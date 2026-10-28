// 屋頂小花園 v0.1：只放在屋頂第一階（最寬那一階）的右前角，不蓋滿；保留階梯與尖塔。
// 位置全部由 build() 記下的 window.P7_roof 算（最頂層樓高＋第一階尺寸），大樓加蓋後自動跟著移到新的頂層，不寫死高度。
// 內容：L 形小草地（低矮花台框）、2 棵方塊小樹、1 盆小盆栽、1 張長椅、1 盞暖色小庭園燈。無文字。
// 亮度刻意壓低：燈頭小、點光源弱、範圍短，不搶各層呼吸燈條的焦點。只作用在本棟，隔壁紅九九Lite 不動。
export function initRoofGarden(ctx) {
  const { THREE, scene, SHOT, camera, controls, camPos, target } = ctx;
  const R = window.P7_roof; if (!R || !R.tiers || !R.tiers.length) return;
  const t1 = R.tiers[0], t2 = R.tiers[1] || { w: t1.w * .8, d: t1.d * .8 };
  const y0 = t1.y + t1.h;                         // 第一階頂面
  const xo = t1.w / 2 - .12, zo = t1.d / 2 - .12;   // 外緣（右、前）
  const xi = t2.w / 2 + .15, zi = t2.d / 2 + .15;   // 內緣（貼第二階外牆，留走道）
  const M = c => new THREE.MeshLambertMaterial({ color: c });
  const GRASS = M(0x5F9A55), GRASS2 = M(0x4E8848), RIM = M(0x8E8A84), SOIL = M(0x6B4F3A), TRUNK = M(0x7A5236),
    LEAF = M(0x4F9A5A), LEAF2 = M(0x6DB36A), WOOD = M(0xB07A45), IRON = M(0x3C4148), POT = M(0xC9B8A0);
  const LAMP = new THREE.MeshBasicMaterial({ color: 0xFFD08A, toneMapped: false });
  const g = new THREE.Group(); g.name = 'ROOF_GARDEN'; scene.add(g);
  const box = (w, h, d, m, x, y, z, sh = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; g.add(o); return o; };
  // L 形草地：前段（沿前緣往左延伸一小段）＋側段（沿右緣往後一小段）
  const FX0 = xo - 6.2, SZ0 = zo - 5.2;            // 前段左端、側段後端（只占一角）
  const front = [FX0, xo, zi, zo], side = [xi, xo, SZ0, zi];
  [front, side].forEach(([x0, x1, z0, z1], i) => {
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    box(w, .12, d, SOIL, cx, y0 + .06, cz, false);
    box(w - .16, .04, d - .16, i ? GRASS2 : GRASS, cx, y0 + .14, cz, false);
  });
  // 花台矮框（外緣與兩端，0.22 高），全景時從下往上看得到一條綠邊
  const RH = .22, RT = .1;
  box(xo - FX0, RH, RT, RIM, (FX0 + xo) / 2, y0 + RH / 2, zo);                 // 前緣
  box(RT, RH, zo - SZ0, RIM, xo, y0 + RH / 2, (SZ0 + zo) / 2);                 // 右緣
  box(RT, RH, zo - zi, RIM, FX0, y0 + RH / 2, (zi + zo) / 2);                  // 前段左端
  box(xo - xi, RH, RT, RIM, (xi + xo) / 2, y0 + RH / 2, SZ0);                  // 側段後端
  // 方塊小樹：樹幹＋兩層方塊樹冠
  const tree = (x, z, s) => { box(.2 * s, 1.0 * s, .2 * s, TRUNK, x, y0 + .14 + .5 * s, z);
    box(1.1 * s, .8 * s, 1.1 * s, LEAF, x, y0 + .14 + 1.25 * s, z); box(.7 * s, .5 * s, .7 * s, LEAF2, x, y0 + .14 + 1.85 * s, z); };
  tree(xo - .75, zo - .7, 1.0);                    // 角落主樹
  tree(xo - .7, SZ0 + 1.2, .8);                    // 側段小樹
  // 盆栽（前段左端）
  box(.4, .36, .4, POT, FX0 + .55, y0 + .14 + .18, zo - .55); box(.5, .4, .5, LEAF2, FX0 + .55, y0 + .14 + .56, zo - .55);
  // 長椅（前段中間，面向前方）
  const bx = FX0 + 2.6, bz = zo - .75, sy = y0 + .14 + .42;
  box(1.5, .07, .42, WOOD, bx, sy, bz); box(1.5, .32, .06, WOOD, bx, sy + .22, bz - .2);
  [-1, 1].forEach(s => { box(.06, .42, .4, IRON, bx + s * .66, y0 + .14 + .21, bz); });
  // 小庭園燈（長椅右邊）：細桿＋小方燈頭，暖色、弱光
  const lx = bx + 1.35, lz = zo - .45;
  box(.07, 1.3, .07, IRON, lx, y0 + .14 + .65, lz); box(.16, .04, .16, IRON, lx, y0 + .14 + 1.32, lz);
  box(.13, .16, .13, LAMP, lx, y0 + .14 + 1.22, lz, false);
  const pl = new THREE.PointLight(0xFFC27A, 2.2, 4.5, 1.6); pl.position.set(lx, y0 + 1.25, lz); g.add(pl);
  // 截圖用：roof＝右前方近看屋頂一角
  if (SHOT === 'roof' && camera) { controls.minDistance = 1; controls.minAzimuthAngle = -3; controls.maxAzimuthAngle = 3; controls.maxDistance = 200; controls.minPolarAngle = .2;
    target.set(xo - 3, y0 + .8, zo - 2.5); camPos.set(xo + 6, y0 + 6, zo + 11); camera.position.copy(camPos); controls.target.copy(target); }
}
