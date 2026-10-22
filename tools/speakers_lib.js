// 發言者清單工具（本機用）。只處理雜湊，從不印出或寫入任何密碼。資料寫在 gas/Speak.gs（gitignored，權限 600）。
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const GAS = process.env.P007_GAS_DIR || path.join(__dirname, '..', 'gas'), FILE = () => path.join(GAS, 'Speak.gs');
const norm = s => String(s || '').replace(/\s+/g, '').toLowerCase();
const sha = s => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const spHash = c => sha('sp:' + norm(c)), tvHash = c => sha('tv:' + norm(c));
function load() { const f = FILE(); if (!fs.existsSync(f)) return [];
  const src = fs.readFileSync(f, 'utf8'), ctx = {}; new Function('ctx', src + '\n;ctx.L = typeof P007_SPEAKERS !== "undefined" ? P007_SPEAKERS : null; ctx.S = typeof P007_SPEAK !== "undefined" ? P007_SPEAK : null;')(ctx);
  if (ctx.L) return ctx.L; // already a list
  if (ctx.S && ctx.S.hash) return [{ speaker_id: 'owner', display_name: '庭彣', code_hash: ctx.S.hash, created: new Date().toISOString(), revoked: '' }]; // migrate legacy single hash = 庭彣
  return []; }
function save(L) { fs.writeFileSync(FILE(), '// PRIVATE (gitignored). 發言者清單：只有密碼雜湊，沒有密碼本身。用 tools/add_speaker.js / tools/revoke_speaker.js 修改。\nvar P007_SPEAKERS = ' + JSON.stringify(L, null, 1) + ';\n', { mode: 0o600 }); fs.chmodSync(FILE(), 0o600); }
function viewHash() { try { const ctx = {}; new Function('ctx', fs.readFileSync(path.join(GAS, 'TeamView.gs'), 'utf8') + '\n;ctx.T = typeof P007_TV !== "undefined" ? P007_TV : null;')(ctx); return ctx.T && ctx.T.hash || ''; } catch (e) { return ''; } }
// returns { ok, error?, speaker_id? }. Rules: 8–64 chars without spaces; not the team view code; unique among active speakers; unique display name.
function add(L, name, code, opts) { opts = opts || {}; const c = norm(code), nm = String(name || '').trim();
  if (!nm || nm.length > 20) return { ok: false, error: '名字要 1～20 字' };
  if (c.length < 8 || c.length > 64) return { ok: false, error: '發言密碼長度不對（去掉空白後 8～64 字）' };
  const h = spHash(c), vh = opts.viewHash !== undefined ? opts.viewHash : viewHash();
  if (vh && tvHash(c) === vh) return { ok: false, error: '發言密碼不能和團隊觀看碼相同' };
  const act = L.filter(s => !s.revoked);
  if (act.some(s => s.code_hash === h)) return { ok: false, error: '這組發言密碼已經有人用了，請換一組' };
  const id = nm === '庭彣' ? 'owner' : 'spk_' + crypto.randomBytes(4).toString('hex');
  if (act.some(s => s.display_name === nm || s.speaker_id === id)) return { ok: false, error: '這個名字已經有發言密碼了（要換請先撤銷）' };
  L.push({ speaker_id: id, display_name: nm, code_hash: h, created: new Date().toISOString(), revoked: '' }); return { ok: true, speaker_id: id }; }
function revoke(L, who) { let n = 0; L.forEach(s => { if (!s.revoked && (s.speaker_id === who || s.display_name === who)) { s.revoked = new Date().toISOString(); n++; } }); return n; }
module.exports = { norm, spHash, tvHash, load, save, add, revoke, viewHash };
if (require.main === module && process.argv[2] === 'migrate') { const L = load(); save(L); console.log('發言者清單：' + L.filter(s => !s.revoked).map(s => s.display_name).join('、') + '（只存雜湊）'); }
