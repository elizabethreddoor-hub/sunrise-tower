
const target = new THREE.Vector3(), camPos = new THREE.Vector3(); let tweenT = 1; const from = { p: new THREE.Vector3(), t: new THREE.Vector3() };
let towerH = 4 * FH;
function camHome(H) { towerH = H; const a = innerWidth / Math.max(1, innerHeight), tv = Math.tan(camera.fov * Math.PI / 360), th = tv * a; const dist = Math.max((H + 6) / 2 / tv, (W1 / 2 + 2) / th) + D1 / 2; setCam(new THREE.Vector3(0, (H + 4) / 2, 0), dist, true, a < 1); }
function setCam(t, dist, now, straight) { from.p.copy(camera.position); from.t.copy(controls.target); target.copy(t); camPos.set(straight ? 0 : t.x + dist * .12, t.y + dist * .05, t.z + dist); tweenT = now ? 1 : 0; if (now) { camera.position.copy(camPos); controls.target.copy(target); } }
controls.maxDistance = 260; camera.far = 1600; controls.maxPolarAngle = 1.55; camera.updateProjectionMatrix();
build([{ floor_id: 'RF' }, { floor_id: '3F' }, { floor_id: '2F' }, { floor_id: '1F' }]);
{ const OM = { desk: mat(0xFFFFFF), edge: mat(0xF08A24), chair: DS(mat(0xF08A24)), screen: mat(0x5A6B7D), pot: DS(mat(0xF4F6F9)), leaf: DS(mat(0x5E9E6A)), table: mat(0xF4F6F9) };
  const U = (parts) => mergeGeometries(parts.map(q => { const gg = q[0].index ? q[0].toNonIndexed() : q[0].clone(); gg.deleteAttribute('uv'); gg.deleteAttribute('normal'); gg.translate(q[1], q[2], q[3]); gg.computeVertexNormals(); return gg; }));
  const deskG = U([[B(1.6, .76, .8), 0, .38, 0]]), edgeG = B(1.6, .04, .02), chairG = U([[new THREE.PlaneGeometry(.5, .5).rotateX(-Math.PI / 2), 0, .5, 0], [new THREE.PlaneGeometry(.5, .5), 0, .75, .25]]), scrG = B(.6, .36, .04);
  const tableG = U([[B(4.2, .06, 1.6), 0, .74, 0], [B(2.8, .72, .3), 0, .36, 0]]), potG = XT(.5, .55), leafG = XT(1, 1.3, 1);
  const L = { desk: [], edge: [], chair: [], scr: [], table: [], pot: [], leaf: [] };
  OFFICE_FLOORS.forEach(y => { [-10.5, -7.5, -4.5].forEach(x => [-5.5, -2.2, 1.1].forEach(z => { L.desk.push([x, y, z, 0]); L.chair.push([x, y, z - .8, Math.PI]); }));
    L.table.push([7, y, -2, 0]); [[-1.4, -1.1, 0], [0, -1.1, 0], [1.4, -1.1, 0], [-1.4, 1.1, Math.PI], [0, 1.1, Math.PI], [1.4, 1.1, Math.PI]].forEach(c => L.chair.push([7 + c[0], y, -2 + c[1], c[2] === 0 ? Math.PI : 0]));
    [[-13, -7.5], [12.5, -7.5], [-13, 7.5], [12.5, 7.5]].forEach(p => { L.pot.push([p[0], y + .27, p[1], 0]); L.leaf.push([p[0], y + 1.2, p[1], .785]); }); });
  const o = new THREE.Object3D(); [[deskG, OM.desk, L.desk], [chairG, OM.chair, L.chair], [tableG, OM.table, L.table], [potG, OM.pot, L.pot], [leafG, OM.leaf, L.leaf]].forEach(([g, m, list]) => { const im = new THREE.InstancedMesh(g, m, list.length); list.forEach((p, i) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(0, p[3], 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.castShadow = true; im.receiveShadow = true; world.add(im); }); }

const DESK_X = [-10.5, -7.5, -4.5], DESK_Z = [-5.5, -2.2, 1.1], deskPos = k => [DESK_X[Math.floor(k / 3) % 3], DESK_Z[k % 3]];
const RMAX = 12, PEOPLE = [], NP = 8, SKIN = [0x8A8A8A, 0x9A968F, 0x7B7F84, 0xA3A3A3, 0x8E8A84, 0x6F7378, 0x989C9F, 0x85817B];
const PART = { torso: [B(.5, .62, .3), .95], head: [B(.36, .36, .36), 1.48], leg: [B(.2, .62, .22), .31], arm: [B(.15, .58, .17), .96] };
const IM = {}; ['torso', 'head', 'legL', 'legR', 'armL', 'armR'].forEach(k => { const p = PART[k.replace(/[LR]$/, '')]; const im = new THREE.InstancedMesh(p[0], new THREE.MeshStandardMaterial({ roughness: .9, flatShading: true }), NP + RMAX); im.castShadow = true; im.frustumCulled = false; IM[k] = im; scene.add(im); });
const AREA = { '1F': { x: [-12.5, 12.5], z: [-3.5, 8.5] }, up: { x: [-12, 12], z: [3, 8] } };
const rnd = (a, b) => a + Math.random() * (b - a);
const FL = ['1F', '1F', '1F', '1F', '1F', '2F', '2F', 'RF'];
function pick(p) { const A = p.fid === '1F' ? AREA['1F'] : AREA.up; return [rnd(A.x[0], A.x[1]), rnd(A.z[0], A.z[1])]; }
for (let i = 0; i < NP; i++) { const p = { fid: FL[i], sc: 1.15, ph: Math.random() * 6, pause: rnd(0, 3) }; const q = pick(p); p.x = q[0]; p.z = q[1]; p.to = pick(p); p.ry = 0; p.y = floorY[p.fid] + T; PEOPLE.push(p);
  const c = new THREE.Color(SKIN[i]), d = new THREE.Color(SKIN[i]).multiplyScalar(.7); Object.keys(IM).forEach(k => IM[k].setColorAt(i, /leg/.test(k) ? d : c)); }
const o3 = new THREE.Object3D(), pv = new THREE.Object3D(); o3.add(pv);
function place(im, i, p, lx, ly, swing, part) { o3.position.set(p.x, p.y, p.z); o3.rotation.set(0, p.ry, 0); o3.scale.setScalar(p.sc); const h = PART[part][0].parameters.height;
  pv.position.set(lx, ly + h, 0); pv.rotation.set(swing, 0, 0); pv.updateMatrix(); o3.updateMatrix(); const m = new THREE.Matrix4().makeTranslation(0, -h / 2, 0); im.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(o3.matrix, pv.matrix).multiply(m)); }
const ROSTER_FALLBACK = { residents: [
  { id: 'mira', name: 'Mira', floor: 3, desk: 1, style: { top: '#1F4E85', bottom: '#F4F6F9' } },
  { id: 'vera', name: 'Vera', floor: 3, desk: 2, style: { top: '#F08A24', bottom: '#1F4E85' } },
  { id: 'stylist', name: '造型師', floor: 3, desk: 4, style: { top: '#6FA6DA', bottom: '#F4F6F9' } },
  { id: 'contract', name: '合約管家', floor: 3, desk: 5, style: { top: '#F4F6F9', bottom: '#2F6FB3' } },
  { id: 'fx', name: '外匯小精靈', floor: 3, desk: 7, style: { top: '#FFB15C', bottom: '#4A8FD0' } },
  { id: 'nova', name: 'Nova', floor: 3, desk: 8, style: { top: '#2F6FB3', bottom: '#F08A24' } }] };
const FLOOR_ID = { 1: '1F', 2: '2F', 3: '3F', 4: 'RF' }, RES = [], HEADC = new THREE.Color(0xF1D9C4);
function setRoster(r) { const list = ((r && r.residents) || []).filter(a => a && a.name && FLOOR_ID[a.floor] && floorY[FLOOR_ID[a.floor]] !== undefined).slice(0, RMAX);
  RES.forEach(p => p.tag.remove()); RES.length = 0;
  list.forEach((a, j) => { const fid = FLOOR_ID[a.floor], d = deskPos(+a.desk || 0), st = a.style || {}, top = new THREE.Color(st.top || '#2F6FB3'), bot = new THREE.Color(st.bottom || '#F4F6F9');
    const p = { res: true, fid, sc: 1.15, ph: Math.random() * 6, home: [d[0], d[1] - .8], x: d[0], z: d[1] - .8, ry: 0, y: floorY[fid] + T, seat: 1, sitT: rnd(10, 30), to: null, pause: 0 };
    const tag = document.createElement('div'); tag.className = 'ntag'; tag.textContent = String(a.name).slice(0, 20); box.appendChild(tag); p.tag = tag; RES.push(p);
    const i = NP + j; IM.torso.setColorAt(i, top); IM.armL.setColorAt(i, top); IM.armR.setColorAt(i, top); IM.legL.setColorAt(i, bot); IM.legR.setColorAt(i, bot); IM.head.setColorAt(i, HEADC); });
  Object.values(IM).forEach(im => { im.count = NP + RES.length; if (im.instanceColor) im.instanceColor.needsUpdate = true; }); }
function resStep(p, dt, t) { // seated at desk; now and then stand, stroll a little, come back
  if (p.seat) { p.sitT -= dt; p.ry = 0; if (p.sitT <= 0 && !SHOT) { p.seat = 0; p.to = [p.home[0] + rnd(-2.5, 2.5), p.home[1] + rnd(3, 5.5)]; p.back = false; } return 'sit'; }
  if (p.pause > 0) { p.pause -= dt; return 'idle'; }
  const dx = p.to[0] - p.x, dz = p.to[1] - p.z, d = Math.hypot(dx, dz);
  if (d < .08) { if (p.back) { p.x = p.home[0]; p.z = p.home[1]; p.seat = 1; p.sitT = rnd(20, 45); return 'sit'; } p.back = true; p.pause = rnd(2, 4); p.to = [p.home[0], p.home[1] + 1.2]; return 'idle'; }
  if (p.back && Math.hypot(p.home[0] - p.x, p.home[1] + 1.2 - p.z) < .1) p.to = p.home.slice();
  const v = Math.min(d, .8 * dt); p.x += dx / d * v; p.z += dz / d * v; const ry = Math.atan2(dx, dz); p.ry += Math.atan2(Math.sin(ry - p.ry), Math.cos(ry - p.ry)) * Math.min(1, dt * 6); return 'walk'; }
function people(dt, t) { PEOPLE.concat(RES).forEach((p, i) => { let sw = 0;
  if (p.res) { const m = resStep(p, dt, t); const y0 = p.y; if (m === 'sit') { const ty = Math.sin(t * 9 + p.ph) * .12, oy = p.y; p.y = oy - .23;
      place(IM.torso, i, p, 0, .64, 0, 'torso'); place(IM.head, i, p, 0, 1.3, 0, 'head'); place(IM.legL, i, p, -.13, .02, -1.5, 'leg'); place(IM.legR, i, p, .13, .02, -1.5, 'leg');
      place(IM.armL, i, p, -.33, .66, -.9 + ty, 'arm'); place(IM.armR, i, p, .33, .66, -.9 - ty, 'arm'); p.y = oy; return; }
    if (m === 'walk') sw = Math.sin(t * 7 + p.ph) * .5; }
  else
  if (p.pause > 0) p.pause -= dt; else { const dx = p.to[0] - p.x, dz = p.to[1] - p.z, d = Math.hypot(dx, dz);
    if (d < .1) { p.pause = rnd(2, 6); p.to = pick(p); } else { const v = Math.min(d, .9 * dt); p.x += dx / d * v; p.z += dz / d * v; const ry = Math.atan2(dx, dz); p.ry += Math.atan2(Math.sin(ry - p.ry), Math.cos(ry - p.ry)) * Math.min(1, dt * 6); sw = Math.sin(t * 7 + p.ph) * .5; } }
  const br = sw ? 0 : Math.sin(t * 1.6 + p.ph) * .01;
  place(IM.torso, i, p, 0, .64 + br, 0, 'torso'); place(IM.head, i, p, 0, 1.3 + br, 0, 'head');
  place(IM.legL, i, p, -.13, 0, sw, 'leg'); place(IM.legR, i, p, .13, 0, -sw, 'leg');
  place(IM.armL, i, p, -.33, .66 + br, -sw * .8, 'arm'); place(IM.armR, i, p, .33, .66 + br, sw * .8, 'arm'); });
  Object.values(IM).forEach(im => { im.instanceMatrix.needsUpdate = true; }); }
const tv3 = new THREE.Vector3();
function tags() { RES.forEach(p => { tv3.set(p.x, p.y + (p.seat ? 1.55 : 1.85) * p.sc, p.z); const dist = camera.position.distanceTo(tv3); tv3.project(camera);
  const show = dist < 45 && tv3.z < 1; p.tag.style.display = show ? '' : 'none'; if (show) { p.tag.style.left = ((tv3.x + 1) / 2 * box.clientWidth) + 'px'; p.tag.style.top = ((1 - tv3.y) / 2 * box.clientHeight) + 'px'; } }); }

const info = document.getElementById('info'); document.getElementById('ix').onclick = () => info.style.display = 'none';
const ray = new THREE.Raycaster(), mv = new THREE.Vector2(); let down = null;
renderer.domElement.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
renderer.domElement.addEventListener('pointerup', e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; const r = renderer.domElement.getBoundingClientRect();
  mv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(mv, camera);
  if (ray.intersectObject(world, true).length) info.style.display = 'block'; });

function resize() { const w = box.clientWidth || 800, h = box.clientHeight || 600; renderer.setSize(w, h, false); composer.setSize(w, h); bloom.resolution.set(w / 2, h / 2); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const clock = new THREE.Clock(); let last = 0;
setRoster(ROSTER_FALLBACK);
fetch('roster.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(r => { if (r && r.residents) { setRoster(r); people(0, 0); } }).catch(() => {});
for (let k = 0; k < 90; k++) people(1 / 30, k / 30);
function loop() { requestAnimationFrame(loop); const t = clock.getElapsedTime(), dt = Math.min(.1, t - last); last = t; if (!SHOT) people(dt, t);
  if (tweenT < 1) { tweenT = Math.min(1, tweenT + .045); const k = 1 - Math.pow(1 - tweenT, 3); camera.position.lerpVectors(from.p, camPos, k); controls.target.lerpVectors(from.t, target, k); }
  controls.update(); if (camera.position.y < 1.2) { camera.position.y = 1.2; } tags(); composer.render(); }
{ // city skyline: flat silhouettes in 3 depths, unlit, no shadows, not clickable
  let sd = 7; const R = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const LAY = [{ z: -95, c: 0x1B3D66, hMin: 6, hMax: 20, w: [5, 11] }, { z: -150, c: 0x285886, hMin: 10, hMax: 32, w: [7, 15] }, { z: -220, c: 0x3C70A2, hMin: 14, hMax: 46, w: [9, 20] }];
  const WIN = []; const sky = new THREE.Group(); sky.name = 'SKYLINE';
  LAY.forEach((l, li) => { const parts = []; let x = -560;
    while (x < 560) { const w = l.w[0] + R() * (l.w[1] - l.w[0]), h = l.hMin + R() * (l.hMax - l.hMin), gap = R() < .25 ? 1 + R() * 3 : 0;
      const g = new THREE.PlaneGeometry(w, h + 8); g.translate(x + w / 2, (h + 8) / 2 - 8, l.z); parts.push(g);
      if (R() < .2) { const s = new THREE.PlaneGeometry(.5, 4 + R() * 5); s.translate(x + w / 2, h + 2, l.z); parts.push(s); }
      if (li === 0 && R() < .55) { const n = 1 + Math.floor(R() * 3); for (let k = 0; k < n; k++) WIN.push([x + 1 + R() * (w - 2), 1 + R() * (h - 2), l.z + .05]); }
      x += w + gap; }
    const m = new THREE.Mesh(mergeGeometries(parts), new THREE.MeshBasicMaterial({ color: l.c, fog: false })); m.renderOrder = -10 + li; m.raycast = () => {}; sky.add(m); });
  const wm = new THREE.InstancedMesh(new THREE.PlaneGeometry(.55, .75), new THREE.MeshBasicMaterial({ color: 0xE98A3A }), WIN.length); const o = new THREE.Object3D();
  WIN.forEach((p, i) => { o.position.set(p[0], p[1], p[2]); o.updateMatrix(); wm.setMatrixAt(i, o.matrix); }); wm.raycast = () => {}; sky.add(wm);
  scene.add(sky); }
{ // big ground: one 2-tri plane to the skyline and beyond; inner part keeps the plaza look, far part fades into fog
  const gm = new THREE.MeshStandardMaterial({ color: 0x3E4C5E, roughness: 1 });
  const gp = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400).rotateX(-Math.PI / 2), gm); gp.position.y = -.21; gp.receiveShadow = true; gp.raycast = () => {}; gp.name = 'GROUND_far'; scene.add(gp);
  scene.fog = new THREE.Fog(0x1B3D66, 300, 900); }
function stats() { let tris = 0, meshes = 0; scene.updateMatrixWorld(true); scene.traverse(x => { if (!x.isMesh || !x.visible || (x.material && x.material.visible === false)) return; meshes++; const g = x.geometry, n = (g.index ? g.index.count : g.attributes.position.count) / 3; tris += n * (x.isInstancedMesh ? x.count : 1); }); return { tris: Math.round(tris), meshes }; }
window.Tower = { stats, scene };
if (SHOT === 'floor3') { const y = floorY['3F']; controls.minDistance = 1; tweenT = 1; target.set(-7.5, y + 1.1, -1.5); camPos.set(-6.8, y + 3.6, 15.5); camera.position.copy(camPos); controls.target.copy(target); }
if (SHOT === 'lobby') { const y = floorY['1F']; controls.minDistance = 1; tweenT = 1; target.set(0, y + 2.8, 0); camPos.set(1.5, y + 3.8, 26); camera.position.copy(camPos); controls.target.copy(target); }
if (Q.get('az') !== null) { const az = +Q.get('az'), po = Math.min(1.55, +Q.get('pol')), d = +Q.get('dist'); tweenT = 1; controls.update(); const tg = controls.target.clone(); camera.position.set(tg.x + d * Math.sin(po) * Math.sin(az), tg.y + d * Math.cos(po), tg.z + d * Math.sin(po) * Math.cos(az)); camera.lookAt(tg); }
if (SHOT === 'info') info.style.display = 'block';
document.title = 'STATS=' + JSON.stringify(stats());
loop();
