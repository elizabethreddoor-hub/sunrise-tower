import re
L=open('/workspace/aiob/gas/tower3d.html',encoding='utf-8').read().split('\n')
def R(a,b): return L[a-1:b]
core = R(3,9)+R(11,58)+R(59,206)+R(213,268)+R(892,892)
js='\n'.join(core)
# P005 specifics
js=js.replace("window.TOWER3D_FAIL = true; window.towerSetMode && window.towerSetMode('2d'); ","document.body.classList.add('nogl'); ")
js=js.replace('miraFloorY','topFloorY')
js=re.sub(r'/\*.*?\*/','',js)
js=re.sub(r'(?<![:\'"])//[^\n]*','',js)  # drop comments (they carry internal names)
js=js.replace("red: 0x8C040C, ","")
extras='''
const ELEV_X = W / 2 - .75, ELEV_Z = 0, ELEV_GLASS = new THREE.MeshStandardMaterial({ color: 0x9fb6d8, transparent: true, opacity: .16, roughness: .2, depthWrite: false });
const DOORS = {};
function buildExtras(fid, y, g, m) {
  DOORS[fid] = [-1, 1].map(s => { const x = s * ELEV_X, h = (fid === '1F' ? FH1 : FH) - T - .25;
    const sh = new THREE.Mesh(B(.95, h, .95), ELEV_GLASS); sh.position.set(x, y + h / 2, ELEV_Z); sh.renderOrder = 2; g.add(sh);
    const fr = new THREE.Mesh(B(1.0, .06, .06), m.trim); fr.position.set(x, y + 2.3, ELEV_Z + .5); g.add(fr);
    const pan = [-1, 1].map(d => { const p = new THREE.Object3D(); p.position.set(x + d * .21, y + 1.12, ELEV_Z + .49); g.add(p); return p; });
    return { pan, x }; });
  const im = new THREE.InstancedMesh(B(.42, 2.2, .04), m.trim, 4); im.userData.dyn = 1; g.add(im); DOORS[fid].im = im; doorSync(fid);
}
'''
tail=open('/workspace/p007/tools/tail.js',encoding='utf-8').read()
html='''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>日上昇大樓</title>
<style>html,body{margin:0;height:100%;background:#0b0a24;overflow:hidden;font-family:-apple-system,"Noto Sans TC",sans-serif}
#three{position:absolute;inset:0}#three canvas{display:block;width:100%;height:100%}
#hint{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);color:#d8cfc4;font-size:12px;background:rgba(20,18,20,.6);padding:4px 12px;border-radius:12px;pointer-events:none}
#info{position:absolute;right:16px;top:16px;width:min(340px,calc(100% - 32px));background:rgba(22,18,22,.94);border:1px solid #B48C4C;border-radius:12px;color:#f3ece4;display:none;z-index:5}
#info h2{margin:0;padding:12px 16px;font-size:17px;color:#E9C77B;border-bottom:1px solid rgba(180,140,76,.5);display:flex;justify-content:space-between}
#info button{background:none;border:0;color:#d8cfc4;font-size:18px;cursor:pointer}#info .b{padding:12px 16px;font-size:14px;line-height:1.7}
#info .ex{display:inline-block;font-size:12px;color:#1c1a1c;background:#E9C77B;border-radius:6px;padding:1px 8px;margin-bottom:8px}
body.nogl #hint{display:none}</style></head><body>
<div id="three"></div><div id="hint">拖曳可微轉、滾輪縮放；點大樓看公司服務資訊</div>
<div id="info" role="dialog"><h2>公司服務資訊<button id="ix" aria-label="關閉">×</button></h2><div class="b">
<span class="ex">範例文字・待填入</span>
<p>【範例】這裡放公司簡介，一到兩句話說明我們是誰、做什麼。</p>
<p>【範例】服務項目一／服務項目二／服務項目三</p>
<p>【範例】聯絡方式：待填入</p></div></div>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module">
'''+js+extras+tail+'''
</script></body></html>'''
open('/workspace/p007/site/index.html','w',encoding='utf-8').write(html)
