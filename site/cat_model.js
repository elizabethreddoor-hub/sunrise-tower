// Adult Minecraft cat (ocelot mesh). Units are model pixels; the building is Y-up and faces +Z.
// Checked against OcelotModel.createBodyMesh and CatModel sitting offsets (adult cat, 64×32, not the 32×32 kitten):
//   head 0,0 5×4×5 · nose 0,24 3×2×2 · ears 0,10 and 6,10 1×1×2
//   body 20,0 4×16×6 with xRot π/2 (do not swap H/D before UVs)
//   front legs 40,0 2×10×2 shared · hind legs 8,13 2×6×2 shared
//   tail1 0,15 1×8×1 · tail2 4,15 1×8×1 with a −0.02 inset
// Model space is Y-down and faces −Z. Net map into this rig: (x, y, z) → (x, −y, −z). X rotation keeps its sign.
import * as THREE from 'three';

const ATW = 64, ATH = 32;
const PX0 = 1.9 / 32; // same pixel scale as the block people, so a cat is about 0.71 m at the ears
const TEX = {};
const REDUCE = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function catTex(url) {
  if (!TEX[url]) {
    const tex = new THREE.TextureLoader().load(url, () => { window.P7_catTex = (window.P7_catTex || 0) + 1; });
    tex.magFilter = tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    TEX[url] = tex;
  }
  return TEX[url];
}

// Unrotated cuboid in building space. Face order matches skinGeo (L R T D F B on +X −X +Y −Y +Z −Z).
function uvBox(u, v, x, y, z, W, H, D, inf, px) {
  const g = new THREE.BoxGeometry((W + inf * 2) * px, (H + inf * 2) * px, (D + inf * 2) * px);
  const fr = {
    L: [u + D + W, v + D, D, H], R: [u, v + D, D, H], T: [u + D, v, W, D],
    Bo: [u + D + W, v, W, D], F: [u + D, v + D, W, H], B: [u + 2 * D + W, v + D, W, H],
  };
  const uv = g.attributes.uv;
  ['L', 'R', 'T', 'Bo', 'F', 'B'].forEach((k, i) => {
    const [x0, y0, ww, hh] = fr[k], u0 = x0 / ATW, u1 = (x0 + ww) / ATW, v0 = 1 - y0 / ATH, v1 = 1 - (y0 + hh) / ATH;
    [[u0, v0], [u1, v0], [u0, v1], [u1, v1]].forEach((q, j) => uv.setXY(i * 4 + j, q[0], q[1]));
  });
  g.translate((x + W / 2) * px, -(y + H / 2) * px, -(z + D / 2) * px);
  return g;
}

function pivot(parent) { const o = new THREE.Group(); parent.add(o); return o; }
function mesh(geo, mat, parent) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; parent.add(m); return m; }

// Standing pivots, building pixels (feet near y = 0). Sitting values are CatModel's absolute pose, converted the same way.
const STAND = {
  head: [0, 9, 9, 0], body: [0, 12, 10, Math.PI / 2],
  tail1: [0, 9, -8, 0.9], tail2: [0, 4, -14, 1.7278761],
  fl: [1.2, 9.9, 5, 0], fr: [-1.2, 9.9, 5, 0], hl: [1.1, 6, -5, 0], hr: [-1.1, 6, -5, 0],
};
// Sit keeps the vanilla chest angle. The haunch and tail pivots are shifted out of the body:
// the raw CatModel tail and hind-leg pivots land inside the tilted torso, and the shared faces sawtooth.
// Hind legs lie beside the chest; the tail starts just behind the rump and curls up to the side.
const SIT = {
  head: [0, 12.3, 8, 0], body: [0, 16, 5, Math.PI / 4],
  tail1: [1.15, 2.5, -8.2, 2.20], tail2: [1.15, 6.83, -14.14, 2.60],
  fl: [1.2, 7.9, 7, -Math.PI / 20], fr: [-1.2, 7.9, 7, -Math.PI / 20],
  hl: [3.55, 0.9, 3.35, -Math.PI / 2], hr: [-3.55, 0.9, 3.35, -Math.PI / 2],
};
const SIT_TAIL_YAW = [-0.42, -0.38];

export function buildCat(url, scale) {
  const px = PX0 * (scale || 1), mat = new THREE.MeshLambertMaterial({ map: catTex(url), alphaTest: .45 });
  const g = new THREE.Group(), box = (u, v, x, y, z, W, H, D, inf, par) => mesh(uvBox(u, v, x, y, z, W, H, D, inf, px), mat, par);
  const head = pivot(g);
  box(0, 0, -2.5, -2, -3, 5, 4, 5, 0, head);
  box(0, 24, -1.5, -.001, -4, 3, 2, 2, 0, head);
  box(0, 10, -2, -3, 0, 1, 1, 2, 0, head);
  box(6, 10, 1, -3, 0, 1, 1, 2, 0, head);
  const body = pivot(g); box(20, 0, -2, 3, -8, 4, 16, 6, 0, body);
  const tail1 = pivot(g); box(0, 15, -.5, 0, 0, 1, 8, 1, 0, tail1);
  const tail2 = pivot(tail1); box(4, 15, -.5, 0, 0, 1, 8, 1, -.02, tail2);
  const fl = pivot(g), fr = pivot(g), hl = pivot(g), hr = pivot(g);
  const front = uvBox(40, 0, -1, 0, 0, 2, 10, 2, 0, px), hind = uvBox(8, 13, -1, 0, 1, 2, 6, 2, 0, px);
  mesh(front, mat, fl); mesh(front, mat, fr); mesh(hind, mat, hl); mesh(hind, mat, hr);
  g.userData.rig = { head, body, tail1, tail2, fl, fr, hl, hr };
  g.userData.M = [mat]; g.userData.px = px; g.userData.kind = 'cat'; g.userData.sitLift = null;
  g.name = 'CAT';
  return g;
}

function put(pv, pose, px, rx) { pv.position.set(pose[0] * px, pose[1] * px, pose[2] * px); pv.rotation.set(rx !== undefined ? rx : pose[3], 0, 0); }

// tail2 is a child of tail1, so its pivot is the standing/sitting offset with tail1's X rotation removed.
function seatTail(R, pose, px) {
  const a = pose.tail1, b = pose.tail2, c = Math.cos(a[3]), s = Math.sin(a[3]);
  const dy = (b[1] - a[1]) * px, dz = (b[2] - a[2]) * px;
  R.tail1.position.set(a[0] * px, a[1] * px, a[2] * px);
  R.tail1.rotation.set(a[3], 0, 0);
  R.tail2.position.set(0, dy * c + dz * s, -dy * s + dz * c);
  R.tail2.rotation.set(b[3] - a[3], 0, 0);
}

export function poseCat(p, mode, t) {
  const g = p.g, R = g.userData.rig, px = g.userData.px;
  if (!R) return;
  const sitting = mode === 'sit' || mode === 'rest';
  const pose = sitting ? SIT : STAND;
  ['head', 'body', 'fl', 'fr', 'hl', 'hr'].forEach(k => put(R[k], pose[k], px));
  seatTail(R, pose, px);
  let bob = 0, s1 = 0, s2 = 0;
  if (!REDUCE) {
    const sway = mode === 'rest' ? .34 : sitting ? .16 : .22;
    s1 = Math.sin(t * 1.15 + p.ph) * sway; s2 = Math.sin(t * 1.15 + p.ph - .65) * sway * 1.45;
    R.head.rotation.y = Math.sin(t * .42 + p.ph) * (mode === 'rest' ? .32 : sitting ? .1 : .14);
    R.head.rotation.x = Math.sin(t * .31 + p.ph * 2) * .045;
    bob = Math.sin(t * 1.7 + p.ph) * .006;
  }
  R.tail1.rotation.y = (sitting ? SIT_TAIL_YAW[0] : 0) + s1;
  R.tail2.rotation.y = (sitting ? SIT_TAIL_YAW[1] : 0) + s2;
  if (mode === 'walk') {
    const target = Math.min(.4, (p.spd || 0) * .5);
    p.swing = (p.swing || 0) + (target - (p.swing || 0)) * .22;
    const sw = REDUCE ? 0 : p.swing, s = Math.cos((p.walkD || 0) * 5.2);
    R.fl.rotation.x = -s * sw; R.hr.rotation.x = -s * sw;
    R.fr.rotation.x = s * sw; R.hl.rotation.x = s * sw;
    if (!REDUCE) {
      R.tail2.rotation.x += Math.cos((p.walkD || 0) * 2.1) * sw * .85;
      bob += Math.abs(Math.sin((p.walkD || 0) * 5.2)) * sw * .02;
    }
  } else p.swing = (p.swing || 0) * .78;
  let lift = 0;
  if (sitting) {
    if (g.userData.sitLift == null) {
      g.position.set(p.x, p.y, p.z); g.rotation.y = p.ry; R.tail1.visible = false; g.updateMatrixWorld(true);
      g.userData.sitLift = .08 - (new THREE.Box3().setFromObject(g).min.y - p.y); R.tail1.visible = true;
    }
    lift = g.userData.sitLift;
  }
  if (mode === 'walk') lift -= .045; // keep the stride paws near the floor; the swing lifts both diagonals together
  g.position.set(p.x, p.y + lift + bob, p.z); g.rotation.y = p.ry;
}

export const CAT_TAG_H = { sit: 1.22, stand: .86 };
