{ // 4F: SRG team (16 external members). Skins used exactly as submitted; gold member lanyard is system-added geometry.
  const F4 = 'RF', y4 = floorY[F4];
  const X4 = [-10.5, -7.5, -4.5, -1.5], Z4 = [-5.5, -2.2, 1.1, 4.4], desk4 = k => [X4[Math.floor(k / 4) % 4], Z4[k % 4]];
  const extra = []; for (let k = 0; k < 16; k++) { const d = desk4(k); if (!(DESK_X.includes(d[0]) && DESK_Z.includes(d[1]))) extra.push(d); }
  const dm = mat(0xFFFFFF), cm = DS(mat(0xF08A24)), o = new THREE.Object3D();
  const chG = mergeGeometries([new THREE.PlaneGeometry(.5, .5).rotateX(-Math.PI / 2).translate(0, .5, 0), new THREE.PlaneGeometry(.5, .5).translate(0, .75, .25)].map(g => { g.deleteAttribute('uv'); return g; }));
  [[B(1.6, .76, .8).translate(0, .38, 0), dm, 0, 0], [chG, cm, -.8, Math.PI]].forEach(([g, m, dz, ry]) => { const im = new THREE.InstancedMesh(g, m, extra.length);
    extra.forEach((d, i) => { o.position.set(d[0], y4, d[1] + dz); o.rotation.set(0, ry, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.castShadow = im.receiveShadow = true; world.add(im); });
  const GOLD = new THREE.MeshLambertMaterial({ color: 0xD4A944 });
  function lanyard(px) { const z = 2.35 * px, parts = [B(4 * px, 5 * px, .3 * px).translate(0, 5.5 * px, z)];
    [-1, 1].forEach(s => { const c = B(.5 * px, 4.6 * px, .25 * px); c.rotateZ(s * .35); c.translate(s * 1.6 * px, 10 * px, z); parts.push(c); });
    return mergeGeometries(parts.map(g => { g.deleteAttribute('uv'); return g; })); }
  const SIT = { '活潑': [8, 20], '專注': [30, 60], '悠閒': [15, 35] };
  const RES4 = [];
  function add4(r) { RES4.forEach(p => { p.tag.remove(); scene.remove(p.g); }); RES4.length = 0;
    ((r && r.residents) || []).slice(0, 16).forEach(a => { if (!a || !a.name || !/^srg_\d\d$/.test(a.skin || '')) return; SKINS[a.skin] = 'skins4f/' + a.skin + '.png';
      const d = desk4(+a.desk || 0), st = SIT[a.persona] || SIT['專注'];
      const p = { res: true, fid: F4, sc: 1, ph: Math.random() * 6, home: [d[0], d[1] - .8], x: d[0], z: d[1] - .8, ry: 0, y: y4 + T, seat: 1, sitT: rnd(st[0], st[1]), to: null, pause: 0 };
      p.g = buildBlock(a.skin, 1); if (!p.g) return; const ly = new THREE.Mesh(lanyard(p.g.userData.px), GOLD); p.g.userData.rig.torso.add(ly);
      const tag = document.createElement('div'); tag.className = 'ntag'; tag.textContent = String(a.name).slice(0, 20); box.appendChild(tag); p.tag = tag; RES4.push(p); });
    RES.push(...RES4); }
  const _sr = setRoster; setRoster = r => { for (let i = RES.length - 1; i >= 0; i--) if (RES4.includes(RES[i])) RES.splice(i, 1); _sr(r); RES.push(...RES4); };
  fetch('roster_4f.json', { cache: 'no-store' }).then(x => x.ok ? x.json() : null).then(r => { if (r) { for (let i = RES.length - 1; i >= 0; i--) if (RES4.includes(RES[i])) RES.splice(i, 1); add4(r); people(0, 0); document.title = 'STATS=' + JSON.stringify(stats()) + ' R4=' + RES4.length; } }).catch(() => {});
}
if (SHOT === 'floor4') { const y = floorY['RF']; controls.minDistance = 1; tweenT = 1; target.set(-6, y + 1.1, -.5); camPos.set(-5, y + 4.2, 17.5); camera.position.copy(camPos); controls.target.copy(target); }
