
const target = new THREE.Vector3(), camPos = new THREE.Vector3(); let tweenT = 1; const from = { p: new THREE.Vector3(), t: new THREE.Vector3() };
let towerH = 4 * FH;
function camHome(H) { towerH = H; const a = innerWidth / Math.max(1, innerHeight); setCam(new THREE.Vector3(0, (H + 4) / 2, 0), a < 1 ? 82 / a : 88 + (innerWidth < 860 ? 30 : 0), true); }
function setCam(t, dist, now) { from.p.copy(camera.position); from.t.copy(controls.target); target.copy(t); camPos.set(t.x + dist * .12, t.y + dist * .05, t.z + dist); tweenT = now ? 1 : 0; if (now) { camera.position.copy(camPos); controls.target.copy(target); } }
build([{ floor_id: 'RF' }, { floor_id: '3F' }, { floor_id: '2F' }, { floor_id: '1F' }]);

const PEOPLE = [], NP = 8, SKIN = [0x8A8A8A, 0x9A968F, 0x7B7F84, 0xA3A3A3, 0x8E8A84, 0x6F7378, 0x989C9F, 0x85817B];
const PART = { torso: [B(.5, .62, .3), .95], head: [B(.36, .36, .36), 1.48], leg: [B(.2, .62, .22), .31], arm: [B(.15, .58, .17), .96] };
const IM = {}; ['torso', 'head', 'legL', 'legR', 'armL', 'armR'].forEach(k => { const p = PART[k.replace(/[LR]$/, '')]; const im = new THREE.InstancedMesh(p[0], new THREE.MeshStandardMaterial({ roughness: .9, flatShading: true }), NP); im.castShadow = true; im.frustumCulled = false; IM[k] = im; scene.add(im); });
const AREA = { '1F': { x: [-12.5, 12.5], z: [-3.5, 8.5] }, up: { x: [-6.8, 6.8], z: [-3.6, 4.6] } };
const rnd = (a, b) => a + Math.random() * (b - a);
const FL = ['1F', '1F', '1F', '1F', '1F', '2F', '3F', 'RF'];
function pick(p) { const A = p.fid === '1F' ? AREA['1F'] : AREA.up; return [rnd(A.x[0], A.x[1]), rnd(A.z[0], A.z[1])]; }
for (let i = 0; i < NP; i++) { const p = { fid: FL[i], sc: 1.15, ph: Math.random() * 6, pause: rnd(0, 3) }; const q = pick(p); p.x = q[0]; p.z = q[1]; p.to = pick(p); p.ry = 0; p.y = floorY[p.fid] + T; PEOPLE.push(p);
  const c = new THREE.Color(SKIN[i]), d = new THREE.Color(SKIN[i]).multiplyScalar(.7); Object.keys(IM).forEach(k => IM[k].setColorAt(i, /leg/.test(k) ? d : c)); }
const o3 = new THREE.Object3D(), pv = new THREE.Object3D(); o3.add(pv);
function place(im, i, p, lx, ly, swing, part) { o3.position.set(p.x, p.y, p.z); o3.rotation.set(0, p.ry, 0); o3.scale.setScalar(p.sc); const h = PART[part][0].parameters.height;
  pv.position.set(lx, ly + h / 2, 0); pv.rotation.set(swing, 0, 0); pv.updateMatrix(); o3.updateMatrix(); const m = new THREE.Matrix4().makeTranslation(0, -h / 2, 0); im.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(o3.matrix, pv.matrix).multiply(m)); }
function people(dt, t) { PEOPLE.forEach((p, i) => { let sw = 0;
  if (p.pause > 0) p.pause -= dt; else { const dx = p.to[0] - p.x, dz = p.to[1] - p.z, d = Math.hypot(dx, dz);
    if (d < .1) { p.pause = rnd(2, 6); p.to = pick(p); } else { const v = Math.min(d, .9 * dt); p.x += dx / d * v; p.z += dz / d * v; const ry = Math.atan2(dx, dz); p.ry += Math.atan2(Math.sin(ry - p.ry), Math.cos(ry - p.ry)) * Math.min(1, dt * 6); sw = Math.sin(t * 7 + p.ph) * .5; } }
  const br = sw ? 0 : Math.sin(t * 1.6 + p.ph) * .01;
  place(IM.torso, i, p, 0, .64 + br, 0, 'torso'); place(IM.head, i, p, 0, 1.3 + br, 0, 'head');
  place(IM.legL, i, p, -.13, 0, sw, 'leg'); place(IM.legR, i, p, .13, 0, -sw, 'leg');
  place(IM.armL, i, p, -.33, .66 + br, -sw * .8, 'arm'); place(IM.armR, i, p, .33, .66 + br, sw * .8, 'arm'); });
  Object.values(IM).forEach(im => { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }); }

const info = document.getElementById('info'); document.getElementById('ix').onclick = () => info.style.display = 'none';
const ray = new THREE.Raycaster(), mv = new THREE.Vector2(); let down = null;
renderer.domElement.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
renderer.domElement.addEventListener('pointerup', e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; const r = renderer.domElement.getBoundingClientRect();
  mv.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(mv, camera);
  if (ray.intersectObject(world, true).length) info.style.display = 'block'; });

function resize() { const w = box.clientWidth || 800, h = box.clientHeight || 600; renderer.setSize(w, h, false); composer.setSize(w, h); bloom.resolution.set(w / 2, h / 2); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const clock = new THREE.Clock(); let last = 0;
for (let k = 0; k < 90; k++) people(1 / 30, k / 30);
function loop() { requestAnimationFrame(loop); const t = clock.getElapsedTime(), dt = Math.min(.1, t - last); last = t; if (!SHOT) people(dt, t);
  if (tweenT < 1) { tweenT = Math.min(1, tweenT + .045); const k = 1 - Math.pow(1 - tweenT, 3); camera.position.lerpVectors(from.p, camPos, k); controls.target.lerpVectors(from.t, target, k); }
  controls.update(); composer.render(); }
function stats() { let tris = 0, meshes = 0; scene.updateMatrixWorld(true); scene.traverse(x => { if (!x.isMesh || !x.visible || (x.material && x.material.visible === false)) return; meshes++; const g = x.geometry, n = (g.index ? g.index.count : g.attributes.position.count) / 3; tris += n * (x.isInstancedMesh ? x.count : 1); }); return { tris: Math.round(tris), meshes }; }
window.Tower = { stats, scene };
if (SHOT === 'lobby') { const y = floorY['1F']; controls.minDistance = 1; tweenT = 1; target.set(0, y + 2.2, 0); camPos.set(1.5, y + 3.2, 24); camera.position.copy(camPos); controls.target.copy(target); }
if (SHOT === 'info') info.style.display = 'block';
document.title = 'STATS=' + JSON.stringify(stats());
loop();
