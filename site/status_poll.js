// Polls the state endpoint (plain GET, no custom headers -> no CORS preflight).
// Public visitors get anonymous data (no names, no activity). With a team-view device token (🔑, valid 365 days, localStorage) the
// backend also returns names and activity. ?shot=…&mock=live[&team=1] is a screenshot-only preview with fake data.
(function () {
  var C = window.P7_STATUS || {}, Q = new URLSearchParams(location.search), mock = Q.get('shot') ? Q.get('mock') : null, LS = 'p7_tv';
  var btn = document.getElementById('tvk');
  function tok() { try { var o = JSON.parse(localStorage.getItem(LS) || 'null'); if (o && o.t && Date.parse(o.exp) > Date.now()) return o.t; } catch (e) {} return null; }
  function mark() { if (btn) { var on = mock ? Q.get('team') === '1' : !!tok(); btn.classList.toggle('on', on); btn.title = on ? '團隊觀看中（點一下登出）' : '團隊'; } }
  function ready(cb) { if (window.P7_applyStatus) cb(); else setTimeout(function () { ready(cb); }, 200); }
  mark();
  if (mock) { var ids = ['mira', 'vera', 'stylist', 'contract', 'fx', 'nova'], team = Q.get('team') === '1';
    var NM = { mira: 'Mira', vera: 'Vera', stylist: '造型師', contract: '合約管家', fx: '外匯小精靈', nova: 'Nova' };
    var list = ids.map(function (id) { var r = { id: 'home_' + id, state: 'away', fresh: 'stale' }; if (team) { r.name = NM[id]; r.activity = ''; } return r; });
    if (mock === 'live') { list[5].state = 'work'; list[5].fresh = 'live'; list[0].state = 'idle'; list[0].fresh = 'live'; if (team) { list[5].activity = '蓋大樓中'; list[0].activity = '巡視大廳'; } }
    ready(function () { window.P7_applyStatus(list, team ? { srg_01: '（團隊名牌）' } : null); }); return; }
  if (!C.enabled || !C.url) return;
  function tick() { var t = tok(); fetch(C.url + '?action=state' + (t ? '&tv=' + encodeURIComponent(t) : ''), { cache: 'no-store' }).then(function (r) { return r.json(); })
    .then(function (j) { if (!j || !j.ok || !window.P7_applyStatus) return; if (j.tv_error) { localStorage.removeItem(LS); mark(); }
      window.P7_applyStatus(j.residents || [], j.team ? (j.names || {}) : null); }).catch(function () {}); }
  if (btn) btn.onclick = function () {
    if (tok()) { if (confirm('登出團隊觀看？')) { localStorage.removeItem(LS); mark(); tick(); } return; }
    var c = prompt('請輸入團隊觀看碼'); if (!c) return;
    fetch(C.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'tv_login', code: c }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.ok) { localStorage.setItem(LS, JSON.stringify({ t: j.token, exp: j.expires })); mark(); tick(); }
        else alert(j && j.error === 'rate limited' ? '嘗試太多次，請一分鐘後再試' : j && j.error === 'team view not set' ? '觀看碼尚未設定' : '觀看碼不正確'); })
      .catch(function () { alert('連線失敗，請稍後再試'); }); };
  ready(function () { tick(); setInterval(tick, C.intervalMs || 30000); });
})();
