// 3F 外牆發光條 v0.2：兩條，沿 3F 上下樓板線四面環繞，上緣金邊。所有人看到同一條燈，燈上無文字。
// 顏色由看板同一份狀態資料驅動（事件 p7-board-state）；拿不到資料時維持待確認暖灰。四種狀態都 3.2 秒呼吸，換色 0.8 秒漸變。
export function initLightStrip(ctx) {
  const { THREE, scene, floorY, SHOT, Q, camera, controls, camPos, target } = ctx;
  const COL = { PENDING: '#A39A8E', YELLOW: '#E3B04B', GREEN: '#4FA37A', RED: '#E53935' };
  const W = 30, D = 20, FH = 4.68, SH = .06, SD = .03, GAP = .02, OUT = GAP + SD / 2, PER = 3200, FADE = 800;
  const BR = { PENDING: [.35, .45], YELLOW: [.5, .65], GREEN: [.45, .6], RED: [.5, .7] }; // v0.3 各狀態呼吸亮度範圍
  const mat = new THREE.MeshBasicMaterial({ color: COL.PENDING, toneMapped: false });
  const gold = new THREE.MeshBasicMaterial({ color: 0xC9A24E, toneMapped: false });
  const grp = new THREE.Group(); grp.name = 'LIGHT_STRIP_3F'; scene.add(grp);
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  [floorY['3F'], floorY['3F'] + FH].forEach(y => {
    const yc = y + SH / 2 + .01, L = W + 2 * (OUT + SD / 2), M = D + 2 * (OUT + SD / 2);
    [[0, D / 2 + OUT, L, SD], [0, -D / 2 - OUT, L, SD], [W / 2 + OUT, 0, SD, M], [-W / 2 - OUT, 0, SD, M]].forEach(([x, z, w, d]) => {
      const s = new THREE.Mesh(B(w, SH, d), mat); s.position.set(x, yc, z); grp.add(s);
      const e = new THREE.Mesh(B(w + .004, .012, d + .004), gold); e.position.set(x, yc + SH / 2 + .006, z); grp.add(e); });
  });
  const cur = new THREE.Color(COL.PENDING), from = new THREE.Color(), to = new THREE.Color(COL.PENDING); let t0 = -1e9, state = 'PENDING', bf = BR.PENDING, bt = BR.PENDING, curB = BR.PENDING.slice();
  function set(s) { s = COL[s] ? s : 'PENDING'; if (s === state) return; state = s; from.copy(cur); to.set(COL[s]); bf = curB.slice(); bt = BR[s]; t0 = performance.now(); }
  window.addEventListener('p7-board-state', e => set(e.detail && e.detail.status));
  const mock = SHOT && Q.get('cb'); if (mock) { set(mock.toUpperCase()); t0 = -1e9; }
  const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  (function tick() { requestAnimationFrame(tick); const n = performance.now();
    const k = ease(Math.min(1, (n - t0) / FADE)); cur.copy(from).lerp(to, k); curB = [bf[0] + (bt[0] - bf[0]) * k, bf[1] + (bt[1] - bf[1]) * k];
    const [LO, HI] = curB, b = SHOT ? HI : LO + (HI - LO) * (.5 - .5 * Math.cos(2 * Math.PI * (n % PER) / PER));
    mat.color.copy(cur).multiplyScalar(b); })();
}
