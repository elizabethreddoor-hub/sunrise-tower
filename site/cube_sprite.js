// 資料方塊精靈 v0.1 (外匯小精靈 FX / KOC小精靈). Spec: cube_sprite.json. NPC-style floating sprites, 96 tris each.
// Eyes: emissive 0.35 (working 0.4), below bloom threshold 0.97 → no glow (same exception as butler).
export function initCubeSprites(ctx) {
  const { THREE, scene, floorY, T, deskPos, SHOT, Q } = ctx;
  const U = 0.15; // 1 spec unit = 0.15 m (main cube 2 units ≈ 30 cm)
  const box = (w, h, d) => new THREE.BoxGeometry(w * U, h * U, d * U); // 12 tris
  const std = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(c), roughness: .55, metalness: 0, flatShading: true }, o || {}));
  const SPR = []; window.CUBE_SPRITES = SPR;
  function make(pal, place) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const add = (geo, m, x, y, z, par) => { const o = new THREE.Mesh(geo, m); o.position.set(x * U, y * U, z * U); o.castShadow = true; o.raycast = () => {}; (par || body).add(o); return o; };
    add(box(2, 2, 2), std(pal.body), 0, 0, 0);                                   // main 12
    add(box(1.44, 1.0, .06), std(pal.screen, { roughness: .3 }), 0, .1, 1.01);     // screen 12
    const eyeM = std(pal.eye, { emissive: new THREE.Color(pal.eye), emissiveIntensity: .35, roughness: .4 });
    const eyes = [-.34, .34].map(x => add(box(.24, .28, .04), eyeM, x, .14, 1.06)); // eyes 24
    const orb = new THREE.Group(); body.add(orb); const edgeM = std(pal.edge);
    const cubes = pal.orbit.map((c, i) => { const a = i * Math.PI / 2; return add(box(.44, .44, .44), std(c), Math.cos(a) * 1.9, 0, Math.sin(a) * 1.9, orb); }); // orbit 48
    void edgeM;
    const [x, z] = place.xz; g.position.set(x, floorY[place.fid] + T + place.h, z); g.rotation.y = place.ry || 0; scene.add(g);
    const s = { g, body, orb, cubes, eyes, eyeM, ph: place.ph || 0, work: false, blinkAt: 4 + Math.random() * 2 };
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
    // FX: 3F desk 7 (existing roster slot of 外匯小精靈); KOC: 3F desk 6 (empty desk, no existing roster entry)
    const P = { FX: { fid: '3F', xz: deskPos(7), h: 1.25, ry: 0, ph: 0 }, KOC: { fid: '3F', xz: deskPos(6), h: 1.25, ry: 0, ph: 1.3 } };
    Object.entries(P).forEach(([k, p]) => { if (j.palettes[k] && floorY[p.fid] !== undefined) make(j.palettes[k], p); });
    const st = Q.get('cube'); if (st === 'work') SPR.forEach(s => s.work = true);
    step(+(Q.get('ct') || 0.6));
    const clock = new THREE.Clock(); (function loop() { requestAnimationFrame(loop); if (!SHOT || Q.get('anim')) step(clock.getElapsedTime()); })();
    if (SHOT === 'cube' && ctx.camera) { const y = floorY['3F'] + T; const fixCam = () => { const m = new THREE.Vector3(); SPR.forEach(q => m.add(q.g.getWorldPosition(new THREE.Vector3()))); m.multiplyScalar(1 / SPR.length); ctx.target.copy(m); const g0 = SPR[0].g, f = new THREE.Vector3(0, 0, 1).transformDirection(g0.matrixWorld), r = new THREE.Vector3(1, 0, 0).transformDirection(g0.matrixWorld); ctx.camPos.copy(m).addScaledVector(f, 3.2).addScaledVector(r, 1.6); ctx.camPos.y += .6; ctx.controls.target.copy(m); ctx.camera.position.copy(ctx.camPos); ctx.controls.maxDistance = 200; ctx.controls.update(); };
      fixCam(); setInterval(fixCam, 200); }
    window.CUBE_READY = true;
  });
}
