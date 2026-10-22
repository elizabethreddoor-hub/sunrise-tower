{ // SRG team (16 external members): 8 on 2F, 8 on 4F, on the standard 3x3 desk grid. Skins used exactly as submitted; gold member lanyard is system-added geometry.
    const FID4 = { 2: '2F', 4: 'RF' }, desk4 = k => deskPos(k % 9);
  const GOLD = new THREE.MeshLambertMaterial({ color: 0xD4A944 });
  function lanyard(px) { const z = 2.35 * px, parts = [B(4 * px, 5 * px, .3 * px).translate(0, 5.5 * px, z)];
    [-1, 1].forEach(s => { const c = B(.5 * px, 4.6 * px, .25 * px); c.rotateZ(s * .35); c.translate(s * 1.6 * px, 10 * px, z); parts.push(c); });
    return mergeGeometries(parts.map(g => { g.deleteAttribute('uv'); return g; })); }
  const SIT = { '活潑': [8, 20], '專注': [30, 60], '悠閒': [15, 35] };
  const RES4 = []; let LY = null;
  function add4(r) { RES4.forEach(p => { p.tag.remove(); if (p.sayEl) p.sayEl.remove(); scene.remove(p.g); }); RES4.length = 0; if (LY) { scene.remove(LY); LY = null; }
    ((r && r.residents) || []).slice(0, 16).forEach(a => { if (!a || !/^srg_\d\d$/.test(a.skin || '')) return; SKINS[a.skin] = 'skins4f/' + a.skin + '.png';
      const F4 = FID4[a.floor] || 'RF', y4 = floorY[F4], d = desk4(+a.desk || 0), st = SIT[a.persona] || SIT['專注'];
      const p = { res: true, id: String(a.id || a.skin), fid: F4, sc: 1, ph: Math.random() * 6, home: [d[0], d[1] - .8], x: d[0], z: d[1] - .8, ry: 0, y: y4 + T, seat: 1, sitT: rnd(st[0], st[1]), to: null, pause: 0 };
      p.g = buildBlock(a.skin, 1); if (!p.g) return; 
      const tag = document.createElement('div'); tag.className = 'ntag'; box.appendChild(tag); p.tag = tag; RES4.push(p); });
    if (RES4.length) { LY = new THREE.InstancedMesh(lanyard(RES4[0].g.userData.px), GOLD, RES4.length); LY.frustumCulled = false; LY.castShadow = true; scene.add(LY); }
    RES.push(...RES4); if (LAST_ST || LAST_NM) applyStatus(LAST_ST || [], LAST_NM); }
  LYSYNC = () => { if (!LY) return; RES4.forEach((p, i) => LY.setMatrixAt(i, p.g.userData.rig.torso.matrixWorld)); LY.instanceMatrix.needsUpdate = true; };
  const _sr = setRoster; setRoster = r => { for (let i = RES.length - 1; i >= 0; i--) if (RES4.includes(RES[i])) RES.splice(i, 1); _sr(r); RES.push(...RES4); if (LAST_ST) applyStatus(LAST_ST); };
  fetch('roster_4f.json', { cache: 'no-store' }).then(x => x.ok ? x.json() : null).then(r => { if (r) { for (let i = RES.length - 1; i >= 0; i--) if (RES4.includes(RES[i])) RES.splice(i, 1); add4(r); people(0, 0); document.title = 'STATS=' + JSON.stringify(stats()) + ' R4=' + RES4.length; } }).catch(() => {});
}
for (const [s, f] of [['floor4', 'RF'], ['floor2', '2F']]) if (SHOT === s) { const y = floorY[f]; controls.minDistance = 1; tweenT = 1; target.set(-7.5, y + 1.1, -1.5); camPos.set(-6.8, y + 3.6, 15.5); camera.position.copy(camPos); controls.target.copy(target); }
if (false) { const y = floorY['RF']; controls.minDistance = 1; tweenT = 1; target.set(-6, y + 1.1, -.5); camPos.set(-5, y + 4.2, 17.5); camera.position.copy(camPos); controls.target.copy(target); }
