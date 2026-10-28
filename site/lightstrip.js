// 外牆發光條 v0.5：每一層樓都裝同款發光條（1F、2F、3F、4F、5F 各一圈），沿該層上緣樓板線四面環繞，上緣金邊。所有人看到同一組燈，燈上無文字。
// 顏色全部由看板同一份狀態資料驅動（事件 p7-board-state）；拿不到資料時維持待確認暖灰。換色 0.8 秒漸變，所有樓層同時換。
// 呼吸：週期 6.4 秒（3.2 秒漸亮＋3.2 秒漸暗，cosine 曲線，亮度 0.05→1.6）。由下往上每層延後 0.3 秒：1F 0 秒、2F 0.3 秒、3F 0.6 秒…
// 相位差做法：每一幀都用同一個時鐘算 (t − 層序×300ms) mod 6400，不累加、不各自計時，所以不會累積誤差。只作用在本棟，隔壁紅九九Lite 不受影響。
export function initLightStrip(ctx) {
  const { THREE, scene, floorY, SHOT, Q, camera, controls, camPos, target } = ctx;
  const COL = { PENDING: '#A39A8E', YELLOW: '#E3B04B', GREEN: '#4FA37A', RED: '#E53935' };
  const W = 30, D = 20, FH = 4.68, FH1 = 7.02, SH = .06, SD = .03, GAP = .02, PER = 6400, LAG = 300, FADE = 800;
  const LO = .05, HI = 1.6; // v0.5：最亮 1.6 倍（原 1.0），光暈也加強
  const ORDER = ['1F', '2F', '3F', 'RF', '5F'].filter(f => floorY[f] !== undefined); // RF 即畫面上的 4F
  const gold = new THREE.MeshBasicMaterial({ color: 0xC9A24E, toneMapped: false });
  const grp = new THREE.Group(); grp.name = 'LIGHT_STRIP_ALL'; scene.add(grp);
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const strips = ORDER.map((fid, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: COL.PENDING, toneMapped: false });
    const halo = new THREE.MeshBasicMaterial({ color: COL.PENDING, toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const g = new THREE.Group(); g.name = 'LIGHT_STRIP_' + (fid === 'RF' ? '4F' : fid); grp.add(g);
    // 1F 上緣有大雨遮（寬出 0.15 m），燈條放在雨遮正下方、往外多推一點才不會被柱子吃掉；2F 以上放在該層頂部樓板線
    const top = floorY[fid] + (fid === '1F' ? FH1 : FH), OUT = fid === '1F' ? .08 : GAP + SD / 2;
    const yc = fid === '1F' ? top - .15 - SH / 2 - .03 : top + SH / 2 + .01;
    const L = W + 2 * (OUT + SD / 2), M = D + 2 * (OUT + SD / 2);
    [[0, D / 2 + OUT, L, SD], [0, -D / 2 - OUT, L, SD], [W / 2 + OUT, 0, SD, M], [-W / 2 - OUT, 0, SD, M]].forEach(([x, z, w, d]) => {
      const s = new THREE.Mesh(B(w, SH, d), mat); s.position.set(x, yc, z); g.add(s);
      const h = new THREE.Mesh(B(w + .12, SH * 3.5, d + .12), halo); h.position.set(x, yc, z); h.renderOrder = 2; g.add(h);
      const e = new THREE.Mesh(B(w + .004, .012, d + .004), gold); e.position.set(x, yc + SH / 2 + .006, z); g.add(e); });
    return { mat, halo, lag: i * LAG };
  });
  const cur = new THREE.Color(COL.PENDING), from = new THREE.Color(), to = new THREE.Color(COL.PENDING); let t0 = -1e9, state = 'PENDING';
  function set(s) { s = COL[s] ? s : 'PENDING'; if (s === state) return; state = s; from.copy(cur); to.set(COL[s]); t0 = performance.now(); }
  window.addEventListener('p7-board-state', e => set(e.detail && e.detail.status));
  const mock = SHOT && Q.get('cb'); if (mock) { set(mock.toUpperCase()); t0 = -1e9; }
  const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const lt = Q.get('lt'); // 截圖：lt=1F 的時間點（毫秒），預設 3200（1F 最亮、往上依序稍暗）
  (function tick() { requestAnimationFrame(tick); const n = performance.now();
    cur.copy(from).lerp(to, ease(Math.min(1, (n - t0) / FADE)));
    const now = SHOT ? (lt != null ? +lt : PER / 2) : n;
    strips.forEach(s => { const ph = ((now - s.lag) % PER + PER) % PER, w = .5 - .5 * Math.cos(2 * Math.PI * ph / PER), b = LO + (HI - LO) * w;
      s.mat.color.copy(cur).multiplyScalar(b); s.halo.color.copy(cur); s.halo.opacity = .6 * w * w; }); })();
  // 截圖用：glow＝右前角近看 1F～4F 燈條
  if (SHOT === 'glow' && camera) { const y = floorY['2F'] || 7; controls.minDistance = 1; controls.minAzimuthAngle = -3; controls.maxAzimuthAngle = 3; controls.maxDistance = 200; target.set(6, y + 3.5, 8); camPos.set(30, y + 7, 36); camera.position.copy(camPos); controls.target.copy(target); }
}
