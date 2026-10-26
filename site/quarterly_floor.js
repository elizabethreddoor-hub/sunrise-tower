// 預覽：5F 季報書房（書局風）。只顯示季度、階段、更新時間、簡述；不放姓名、數字、帳號。資料為假資料。
export function initQuarterlyFloor(ctx) {
  const { THREE, scene, floorY, T, SHOT, Q, camera, controls, camPos, target } = ctx, D = document;
  if (floorY['5F'] === undefined) return; const y0 = floorY['5F'] + T;
  const grp = new THREE.Group(); grp.name = 'QUARTERLY_5F'; scene.add(grp);
  const M = c => new THREE.MeshStandardMaterial({ color: c, roughness: .8 }), B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const add = (g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; grp.add(o); return o; };
  const WOOD = M(0x7A4E2D), WOOD2 = M(0x5A3820), RUG = M(0x8C2F2A);
  const BOOK = [0x9E3B2F, 0x2F5D50, 0xC9A24E, 0x3B4A7A, 0xE8DCC8, 0x6B3F5A, 0xB5651D].map(M);
  // 木地板感：暖色地毯 + 後牆木書架
  add(B(26, .02, 15), M(0xA87A4E), 0, y0 + .02, 0);
  add(B(8, .015, 5), RUG, 6, y0 + .04, 2.5);
  let seed = 7; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const shelf = (x0, x1, z, rot) => { const L = x1 - x0, cx = (x0 + x1) / 2, H = 3.6;
    add(B(L, H, .5), WOOD2, cx, y0 + H / 2, z).visible = true;
    for (let k = 0; k < 5; k++) { const yy = y0 + .15 + k * .72; add(B(L, .06, .55), WOOD, cx, yy, z + .03);
      let x = x0 + .1; while (x < x1 - .2) { const w = .08 + R() * .1, h = .42 + R() * .2; add(B(w, h, .32), BOOK[Math.floor(R() * BOOK.length)], x + w / 2, yy + .03 + h / 2, z + .1); x += w + .015; } } };
  shelf(-12.5, -1.5, -9.45); shelf(8, 12.8, -9.45);
  // 側牆矮書櫃
  [-1, 1].forEach(s => { const x = 6 + s * 5.5; add(B(.6, 1.2, 3), WOOD2, x, y0 + .6, 4.5);
    for (let i = 0; i < 14; i++) { const h = .3 + R() * .15; add(B(.4, h, .09), BOOK[i % 7], x, y0 + 1.2 + h / 2, 3.2 + i * .19); } });
  // 閱讀長桌 + 暖燈
  add(B(5, .1, 1.6), WOOD, 6, y0 + .8, 2.5); [[-2.3, -.7], [2.3, -.7], [-2.3, .7], [2.3, .7]].forEach(q => add(B(.1, .8, .1), WOOD2, 6 + q[0], y0 + .4, 2.5 + q[1]));
  [-1.6, 0, 1.6].forEach(dx => { add(B(.5, .4, .5), M(0x3A2A20), 6 + dx, y0 + .2, 1.2); add(B(.5, .4, .5), M(0x3A2A20), 6 + dx, y0 + .2, 3.8);
    add(new THREE.CylinderGeometry(.03, .03, .45), M(0xC9A24E), 6 + dx, y0 + 1.07, 2.5);
    const sh = add(new THREE.ConeGeometry(.25, .22, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFD08A, side: THREE.DoubleSide, toneMapped: false }), 6 + dx, y0 + 1.35, 2.5);
    const L = new THREE.PointLight(0xFFC27A, 4, 6, 1.5); L.position.set(6 + dx, y0 + 1.2, 2.5); grp.add(L);
    for (let j = 0; j < 2; j++) add(B(.3, .05, .22), BOOK[(j + 3) % 7], 6 + dx + (j ? .3 : -.3), y0 + .88, 2.5 + (j ? .3 : -.2)); });
  [[-4, 0], [10, 0]].forEach(p => { const L = new THREE.PointLight(0xFFB86B, 6, 14, 1.3); L.position.set(p[0], y0 + 3.6, p[1]); grp.add(L); });
  // 5F 只放兩個座位（合約管家 desk 4、軟體工程精靈 desk 7），木桌配書局風
  [[-7.5, -2.2], [-4.5, -2.2]].forEach(([x, z]) => { add(B(1.5, .08, .85), WOOD, x, y0 + .76, z); [[-.65, -.35], [.65, -.35], [-.65, .35], [.65, .35]].forEach(o => add(B(.07, .76, .07), WOOD2, x + o[0], y0 + .38, z + o[1]));
    add(B(.55, .45, .55), M(0x3A2A20), x, y0 + .22, z - .8); add(B(.3, .06, .22), BOOK[2], x + .4, y0 + .83, z + .1); });
  // 季報書房 看板（後牆中央）
  const X = 3.2, Z = -9.68, BW = 3.4, BH = 1.9, cv = D.createElement('canvas'); cv.width = 1024; cv.height = 572; const g = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  add(B(BW + .16, BH + .16, .06), WOOD, X, y0 + 2.2, Z);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); face.position.set(X, y0 + 2.2, Z + .04); grp.add(face);
  add(B(BW + .4, .5, .08), WOOD2, X, y0 + 3.5, Z); // 招牌
  const sc = D.createElement('canvas'); sc.width = 512; sc.height = 64; const s2 = sc.getContext('2d'); s2.fillStyle = '#3A2414'; s2.fillRect(0, 0, 512, 64); s2.fillStyle = '#E9C77B'; s2.font = 'bold 40px "Noto Serif TC","Noto Sans TC",serif'; s2.textAlign = 'center'; s2.fillText('季報書房', 256, 46);
  const st2 = new THREE.CanvasTexture(sc); st2.colorSpace = THREE.SRGBColorSpace; const sg = new THREE.Mesh(new THREE.PlaneGeometry(BW + .3, .42), new THREE.MeshBasicMaterial({ map: st2, toneMapped: false })); sg.position.set(X, y0 + 3.5, Z + .05); grp.add(sg);
  const STEPS = ['資料整理', '試算', '核對', '待核准', '已完成'];
  const data = { mock: 1, quarter: '2026 第 3 季', step: +(Q.get('qs') || 2), updated: '10/26 17:00（台灣時間）', note: '本季資料已整理完成，正在核對中。' };
  (function draw() { g.fillStyle = '#F3E9D6'; g.fillRect(0, 0, 1024, 572); g.fillStyle = '#7A4E2D'; g.fillRect(0, 0, 1024, 10); g.fillRect(0, 562, 1024, 10);
    g.fillStyle = '#3A2414'; g.font = 'bold 50px "Noto Serif TC","Noto Sans TC",serif'; g.fillText('季報書房', 50, 82);
    g.font = 'bold 40px "Noto Sans TC",sans-serif'; g.fillStyle = '#8C2F2A'; g.fillText(data.quarter, 330, 82);
    g.fillStyle = '#B5651D'; g.fillRect(830, 38, 150, 54); g.fillStyle = '#fff'; g.font = 'bold 30px "Noto Sans TC",sans-serif'; g.fillText('預覽', 875, 76);
    const x0 = 90, dx = 210, yy = 210; g.lineWidth = 8;
    STEPS.forEach((t, i) => { const x = x0 + i * dx, done = i < data.step, cur = i === data.step;
      if (i) { g.strokeStyle = i <= data.step ? '#2F5D50' : '#CDBFA6'; g.beginPath(); g.moveTo(x - dx + 34, yy); g.lineTo(x - 34, yy); g.stroke(); }
      g.beginPath(); g.arc(x, yy, 30, 0, 7); g.fillStyle = done ? '#2F5D50' : cur ? '#C9A24E' : '#E4D8C2'; g.fill();
      g.fillStyle = done || cur ? '#fff' : '#8A7B66'; g.font = 'bold 28px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.fillText(done ? '✓' : String(i + 1), x, yy + 10);
      g.fillStyle = cur ? '#8C2F2A' : '#3A2414'; g.font = (cur ? 'bold ' : '') + '28px "Noto Sans TC",sans-serif'; g.fillText(t, x, yy + 72); g.textAlign = 'left'; });
    g.fillStyle = '#3A2414'; g.font = '30px "Noto Sans TC",sans-serif'; g.fillText('目前階段：' + STEPS[data.step], 50, 380); g.fillText('更新：' + data.updated, 50, 430);
    g.fillText('簡述：' + data.note, 50, 480); g.fillStyle = '#8A7B66'; g.font = '22px "Noto Sans TC",sans-serif'; g.fillText('測試資料（預覽）　只顯示進度與簡述', 50, 535); tex.needsUpdate = true; })();
  const set = (t, p) => { controls.minDistance = 1; target.copy(t); camPos.copy(p); camera.position.copy(p); controls.target.copy(t); };
  if (SHOT === 'q5' || SHOT === 'qb') syncBtn('5F');
  if (SHOT === 'q5') set(new THREE.Vector3(1, y0 + 1.4, -2), new THREE.Vector3(1.5, y0 + 4.2, 15));
  if (SHOT === 'qb') set(new THREE.Vector3(X, y0 + 2.1, Z), new THREE.Vector3(X + .3, y0 + 2.3, Z + 7.5));
}
// 預覽截圖時同步樓層按鈕亮起狀態（避免拉近 5F 時「全景」仍亮）
export function syncBtn(f) { document.querySelectorAll('#fbar button').forEach(x => x.classList.toggle('on', x.dataset.f === f)); }
