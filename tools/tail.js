
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
const IM = {}; ['torso', 'head', 'legL', 'legR', 'armL', 'armR'].forEach(k => { const p = PART[k.replace(/[LR]$/, '')]; const im = new THREE.InstancedMesh(p[0], new THREE.MeshStandardMaterial({ roughness: .9, flatShading: true }), NP); im.castShadow = true; im.frustumCulled = false; IM[k] = im; scene.add(im); });
const AREA = { '1F': { x: [-12.5, 12.5], z: [-3.5, 8.5] }, up: { x: [-12, 12], z: [3, 8] } };
const rnd = (a, b) => a + Math.random() * (b - a);
const FL = ['1F', '1F', '1F', '1F', '1F', '1F', '1F', '1F']; // grey ambient visitors: 1F lobby only (user: none on 2F+)
function pick(p) { const A = p.fid === '1F' ? AREA['1F'] : AREA.up; return [rnd(A.x[0], A.x[1]), rnd(A.z[0], A.z[1])]; }
for (let i = 0; i < NP; i++) { const p = { fid: FL[i], sc: 1.15, ph: Math.random() * 6, pause: rnd(0, 3) }; const q = pick(p); p.x = q[0]; p.z = q[1]; p.to = pick(p); p.ry = 0; p.y = floorY[p.fid] + T; PEOPLE.push(p);
  const c = new THREE.Color(SKIN[i]), d = new THREE.Color(SKIN[i]).multiplyScalar(.7); Object.keys(IM).forEach(k => IM[k].setColorAt(i, /leg/.test(k) ? d : c)); }
const o3 = new THREE.Object3D(), pv = new THREE.Object3D(); o3.add(pv);
function place(im, i, p, lx, ly, swing, part) { o3.position.set(p.x, p.y, p.z); o3.rotation.set(0, p.ry, 0); o3.scale.setScalar(p.sc); const h = PART[part][0].parameters.height;
  pv.position.set(lx, ly + h, 0); pv.rotation.set(swing, 0, 0); pv.updateMatrix(); o3.updateMatrix(); const m = new THREE.Matrix4().makeTranslation(0, -h / 2, 0); im.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(o3.matrix, pv.matrix).multiply(m)); }
const ROSTER_FALLBACK = {"residents": [{"id": "mira", "floor": 3, "desk": 1, "skin": "mira"}, {"id": "vera", "floor": 3, "desk": 2, "skin": "vera"}, {"id": "stylist", "floor": 3, "desk": 4, "skin": "stylist"}, {"id": "contract", "floor": 3, "desk": 5, "skin": "contract"}, {"id": "fx", "floor": 3, "desk": 7, "skin": "fx", "scale": 0.5}, {"id": "nova", "floor": 3, "desk": 8, "skin": "nova"}]};
const FLOOR_ID = { 1: '1F', 2: '2F', 3: '3F', 4: 'RF' }, RES = [];
const SKIN_UV = { head: [0, 0, 8, 8, 8], hat: [32, 0, 8, 8, 8], body: [16, 16, 8, 12, 4], jacket: [16, 32, 8, 12, 4], rarm: [40, 16, 4, 12, 4], rsleeve: [40, 32, 4, 12, 4],
  larm: [32, 48, 4, 12, 4], lsleeve: [48, 48, 4, 12, 4], rleg: [0, 16, 4, 12, 4], rpants: [0, 32, 4, 12, 4], lleg: [16, 48, 4, 12, 4], lpants: [0, 48, 4, 12, 4] };
function skinGeo(key, w, h, d, inf, px, oy) { const [u, v, W, H, D] = SKIN_UV[key], g = new THREE.BoxGeometry((w + inf * 2) * px, (h + inf * 2) * px, (d + inf * 2) * px);
  const fr = { L: [u + D + W, v + D, D, H], R: [u, v + D, D, H], T: [u + D, v, W, D], D: [u + D + W, v, W, D], F: [u + D, v + D, W, H], B: [u + 2 * D + W, v + D, W, H] }, uv = g.attributes.uv;
  ['L', 'R', 'T', 'D', 'F', 'B'].forEach((k, i) => { const [x, y, ww, hh] = fr[k], u0 = x / 64, u1 = (x + ww) / 64, v0 = 1 - y / 64, v1 = 1 - (y + hh) / 64;
    [[u0, v0], [u1, v0], [u0, v1], [u1, v1]].forEach((q, j) => uv.setXY(i * 4 + j, q[0], q[1])); });
  g.translate(0, oy * px, 0); return g; }
function part(base, over, px, oy, w, h, d, ox) { const g = mergeGeometries([skinGeo(base, w, h, d, 0, px, oy), skinGeo(over, w, h, d, over === 'hat' ? .5 : .25, px, oy)], true); return g; }
const SKTEX = {};
function skinMats(id) { if (!SKTEX[id]) { const uri = SKINS[id]; if (!uri) return null; const tex = new THREE.TextureLoader().load(uri); tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false; tex.colorSpace = THREE.SRGBColorSpace;
    const base = new THREE.MeshLambertMaterial({ map: tex }), over = new THREE.MeshLambertMaterial({ map: tex, alphaTest: .5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }); SKTEX[id] = [base, over]; }
  return SKTEX[id]; }
const BPX = 1.9 / 32; // full height 32 px = 1.9 m (same as the other people)
function buildBlock(id, scale) { const M0 = skinMats(id); if (!M0) return null; const M = M0.map(m => m.clone()); const px = BPX * scale, g = new THREE.Group(), mk = (geo, par, x, y) => { const m = new THREE.Mesh(geo, M); m.castShadow = true; const pv = new THREE.Group(); pv.position.set(x, y, 0); pv.add(m); par.add(pv); return pv; };
  const r = {}; r.torso = mk(part('body', 'jacket', px, 6, 8, 12, 4), g, 0, 12 * px); r.head = mk(part('head', 'hat', px, 4, 8, 8, 8), g, 0, 24 * px);
  r.legR = mk(part('rleg', 'rpants', px, -6, 4, 12, 4), g, -2 * px, 12 * px); r.legL = mk(part('lleg', 'lpants', px, -6, 4, 12, 4), g, 2 * px, 12 * px);
  r.armR = mk(part('rarm', 'rsleeve', px, -4, 4, 12, 4), g, -6 * px, 22 * px); r.armL = mk(part('larm', 'lsleeve', px, -4, 4, 12, 4), g, 6 * px, 22 * px);
  g.userData.rig = r; g.userData.M = M; g.userData.px = px; scene.add(g); return g; }
function setRoster(r) { const list = ((r && r.residents) || []).filter(a => a && (a.skin || a.id) && FLOOR_ID[a.floor] && floorY[FLOOR_ID[a.floor]] !== undefined).slice(0, RMAX);
  RES.forEach(p => { p.tag.remove(); if (p.bub) p.bub.remove(); if (p.sayEl) p.sayEl.remove(); if (p.g) scene.remove(p.g); }); RES.length = 0;
  list.forEach((a, j) => { const fid = FLOOR_ID[a.floor], d = deskPos(+a.desk || 0), sc = +a.scale || 1;
    const p = { res: true, id: String(a.id || a.skin || ''), want: null, dim: 0, fid, sc, ph: Math.random() * 6, home: [d[0], d[1] - .8], x: d[0], z: d[1] - .8, ry: 0, y: floorY[fid] + T, seat: 1, sitT: rnd(10, 30), to: null, pause: 0 };
    p.g = buildBlock(a.skin || a.id, sc);
    const tag = document.createElement('div'); tag.className = 'ntag'; box.appendChild(tag); p.tag = tag;
    const bub = document.createElement('div'); bub.className = 'bub'; box.appendChild(bub); p.bub = bub; RES.push(p); });
  RES.forEach(p => { p.bubT = ''; }); if (LAST_ST) applyStatus(LAST_ST); }
function poseBlock(p, m, t) { const g = p.g, R = g.userData.rig, px = g.userData.px; let sw = 0; g.position.set(p.x, p.y, p.z); g.rotation.y = p.ry;
  ['torso', 'head', 'legL', 'legR', 'armL', 'armR'].forEach(k => R[k].rotation.set(0, 0, 0));
  if (m === 'sit' || m === 'rest' || m === 'msit') { const ty = m === 'sit' ? Math.sin(t * 9 + p.ph) * .12 : 0; g.position.y = p.y + .5 - 12 * px; R.legL.rotation.x = R.legR.rotation.x = -1.5;
    if (m === 'rest') { R.armL.rotation.x = R.armR.rotation.x = -.35 + Math.sin(t * 1.3 + p.ph) * .04; R.head.rotation.y = Math.sin(t * .4 + p.ph) * .3; }
    else if (m === 'msit') { R.armL.rotation.x = -.7; R.armR.rotation.x = -.7 + Math.max(0, Math.sin(t * 2.2 + p.ph)) * -.6; R.head.rotation.x = Math.sin(t * 1.1 + p.ph) * .08; }
    else { R.armL.rotation.x = -.9 + ty; R.armR.rotation.x = -.9 - ty; } return; }
  if (m === 'talk') { g.position.y = p.y; const k = Math.sin(t * 2.4 + p.ph); R.armR.rotation.x = -.5 + Math.max(0, k) * -.7; R.armR.rotation.z = .15; R.armL.rotation.x = -.2 + Math.max(0, -k) * -.4; R.head.rotation.x = Math.sin(t * 1.5 + p.ph) * .1; return; }
  if (m === 'walk') sw = Math.sin(t * 7 + p.ph) * .5; else g.position.y = p.y + Math.sin(t * 1.6 + p.ph) * .01;
  R.legL.rotation.x = sw; R.legR.rotation.x = -sw; R.armL.rotation.x = -sw * .8; R.armR.rotation.x = sw * .8; }
// live status (v5). want: 'work' = solo job, sits at own desk typing; 'meet' = discussion; 'idle' = no job: rests at desk and now and then
// wanders (same floor, other office floors or the lobby, via the lifts), then returns. Rounds/2h timeout are decided by the backend.
// 2 people: meet by a desk on the same floor; different floors -> the lower one goes up to the higher one's desk.
// 3+: the meeting table on the highest member floor (6 chairs, extras stand around it). A new goal never cuts a walk: it applies at the next stop.
let LAST_ST = null;
let LAST_NM = null;
const OFFICE_FIDS = ['2F', '3F', 'RF'], MT = [7, -2], AISLE = [-9, -6, -3];
const MCH = [[5.6, -3.1, 0], [7, -3.1, 0], [8.4, -3.1, 0], [5.6, -.9, Math.PI], [7, -.9, Math.PI], [8.4, -.9, Math.PI]];
const MST = [[4.25, -2, Math.PI / 2], [9.75, -2, -Math.PI / 2], [4.5, -3.9, .8], [9.5, -3.9, -.8], [4.5, -.1, 2.3], [9.5, -.1, -2.3], [7, -4.3, 0], [7, .3, Math.PI], [5.6, -4.4, .3], [8.4, -4.4, -.3]];
const DOPEN = {};
function doorOpen(fid, sd) { DOPEN[fid + sd] = 2.6; }
function doorTick(dt) { Object.keys(DOPEN).forEach(k => { const fid = k.slice(0, 2), sd = +k.slice(2), L = DOORS[fid]; if (!L) { delete DOPEN[k]; return; } DOPEN[k] -= dt; const D0 = L[sd < 0 ? 0 : 1], o = DOPEN[k] > 0 ? Math.min(1, (2.6 - DOPEN[k]) * 3, DOPEN[k] * 3) : 0;
  D0.pan.forEach((q, i) => { q.position.x = sd * ELEV_X + (i ? 1 : -1) * (.21 + .4 * o); }); doorSync(fid); if (DOPEN[k] <= 0) delete DOPEN[k]; }); }
// 1F coffee counter (outside the entrance, lobby is full): one box counter + one box machine (24 tris). Cup = 1 tiny box carried in the right hand.
const CAFE = [0, 0], OUTSET = new THREE.Group(); OUTSET.position.set(19.5, 0, 2); OUTSET.rotation.y = Math.PI / 2; OUTSET.name = 'OUTDOOR_COFFEE_DECOR'; scene.add(OUTSET); // decor only, right side of the building, facing it
const ICAFE = { pick: [11.5, -6.6], q: [[10.9, -5.4], [10.9, -4.2], [10.9, -3.0]], barista: [11.5, -8.6] }; // existing indoor counter (1F right-rear)
const CUPG = B(.09, .12, .09), CUPM = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
{ const y = floorY['1F'], g = new THREE.Group(); const c = new THREE.Mesh(B(2.4, 1.05, .6), new THREE.MeshLambertMaterial({ color: 0xF08A24 })); c.position.set(CAFE[0], y + .52, CAFE[1] + .55); c.castShadow = true; g.add(c);
  const mm = new THREE.Mesh(B(.45, .5, .35), new THREE.MeshLambertMaterial({ color: 0x2F6FB3 })); mm.position.set(CAFE[0] + .95, y + 1.3, CAFE[1] + .6); g.add(mm); g.name = 'CAFE_OUT'; OUTSET.add(g); }
{ // food truck behind the coffee counter: 7 boxes + 4 wheel boxes (~132 tris), blue/white/orange
  const y = floorY['1F'], g = new THREE.Group(), M = c => new THREE.MeshLambertMaterial({ color: c }), tx = CAFE[0], tz = CAFE[1] + 4.3;
  [[4.4, 1.9, 2.1, 0, 1.45, 0, 0xF4F6F9], [4.42, .45, 2.12, 0, .62, 0, 0x2F6FB3], [1.3, 1.2, 2.0, 2.75, 1.0, 0, 0x2F6FB3], [2.6, .9, .04, -.3, 1.75, -1.06, 0x1B2430],
   [2.9, .08, .7, -.3, 2.3, -1.38, 0xF08A24], [4.42, .12, 2.12, 0, 2.42, 0, 0xF08A24], [1.0, .5, .04, 2.75, 1.25, -1.01, 0x9fc8ee]].forEach(q => { const m = new THREE.Mesh(B(q[0], q[1], q[2]), M(q[6])); m.position.set(tx + q[3], y + q[4], tz + q[5]); m.castShadow = true; g.add(m); });
  [[-1.4, -1], [1.4, -1], [-1.4, 1], [2.7, -1], [2.7, 1], [1.4, 1]].slice(0, 4).forEach(w => { const m = new THREE.Mesh(B(.6, .6, .25), M(0x22262E)); m.position.set(tx + w[0], y + .3, tz + w[1] * 1.0); g.add(m); });
  g.name = 'FOODTRUCK'; g.traverse(o => { if (o.isMesh) o.raycast = () => {}; }); OUTSET.add(g); }
function cupSet(p, on) { if (!p.g) return; if (on && !p.cupM) { p.cupM = new THREE.Mesh(CUPG, CUPM); p.cupM.position.set(0, -11 * p.g.userData.px, 2.5 * p.g.userData.px); p.g.userData.rig.armR.children[0].add(p.cupM); } if (p.cupM) p.cupM.visible = !!on; p.cup = !!on; }
function coffeeGoal(p) { const q = Math.floor(Math.random() * 3); return { fid: '1F', x: ICAFE.q[q][0], z: ICAFE.q[q][1], ry: Math.PI, act: 'look', cafe: 1 }; }
function busy(p) { return p.path.length > 0 || p.mode === 'wander' || p.mode === 'coffee' || (p.hold || 0) > 0; }
function rinit(p) { if (p.hf) return; p.hf = p.fid; p.mode = 'desk'; p.path = []; p.dim = 0; }
const fH = f => floorY[f];
function goal(p, g) { // g = {fid,x,z,ry,act:'sit'|'rest'|'msit'|'talk'|'look'}
  const k = g.fid + ':' + g.x.toFixed(2) + ':' + g.z.toFixed(2) + ':' + g.act; if (p.gk === k && !g.force) { p.queued = null; return; } if (!SHOT && busy(p) && !g.force) { p.queued = g; return; } p.gk = k; p.g2 = g;
  if (SHOT) { p.fid = g.fid; p.y = fH(g.fid) + T; p.x = g.x; p.z = g.z; p.ry = g.ry; p.act = g.act; p.path = []; p.seat = /sit|rest/.test(g.act) ? 1 : 0; return; }
  p.queued = null; if (!p.path.length) plan(p); else p.pend = 1; }
function plan(p) { const g = p.g2; p.pend = 0; p.path = [];
  if (p.fid === g.fid && Math.hypot(p.x - g.x, p.z - g.z) < .05) { p.act = g.act; p.ry = g.ry; p.seat = /sit|rest/.test(g.act) ? 1 : 0; return; } p.act = 'walk'; p.seat = 0;
  if (Math.hypot(p.x - p.home[0], p.z - p.home[1]) < .05 && p.fid === p.hf) p.path.push([p.home[0], p.home[1] + 1.1]); // stand up and step out
  if (g.fid !== p.fid) { const sd = p.x >= 0 ? 1 : -1, ex = sd * 13.4, sx = sd * ELEV_X; p.path.push([ex, .9], { door: p.fid, sd }, [sx, .9], [sx, 0], { lift: g.fid, sd }, [sx, .9], [ex, .9], [ex, 2.2]); }
  if (g.act === 'sit' || g.act === 'rest') p.path.push([g.x, g.z + 1.1]); else if (g.act === 'msit') p.path.push([g.x, g.z + (g.ry ? .6 : -.6)]);
  p.path.push([g.x, g.z]); }
function deskGoal(p, act) { return { fid: p.hf, x: p.home[0], z: p.home[1], ry: 0, act }; }
function wanderGoal(p) { if (Math.random() < .3 && !p.cup) { p.mode = 'coffee'; return coffeeGoal(p); } const r = Math.random(), fid = r < .65 ? p.hf : r < .9 ? OFFICE_FIDS[Math.floor(Math.random() * 3)] : '1F';
  const A = fid === '1F' ? { x: [-10, 10], z: [2, 7] } : { x: [-12, 11], z: [3, 7.5] }; return { fid, x: rnd(A.x[0], A.x[1]), z: rnd(A.z[0], A.z[1]), ry: rnd(-3, 3), act: 'look' }; }
function meetGoals(list) { // union-find over declared partners
  const P = {}, par = {}, f = a => par[a] === a ? a : (par[a] = f(par[a])), u = (a, b) => { par[a] = par[a] || a; par[b] = par[b] || b; par[f(a)] = f(b); };
  RES.forEach(p => { P[p.id] = p; }); const M = [];
  list.forEach(r => { if (r.state !== 'meet') return; const a = String(r.id).replace(/^home_/, ''); if (!P[a]) return; par[a] = par[a] || a; M.push(a);
    (r.with || []).forEach(w => { w = String(w).replace(/^home_/, ''); if (P[w]) u(a, w); }); });
  const USED = {}; const G = {}; Object.keys(par).forEach(a => { (G[f(a)] = G[f(a)] || []).push(a); }); const out = {};
  Object.values(G).forEach(ids => { ids.sort(); const ps = ids.map(i => P[i]); rinit(ps[0]); ps.forEach(rinit);
    const top = ps.reduce((a, b) => fH(b.hf) > fH(a.hf) ? b : a), fid = top.hf;
    if (ids.length >= 3) { ids.forEach((id, i) => { const c = i < MCH.length ? MCH[i] : MST[(i - MCH.length) % MST.length]; out[id] = { fid, x: c[0], z: c[1], ry: c[2], act: i < MCH.length ? 'msit' : 'talk' }; }); return; }
    if (ids.length === 1) { out[ids[0]] = deskGoal(P[ids[0]], 'sit'); return; }
    const [a, b] = ps; let x, z;
    if (a.hf === b.hf) { const mx = (a.home[0] + b.home[0]) / 2; x = AISLE.reduce((q, w) => Math.abs(w - mx) < Math.abs(q - mx) ? w : q); z = 2.7; }
    else { x = AISLE.reduce((q, w) => Math.abs(w - top.home[0]) < Math.abs(q - top.home[0]) ? w : q); z = 2.7; }
    while (USED[fid + ':' + x + ':' + z]) x += 1.6; USED[fid + ':' + x + ':' + z] = 1;
    out[a.id] = { fid, x: x - .5, z, ry: Math.PI / 2, act: 'talk' }; out[b.id] = { fid, x: x + .5, z, ry: -Math.PI / 2, act: 'talk' }; });
  return out; }
// team-view status indicator beside the name tag: colour dot + tiny icon. Set at once on every status update (even mid-performance).
const STI = { work: ['#2EAD5B', '⌨', '工作中'], meet: ['#2F80ED', '💬', '討論中'], idle: ['#9AA3AD', '☕', '待命'] };
function tagSet(p, nm, st) { const k = nm + '|' + st; if (p.tagK === k) return; p.tagK = k; p.tag.textContent = '';
  if (!nm) return; const n = document.createElement('span'); n.textContent = String(nm).slice(0, 20); p.tag.appendChild(n);
  if (STI[st]) { const i = document.createElement('span'); i.className = 'sti'; i.title = STI[st][2]; i.innerHTML = '<i style="background:' + STI[st][0] + '"></i>'; i.appendChild(document.createTextNode(STI[st][1])); p.tag.appendChild(i); } }
function applyStatus(list, names) { LAST_ST = list; if (names !== undefined) LAST_NM = names || null; const by = {}; (list || []).forEach(r => { by[String(r.id).replace(/^home_/, '')] = r; });
  const MG = meetGoals(list || []);
  RES.forEach(p => { rinit(p); const r = by[p.id] || {}; const nm = r.name || (LAST_NM && LAST_NM[p.id]) || ''; if (!r.id) { tagSet(p, nm, ''); p.bubT = ''; return; } tagSet(p, nm, nm ? (r.state === 'work' ? 'work' : r.state === 'meet' ? 'meet' : 'idle') : '');
    p.want = r.state === 'work' ? 'work' : r.state === 'meet' && MG[p.id] ? 'meet' : 'idle'; p.bubT = r.activity ? String(r.activity).slice(0, 18) : '';
    if (p.want === 'work') goal(p, deskGoal(p, 'sit')); else if (p.want === 'meet') goal(p, MG[p.id]);
    else if (SHOT && /wander/.test(Q.get('mock') || '') && (p.wg = p.wg || { fid: p.hf, x: rnd(-12, 11), z: rnd(2.6, 7), ry: rnd(-3, 3), act: 'look' })) goal(p, p.wg);
    else if (SHOT && Q.get('mock') === 'cmp' && p.id === 'vera') goal(p, { fid: '3F', x: -9.6, z: 3.4, ry: .5, act: 'look' });
    else if (SHOT && Q.get('mock') === 'coffee' && /^srg_0[1-4]$|^nova$/.test(p.id)) { const i = +p.id.slice(-1) || 0; goal(p, i % 4 === 0 ? { fid: '1F', x: ICAFE.pick[0], z: ICAFE.pick[1], ry: Math.PI, act: 'look' } : { fid: '1F', x: ICAFE.q[(i % 4) - 1][0], z: ICAFE.q[(i % 4) - 1][1], ry: Math.PI, act: 'look' }); if (i % 4 === 0) cupSet(p, 1); }
    else if (SHOT && Q.get('mock') === 'lift' && /^(vera|fx|srg_03)$/.test(p.id)) { const sd = p.id === 'srg_03' ? -1 : 1, k = { vera: 0, fx: 1, srg_03: 2 }[p.id]; goal(p, { fid: p.hf, x: sd * (ELEV_X - [1.2, .1, .05][k]), z: [.9, .2, .3][k], ry: [Math.PI / 2, 0, Math.PI][k], act: 'look' }); if (k) p.g.visible = true; doorOpen(p.hf, sd); DOPEN[p.hf + sd] = 1.3; doorTick(0); } else if (p.mode !== 'wander') goal(p, deskGoal(p, 'rest')); });
  // team-view speech bubbles: only residents in a meeting whose AI sent a say text (backend returns say only to team tokens)
  const GR = {}; RES.forEach(p => { const r = by[p.id] || {}; const mt = p.want === 'meet' && r.say ? r.say : r.msg; p.sayT = LAST_NM && mt ? String(mt).slice(0, 30) : ''; if (p.sayT) { const k = !(p.want === 'meet' && r.say) ? 'm:' + p.id : (MG[p.id] || {}).fid + ':' + Object.keys(MG).filter(i => MG[i].fid === (MG[p.id] || {}).fid).length; (GR[k] = GR[k] || []).push(p); } });
  Object.values(GR).forEach(l => l.forEach((p, i) => { p.sayOrd = i; p.sayN = l.length; }));
  if (SHOT) people(0, 0); }
window.P7_applyStatus = applyStatus;
function dimSync(p) { const ms = p.g && p.g.userData.M; if (!ms) return; const k = 1 - .68 * p.dim;
  ms.forEach(m => { m.color.setRGB(k, k, k * 1.08); }); }
function resStep(p, dt, t) { rinit(p);
  if (!p.g2) { p.g2 = deskGoal(p, p.want === undefined || p.want === null ? 'sit' : 'rest'); p.act = p.g2.act; p.seat = 1; }
  if (p === RES[0]) doorTick(dt); if (p.hold > 0) p.hold -= dt; if (SHOT) return p.path.length ? 'walk' : p.act;
  if (p.pause > 0) { p.pause -= dt; return 'idle'; }
  if (p.path.length) { const w = p.path[0];
    if (w.door) { doorOpen(w.door, w.sd); p.path.shift(); p.pause = .7; return 'idle'; }
    if (w.lift) { if (!p.inLift) { p.inLift = 1; p.g.visible = false; p.pause = 2.2; return 'idle'; } p.inLift = 0; p.g.visible = true; p.fid = w.lift; p.y = fH(w.lift) + T; doorOpen(w.lift, w.sd); p.path.shift(); p.pause = .7; p.ry = Math.PI; return 'idle'; }
    const dx = w[0] - p.x, dz = w[1] - p.z, d = Math.hypot(dx, dz);
    if (d < .06) { p.path.shift(); if (p.pend) { plan(p); return 'idle'; } if (!p.path.length) { p.x = w[0]; p.z = w[1]; p.ry = p.g2.ry; p.act = p.g2.act; p.seat = /sit|rest/.test(p.act) ? 1 : 0; p.stay = p.g2.cafe ? 5 : rnd(4, 9); p.sitT = rnd(25, 70); p.hold = 2.5; } return 'walk'; }
    const v = Math.min(d, .9 * dt); p.x += dx / d * v; p.z += dz / d * v; const ry = Math.atan2(dx, dz); p.ry += Math.atan2(Math.sin(ry - p.ry), Math.cos(ry - p.ry)) * Math.min(1, dt * 6); return 'walk'; }
  // arrived. idle: rest at desk; after a while wander (1-2 stops), then come back
  if (p.queued && (p.mode === 'desk' || !p.mode) && p.hold <= 0) { const q = p.queued; q.force = 1; goal(p, q); q.force = 0; return 'walk'; }
  if (p.mode === 'coffee' && p.act === 'look') { p.stay -= dt; if (p.stay <= 2.5 && !p.cup) cupSet(p, 1); if (p.stay <= 0) { p.mode = 'desk'; const q = p.queued; goal(p, Object.assign(q && /sit|rest/.test(q.act) ? q : deskGoal(p, 'rest'), { force: 1 })); if (q && !/sit|rest/.test(q.act)) p.queued = q; } return 'idle'; }
  if (p.cup && p.seat) { p.cupT = (p.cupT || 20) - dt; if (p.cupT <= 0) { cupSet(p, 0); p.cupT = 0; } }
  if (p.mode === 'wander' && p.act === 'look' && p.queued) { p.stay -= dt; if (p.stay <= 0) { p.mode = 'desk'; goal(p, Object.assign(p.queued, { force: 1 })); } return 'idle'; }
  if (p.want !== 'work' && p.want !== 'meet') {
    if (p.mode === 'wander' && p.act === 'look') { p.stay -= dt; if (p.stay <= 0) { if (Math.random() < .4) goal(p, Object.assign(wanderGoal(p), { force: 1 })); else { p.mode = 'desk'; goal(p, Object.assign(deskGoal(p, 'rest'), { force: 1 })); } } return 'idle'; }
    if (p.act === 'rest' || p.act === 'sit') { p.sitT -= dt; if (p.act === 'sit' && p.want === 'idle') { p.act = 'rest'; p.g2 = deskGoal(p, 'rest'); p.gk = ''; } if (p.sitT <= 0) { p.mode = 'wander'; goal(p, Object.assign(wanderGoal(p), { force: 1 })); } } }
  return p.act === 'look' ? 'idle' : p.act; }
function people(dt, t) { PEOPLE.concat(RES).forEach((p, i) => { let sw = 0;
  if (p.res) { const m = resStep(p, dt, t); if (p.g) poseBlock(p, m, t); return; }
  if (p.pause > 0) p.pause -= dt; else { const dx = p.to[0] - p.x, dz = p.to[1] - p.z, d = Math.hypot(dx, dz);
    if (d < .1) { p.pause = rnd(2, 6); p.to = pick(p); } else { const v = Math.min(d, .9 * dt); p.x += dx / d * v; p.z += dz / d * v; const ry = Math.atan2(dx, dz); p.ry += Math.atan2(Math.sin(ry - p.ry), Math.cos(ry - p.ry)) * Math.min(1, dt * 6); sw = Math.sin(t * 7 + p.ph) * .5; } }
  const br = sw ? 0 : Math.sin(t * 1.6 + p.ph) * .01;
  place(IM.torso, i, p, 0, .64 + br, 0, 'torso'); place(IM.head, i, p, 0, 1.3 + br, 0, 'head');
  place(IM.legL, i, p, -.13, 0, sw, 'leg'); place(IM.legR, i, p, .13, 0, -sw, 'leg');
  place(IM.armL, i, p, -.33, .66 + br, -sw * .8, 'arm'); place(IM.armR, i, p, .33, .66 + br, sw * .8, 'arm'); });
  Object.values(IM).forEach(im => { im.instanceMatrix.needsUpdate = true; }); }
const tv3 = new THREE.Vector3(); let LYSYNC = null;
function focusFid() { let best = null, by = -1e9; Object.keys(floorY).forEach(f => { const y = floorY[f]; if (y <= controls.target.y + .3 && y > by) { by = y; best = f; } }); return best; }
function tags() { if (LYSYNC) LYSYNC(); const ff = focusFid(); RES.forEach(p => { tv3.set(p.x, p.y + (p.seat ? .5 + 1.3 * p.sc : 2.05 * p.sc), p.z); const dist = camera.position.distanceTo(tv3); tv3.project(camera);
  const show = !!p.tag.textContent && dist < 45 && p.fid === ff && (SHOT !== 'close' || true) && tv3.z < 1; p.tag.style.display = show ? 'block' : 'none'; if (show) { p.tag.style.left = ((tv3.x + 1) / 2 * box.clientWidth) + 'px'; p.tag.style.top = ((1 - tv3.y) / 2 * box.clientHeight) + 'px'; }
  p.tag.style.opacity = p.dim > .5 ? .55 : 1;
  if (p.sayT && !p.sayEl) { p.sayEl = document.createElement('div'); p.sayEl.className = 'say'; box.appendChild(p.sayEl); }
  if (p.sayEl) { const on = show && p.sayT && (SHOT || Math.floor(performance.now() / 3500) % (p.sayN || 1) === (p.sayOrd || 0)); p.sayEl.style.display = on ? 'block' : 'none';
    if (on) { if (p.sayEl.textContent !== p.sayT) p.sayEl.textContent = p.sayT; p.sayEl.style.left = p.tag.style.left; p.sayEl.style.top = (parseFloat(p.tag.style.top) - 26 - (p.bubT ? 24 : 0)) + 'px'; } } if (!p.bub) return; const sb = show && p.bubT; p.bub.style.display = sb ? 'block' : 'none'; if (sb) { if (p.bub.textContent !== p.bubT) p.bub.textContent = p.bubT; p.bub.style.left = p.tag.style.left; p.bub.style.top = (parseFloat(p.tag.style.top) - 24) + 'px'; } }); }

const info = document.getElementById('info'); document.getElementById('ix').onclick = () => info.style.display = 'none';
const ray = new THREE.Raycaster(), mv = new THREE.Vector2(); let down = null;
renderer.domElement.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
renderer.domElement.addEventListener('pointerup', e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; const r = renderer.domElement.getBoundingClientRect();
  mv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(mv, camera);
  if (document.body.classList.contains('team')) { // team mode: no visitor info; clicking a character opens its 今日紀錄
    const hit = ray.intersectObjects(RES.filter(p => p.g && p.g.visible).map(p => p.g), true)[0]; if (!hit) return;
    const p = RES.find(q => { let o = hit.object; while (o) { if (o === q.g) return true; o = o.parent; } return false; });
    if (p && window.P7_pick) { const r = (LAST_ST || []).find(x => String(x.id).replace(/^home_/, '') === p.id); window.P7_pick(r ? r.id : p.id); } return; }
  if (ray.intersectObject(world, true).length) info.style.display = 'block'; });
window.P7_pickShot = id => { if (window.P7_pick) window.P7_pick(id); };

function resize() { const w = box.clientWidth || 800, h = box.clientHeight || 600; renderer.setSize(w, h, false); composer.setSize(w, h); bloom.resolution.set(w / 2, h / 2); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const clock = new THREE.Clock(); let last = 0;
setRoster(ROSTER_FALLBACK);
fetch('roster.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(r => { if (r && r.residents) { setRoster(r); people(0, 0); } }).catch(() => {});
for (let k = 0; k < 90; k++) people(1 / 30, k / 30);
function loop() { requestAnimationFrame(loop); const t = clock.getElapsedTime(), dt = Math.min(.1, t - last); last = t; if (!SHOT) people(dt, t); if (window.botStep) botStep(SHOT ? 0 : dt, SHOT ? 0 : t);
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

{ // floating robot butlers (NPC, not residents: no tags/status, not in backend). Geometry from site/butler_bot.json (v0.1).
  // chamferBox = 3 crossed boxes (36 tris, reads as a bevel); eyes: #FF8A1F standard + emissive 0.35 (below the bloom threshold).
  const MC = {}, mt = (c, m) => { const k = c + (m || ''); if (!MC[k]) MC[k] = m === 'eye' ? new THREE.MeshStandardMaterial({ color: 0xFF8A1F, emissive: 0xFF8A1F, emissiveIntensity: .35, roughness: .4 }) : new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: .55, metalness: 0 }); return MC[k]; };
  function geo(p) { const [w, h, d] = p.size;
    if (p.type === 'chamferBox') { const b = p.bevel || .05; return mergeGeometries([B(w, h - 2 * b, d - 2 * b), B(w - 2 * b, h, d - 2 * b), B(w - 2 * b, h - 2 * b, d)].map(g => { g.deleteAttribute('uv'); return g; })); }
    if (p.type === 'cyl8') return new THREE.CylinderGeometry(w / 2, w / 2, h, 8);
    if (p.type === 'wedge') { const g = new THREE.BufferGeometry(), x = w / 2, y = h / 2, z = d / 2, v = [[-x, y, z], [x, y, z], [0, -y, z], [-x, y, -z], [x, y, -z], [0, -y, -z]], ix = [0, 2, 1, 3, 4, 5, 0, 1, 4, 0, 4, 3, 1, 2, 5, 1, 5, 4, 2, 0, 3, 2, 3, 5];
      g.setAttribute('position', new THREE.Float32BufferAttribute(ix.flatMap(i => v[i]), 3)); g.computeVertexNormals(); return g; }
    const g = B(w, h, d); return g; }
  function bot(v) { const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const arms = [];
    v.parts.forEach(p => { const m = new THREE.Mesh(geo(p), mt(p.color, /^eye/.test(p.name) ? 'eye' : '')); m.position.fromArray(p.position); const r = p.rotation_deg || [0, 0, 0]; m.rotation.set(r[0] * Math.PI / 180, r[1] * Math.PI / 180, r[2] * Math.PI / 180); m.castShadow = true; m.raycast = () => {}; body.add(m); if (/^(arm|hand|armband)/.test(p.name)) arms.push([m, p.name.slice(-1), m.rotation.x]); });
    body.scale.setScalar(BOT_S); g.userData = { body, arms }; return g; }
  const BOTS = []; window.BOTS = BOTS; let BOT_S = 1; // one scale for all 4: top of head = resident height (1.9 m)
  const near = (fid, x, z, r) => RES.some(p => p.fid === fid && Math.hypot(p.x - x, p.z - z) < r);
  function ptarget(b) { for (let k = 0; k < 20; k++) { const x = rnd(-12, 11), z = rnd(-6.5, 7.5); if (!near(b.fid, x, z, 1.4) && !(x > 3.5 && x < 10.5 && z > -4.8 && z < .8) && !(x < -3.4 && z < 2)) return [x, z]; } return [rnd(-2, 2), rnd(3, 7)]; }
  fetch('butler_bot.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { if (!j || !j.variants) return;
    { let top = 0; Object.values(j.variants).forEach(v => v.parts.forEach(p => { top = Math.max(top, p.position[1] + p.size[1] / 2); })); BOT_S = 1.9 / top; }
    [['barista_1F', '1F'], ['patrol_2F', '2F'], ['patrol_3F', '3F'], ['patrol_4F', 'RF']].forEach(([k, fid], i) => { const v = j.variants[k]; if (!v || floorY[fid] === undefined) return;
      const b = { g: bot(v), fid, ph: i * 1.7, kind: i ? 'patrol' : 'barista', pause: rnd(1, 4) };
      if (!i) { b.x = ICAFE.barista[0]; b.z = ICAFE.barista[1]; b.ry = 0; b.y = 0; } else { b.y = floorY[fid] + T; const q = SHOT ? (Q.get('mock') === 'cmp' && fid === '3F' ? [-8.6, 3.4] : [1.5 + i, 4.2]) : ptarget(b); b.x = q[0]; b.z = q[1]; b.ry = SHOT ? -.5 : 0; b.to = ptarget(b); }
      scene.add(b.g); BOTS.push(b); });
    botStep(0, 0); document.title = 'STATS=' + JSON.stringify(stats()); }).catch(() => {});
  window.botStep = botStep;
  function botStep(dt, t) { BOTS.forEach(b => {
    if (b.kind === 'patrol' && dt) { if (b.pause > 0) b.pause -= dt; else { const dx = b.to[0] - b.x, dz = b.to[1] - b.z, d = Math.hypot(dx, dz);
        if (d < .1) { b.pause = rnd(2, 6); b.to = ptarget(b); } else { const v = Math.min(d, .55 * dt), nx = b.x + dx / d * v, nz = b.z + dz / d * v;
          if (near(b.fid, nx, nz, .9)) { b.pause = 1.2; b.to = ptarget(b); } else { b.x = nx; b.z = nz; const ry = Math.atan2(dx, dz); b.ry += Math.atan2(Math.sin(ry - b.ry), Math.cos(ry - b.ry)) * Math.min(1, dt * 3); } } } }
    const u = b.g.userData; b.g.position.set(b.x, b.y, b.z); b.g.rotation.y = b.ry + (b.kind === 'barista' ? Math.sin(t * .5 + b.ph) * .25 : 0);
    u.body.position.y = (SHOT ? 0 : 1) * Math.sin(t * 2 * Math.PI / 2.4 + b.ph) * .03;
    u.arms.forEach(([m, s, r0]) => { m.rotation.x = r0 + (b.kind === 'barista' && s === 'R' ? 0 : Math.sin(t * 1.8 + b.ph + (s === 'L' ? 0 : 1.5)) * .087); }); }); }
}
function stats() { let tris = 0, meshes = 0; scene.updateMatrixWorld(true); scene.traverse(x => { if (!x.isMesh || !x.visible || (x.material && x.material.visible === false)) return; meshes++; const g = x.geometry, n = (g.index ? g.index.count : g.attributes.position.count) / 3; tris += n * (x.isInstancedMesh ? x.count : 1); }); return { tris: Math.round(tris), meshes }; }
window.Tower = { stats, scene };
if (SHOT === 'close') { const y = floorY['3F']; controls.minDistance = 1; tweenT = 1; target.set(-7.5, y + .9, -2.6); camPos.set(-7.5, y + 3.4, 9.5); camera.position.copy(camPos); controls.target.copy(target); }
if (SHOT === 'floor3') { const y = floorY['3F']; controls.minDistance = 1; tweenT = 1; target.set(-7.5, y + 1.1, -1.5); camPos.set(-6.8, y + 3.6, 15.5); camera.position.copy(camPos); controls.target.copy(target); }
if (SHOT === 'lobby') { const y = floorY['1F']; controls.minDistance = 1; tweenT = 1; target.set(0, y + 2.8, 0); camPos.set(1.5, y + 3.8, 26); camera.position.copy(camPos); controls.target.copy(target); }
if (Q.get('az') !== null) { const az = +Q.get('az'), po = Math.min(1.55, +Q.get('pol')), d = +Q.get('dist'); tweenT = 1; controls.update(); const tg = controls.target.clone(); camera.position.set(tg.x + d * Math.sin(po) * Math.sin(az), tg.y + d * Math.cos(po), tg.z + d * Math.sin(po) * Math.cos(az)); camera.lookAt(tg); }
if (SHOT === 'bot1') { const y = floorY['1F']; controls.minDistance = 1; tweenT = 1; controls.minAzimuthAngle = -3; controls.maxAzimuthAngle = 3; target.set(11.5, y + 1.3, -8.3); camPos.set(10, y + 2.6, -3.8); camera.position.copy(camPos); controls.target.copy(target); }
if (SHOT === 'cmp') { const y = floorY['3F']; controls.minDistance = 1; tweenT = 1; target.set(-9.1, y + 1, 3.4); camPos.set(-9.1, y + 1.6, 8.6); camera.position.copy(camPos); controls.target.copy(target); }
if (SHOT === 'bot3') { const y = floorY['3F']; controls.minDistance = 1; tweenT = 1; target.set(3.5, y + 1.1, 4.2); camPos.set(2.8, y + 2.1, 9); camera.position.copy(camPos); controls.target.copy(target); }
if (SHOT === 'door') { const y = floorY['1F']; controls.minDistance = 1; tweenT = 1; controls.minAzimuthAngle = -3; controls.maxAzimuthAngle = 3; target.set(19, y + 1.2, 1); camPos.set(25, y + 7, 17); camera.position.copy(camPos); controls.target.copy(target); }
if (SHOT === 'cafe') { const y = floorY['1F']; controls.minDistance = 1; tweenT = 1; controls.minAzimuthAngle = -3; controls.maxAzimuthAngle = 3; target.set(11.3, y + 1.3, -6); camPos.set(5.5, y + 3.6, 1.5); camera.position.copy(camPos); controls.target.copy(target); }
for (const [s, f] of [['lift3', '3F'], ['lift2', '2F']]) if (SHOT === s) { const y = floorY[f]; controls.minDistance = 1; tweenT = 1; controls.minPolarAngle = .3; controls.minAzimuthAngle = -3; controls.maxAzimuthAngle = 3; target.set(s === 'lift2' ? -12.5 : 12.5, y + 1, .5); camPos.set(s === 'lift2' ? -6 : 6, y + 4, 10); camera.position.copy(camPos); controls.target.copy(target); }
for (const [s, f] of [['wide2', '2F'], ['wide3', '3F'], ['wide4', 'RF']]) if (SHOT === s) { const y = floorY[f]; controls.minDistance = 1; tweenT = 1; const cx = +(Q.get('cx') || -1.5), cd = +(Q.get('cd') || 20.5); target.set(cx, y + 1.1, -1.5); camPos.set(cx, y + 4.6, cd); camera.position.copy(camPos); controls.target.copy(target); }
if (SHOT === 'info') info.style.display = 'block';
document.title = 'STATS=' + JSON.stringify(stats());
loop();
