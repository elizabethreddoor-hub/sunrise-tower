// 合約價金 看板（3F 牆面）。所有人（含訪客）都看得到；只讀 contract_status（週別、燈號、更新時間、筆數），只有狀態與筆數。
// 燈號：PENDING 灰、YELLOW 黃、GREEN 綠、RED 一般警示紅慢閃。點看板展開摘要。不驅動任何角色動作。
export function initContractBoard(ctx) {
  const { THREE, scene, floorY, T, SHOT, Q, camera, controls, camPos, target } = ctx, D = document;
  const C = { PENDING: ['#8A8F98', '待確認'], YELLOW: ['#F2C230', '提醒中'], GREEN: ['#3FAE6A', '已鎖定'], RED: ['#E53935', '已逾期'] };
  const y0 = floorY['3F'] + T, X = -4.5, Z = -9.72, BW = 2.4, BH = 1.2;
  const cv = D.createElement('canvas'); cv.width = 768; cv.height = 384; const g2 = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const grp = new THREE.Group(); grp.name = 'CONTRACT_BOARD'; grp.visible = true; scene.add(grp);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(BW + .1, BH + .1, .05), new THREE.MeshStandardMaterial({ color: 0xC99A8A, roughness: .5 }));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  frame.position.set(X, y0 + 2.1, Z); face.position.set(X, y0 + 2.1, Z + .03); grp.add(frame, face);
  const lampM = new THREE.MeshBasicMaterial({ color: 0x8A8F98, toneMapped: false });
  const lamp = new THREE.Mesh(new THREE.CircleGeometry(.13, 24), lampM); lamp.position.set(X - BW / 2 + .3, y0 + 2.1 + .12, Z + .04); grp.add(lamp);
  let st = null;
  const fmt = s => { if (!s) return '—'; const d = new Date(s); if (isNaN(d)) return '—'; const p = n => String(n).padStart(2, '0');
    const t = new Date(d.getTime() + 8 * 36e5); return p(t.getUTCMonth() + 1) + '/' + p(t.getUTCDate()) + ' ' + p(t.getUTCHours()) + ':' + p(t.getUTCMinutes()) + '（台灣時間）'; };
  const wk = w => { const m = /W?(\d{1,2})$/.exec(String(w || '')); return m ? '第 ' + (+m[1]) + ' 週' : '本週'; };
  const cnt = o => '待複核 ' + (o.pending_review == null ? '—' : o.pending_review) + ' 筆　到期提醒 ' + (o.due_reminders == null ? '—' : o.due_reminders) + ' 則';
  function draw() { const o = st || { status: 'PENDING' }, c = C[o.status] || C.PENDING;
    g2.fillStyle = '#1B1418'; g2.fillRect(0, 0, 768, 384); g2.fillStyle = '#C99A8A'; g2.fillRect(0, 0, 768, 6);
    g2.fillStyle = '#EDE3DC'; g2.font = 'bold 40px "Noto Sans TC",sans-serif'; g2.fillText('合約價金', 150, 70);
    g2.font = 'bold 50px "Noto Sans TC",sans-serif'; g2.fillStyle = c[0]; g2.fillText(wk(o.week) + '｜' + c[1], 150, 150);
    g2.font = '30px "Noto Sans TC",sans-serif'; g2.fillStyle = '#EDE3DC'; g2.fillText('更新：' + fmt(o.updated), 40, 250); g2.fillText(cnt(o), 40, 305);
    g2.font = '22px "Noto Sans TC",sans-serif'; g2.fillStyle = '#9A8C86'; g2.fillText(o.mock ? '測試資料（預覽）　點一下看摘要' : '點一下看摘要', 40, 360);
    tex.needsUpdate = true; lampM.color.set(c[0]); if (st) window.dispatchEvent(new CustomEvent('p7-board-state', { detail: { status: o.status } })); }
  const pn = D.createElement('div'); pn.id = 'cbp';
  const css = D.createElement('style'); css.textContent = '#cbp{position:absolute;right:12px;top:12px;width:min(300px,calc(100% - 24px));background:rgba(27,20,24,.95);color:#EDE3DC;border:1px solid #C99A8A;border-radius:12px;z-index:8;font-size:14px;line-height:1.8;display:none}' +
    '#cbp h3{margin:0;padding:8px 12px;font-size:16px;border-bottom:1px solid rgba(201,154,138,.5);display:flex;justify-content:space-between}#cbp button{background:none;border:0;color:#EDE3DC;font-size:18px;cursor:pointer}#cbp .b{padding:8px 12px}#cbp .lp{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:6px;vertical-align:-1px}#cbp small{color:#9A8C86}';
  D.head.appendChild(css); D.body.appendChild(pn);
  function panel(open) { const o = st || { status: 'PENDING' }, c = C[o.status] || C.PENDING;
    pn.innerHTML = '<h3>合約價金 摘要<button title="關閉">×</button></h3><div class="b"><div><span class="lp" style="background:' + c[0] + '"></span>' + wk(o.week) + '｜' + c[1] + '</div>' +
      '<div>更新時間：' + fmt(o.updated) + '</div><div>待複核：' + (o.pending_review == null ? '—' : o.pending_review + ' 筆') + '</div><div>到期提醒：' + (o.due_reminders == null ? '—' : o.due_reminders + ' 則') + '</div>' +
      '<small>' + (o.mock ? '測試資料（預覽用）。' : '') + '只顯示狀態與筆數。</small></div>';
    pn.querySelector('button').onclick = () => panel(false); pn.style.display = open && grp.visible ? 'block' : 'none'; }
  const mockSt = SHOT && Q.get('cb');
  function load() {     if (mockSt) { st = { mock: 1, status: mockSt.toUpperCase(), week: '2026-W43', updated: '2026-10-24T03:30:00Z', pending_review: mockSt === 'green' ? 0 : 3, due_reminders: mockSt === 'red' ? 2 : mockSt === 'pending' ? null : 1 };
      if (mockSt === 'pending') st = { mock: 1, status: 'PENDING', week: '2026-W43', updated: '', pending_review: null, due_reminders: null }; draw(); if (Q.get('cbopen')) panel(true); return; }
    const url = (window.P7_STATUS || {}).contractBoardUrl; if (!url) return;
    fetch(url + '?action=contract_status', { cache: 'no-store' }).then(r => r.json()).then(j => { if (j && j.ok) { st = j; draw(); if (pn.style.display === 'block') panel(true); } }).catch(() => {}); }
  draw(); load(); setInterval(load, 60000); const prev = window.P7_teamChanged; window.P7_teamChanged = on => { if (prev) prev(on); load(); };
  const cvs = D.querySelector('#three canvas') || D.querySelector('canvas'), ray = new THREE.Raycaster(), mv = new THREE.Vector2(); let dn = null;
  cvs.addEventListener('pointerdown', e => dn = [e.clientX, e.clientY]);
  cvs.addEventListener('pointerup', e => { if (!grp.visible || !dn || Math.hypot(e.clientX - dn[0], e.clientY - dn[1]) > 6) return; const r = cvs.getBoundingClientRect();
    mv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(mv, camera); if (ray.intersectObject(face).length) panel(true); });
  (function blink() { requestAnimationFrame(blink); if (!st || st.status !== 'RED') { lamp.visible = true; return; } lamp.visible = SHOT ? true : (performance.now() % 1600) < 1000; })();
  if (SHOT === 'cb' && camera) { controls.minDistance = 1; target.set(X, y0 + 1.5, Z + 2); camPos.set(X + 1.2, y0 + 2.6, Z + 9.5); camera.position.copy(camPos); controls.target.copy(target); }
}
