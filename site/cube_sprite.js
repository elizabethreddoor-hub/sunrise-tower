// 資料方塊精靈 v0.2 (外匯小精靈 FX / KOC小精靈 / 軟體工程精靈 ENG), clickable. Spec: cube_sprite.json. NPC-style floating sprites, 96 tris each.
// Eyes: emissive 0.35 (working 0.4), below bloom threshold 0.97 → no glow (same exception as butler).
export function initCubeSprites(ctx) {
  const { THREE, scene, floorY, T, deskPos, SHOT, Q, box: wrap } = ctx;
  const U = 0.15; // 1 spec unit = 0.15 m (main cube 2 units ≈ 30 cm)
  const box = (w, h, d) => new THREE.BoxGeometry(w * U, h * U, d * U); // 12 tris
  const std = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(c), roughness: .55, metalness: 0, flatShading: true }, o || {}));
  const SPR = []; window.CUBE_SPRITES = SPR;
  function make(pal, place) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const add = (geo, m, x, y, z, par) => { const o = new THREE.Mesh(geo, m); o.position.set(x * U, y * U, z * U); o.castShadow = true; o.raycast = () => {}; (par || body).add(o); return o; };
    const main = add(box(2, 2, 2), std(pal.body), 0, 0, 0); delete main.raycast; // main cube is the click target                                   // main 12
    add(box(1.44, 1.0, .06), std(pal.screen, { roughness: .3 }), 0, .1, 1.01);     // screen 12
    const eyeM = std(pal.eye, { emissive: new THREE.Color(pal.eye), emissiveIntensity: .35, roughness: .4 });
    const eyes = [-.34, .34].map(x => add(box(.24, .28, .04), eyeM, x, .14, 1.06)); // eyes 24
    const orb = new THREE.Group(); body.add(orb); const edgeM = std(pal.edge);
    const cubes = pal.orbit.map((c, i) => { const a = i * Math.PI / 2; return add(box(.44, .44, .44), std(c), Math.cos(a) * 1.9, 0, Math.sin(a) * 1.9, orb); }); // orbit 48
    void edgeM;
    const [x, z] = place.xz; g.position.set(x, floorY[place.fid] + T + place.h, z); g.rotation.y = place.ry || 0; scene.add(g);
    const s = { id: place.id || '', name: place.name || pal.name || '', fid: place.fid, main, g, body, orb, cubes, eyes, eyeM, ph: place.ph || 0, work: false, blinkAt: 4 + Math.random() * 2 };
    SPR.push(s); return s;
  }
  function step(t) {
    SPR.forEach(s => {
      const w = s.work, bobA = (w ? .12 : .24) * U, bobP = w ? 1.5 : 3, orbP = w ? 1.5 : 6;
      s.body.position.y = Math.sin(2 * Math.PI * (t + s.ph) / bobP) * bobA;
      s.orb.rotation.y = -2 * Math.PI * (t + s.ph) / orbP;
      s.cubes.forEach((c, i) => { c.position.y = Math.sin(2 * Math.PI * (t + s.ph) / orbP * 2 + i * Math.PI / 2) * .25 * U; c.rotation.set(t * .7 + i, t * .9 + i, 0); });
      s.eyeM.emissiveIntensity = w ? .4 : .35;
      let sy = 1; if (!SHOT) { if (t > s.blinkAt) { if (t > s.blinkAt + .15) s.blinkAt = t + 4 + Math.random() * 2; else sy = .15; } }
      s.eyes.forEach(e => e.scale.y = sy);
    });
  }
  fetch('cube_sprite.json', { cache: 'no-store' }).then(r => r.json()).then(j => {
    // v0.7：有專屬座位（7F 戰情室）的方塊精靈用座位位置與朝向（a.xz / a.ry，由 index.html setRoster 帶入）
    // positions come from roster.json entries with form:"cube" (index.html setRoster → P7_cubeRoster); fallback = old fixed 3F slots
    const FB = [{ id: 'fx', fid: '3F', desk: 7, palette: 'FX', name: '外匯小精靈' }, { id: 'koc', fid: '3F', desk: 6, palette: 'KOC', name: 'KOC小精靈' }];
    function build(list) { SPR.forEach(s => scene.remove(s.g)); SPR.length = 0;
      (list && list.length ? list : FB).forEach((a, i) => { const pal = j.palettes[a.palette]; if (!pal || floorY[a.fid] === undefined) return;
        make(pal, { id: a.id, name: a.name, fid: a.fid, xz: a.xz || deskPos(+a.desk || 0), h: 1.25, ry: a.ry || 0, ph: i * 1.3 }); });  if (window.P7_cubeRegister) window.P7_cubeRegister(SPR); }
    build(window.P7_CUBE_ROSTER); window.P7_cubeRoster = l => { build(l); step(+(Q.get('ct') || 0.6)); };
    // click: name tag bubble above the sprite for 4 s
    const tag = document.createElement('div'); tag.className = 'ntag'; (wrap || document.body).appendChild(tag); let tagS = null, tagT = 0; const tv = new THREE.Vector3();
    window.P7_cubeHit = ray => { const h = ray.intersectObjects(SPR.filter(s => s.g.visible).map(s => s.main), false)[0]; if (!h) return null; const s = SPR.find(q => q.main === h.object); tagS = s; tagT = performance.now() + 4000; tag.textContent = s.name; return { id: s.id, name: s.name }; };
    window.P7_cubeShow = id => { tagS = SPR.find(s => s.id === id) || null; tagT = performance.now() + 1e9; if (tagS) tag.textContent = tagS.name; };
    (function tagLoop() { requestAnimationFrame(tagLoop); if (!tagS || performance.now() > tagT || !ctx.camera) { tag.style.display = 'none'; return; }
      tagS.g.getWorldPosition(tv); tv.y += .35; tv.project(ctx.camera); if (tv.z >= 1) { tag.style.display = 'none'; return; } const el = wrap || document.body;
      tag.style.display = 'block'; tag.style.left = ((tv.x + 1) / 2 * el.clientWidth) + 'px'; tag.style.top = ((1 - tv.y) / 2 * el.clientHeight) + 'px'; })();
    const st = Q.get('cube'); if (st === 'work') SPR.forEach(s => s.work = true);
    step(+(Q.get('ct') || 0.6));
    const clock = new THREE.Clock(); (function loop() { requestAnimationFrame(loop); if (!SHOT || Q.get('anim')) step(clock.getElapsedTime()); })();
    if ((SHOT === 'cube' || SHOT === 'cube5') && ctx.camera) { const SF = SHOT === 'cube5' ? '5F' : '3F', sel = () => SPR.filter(q => q.fid === SF); const fixCam = () => { const L = sel(); if (!L.length) return; const m = new THREE.Vector3(); L.forEach(q => m.add(q.g.getWorldPosition(new THREE.Vector3()))); m.multiplyScalar(1 / L.length); ctx.target.copy(m); const g0 = L[0].g, f = new THREE.Vector3(0, 0, 1).transformDirection(g0.matrixWorld), r = new THREE.Vector3(1, 0, 0).transformDirection(g0.matrixWorld); ctx.camPos.copy(m).addScaledVector(f, 3.2).addScaledVector(r, 1.6); ctx.camPos.y += .6; ctx.controls.target.copy(m); ctx.camera.position.copy(ctx.camPos); ctx.controls.maxDistance = 200; ctx.controls.update(); };
      fixCam(); setInterval(fixCam, 200); }
    if (Q.get('cubetag')) setTimeout(() => window.P7_cubeShow(Q.get('cubetag')), 400);
    window.CUBE_READY = true;
  });
}
