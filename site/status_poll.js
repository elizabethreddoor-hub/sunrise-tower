// Polls the state endpoint (plain GET, no custom headers -> no CORS preflight).
// Public visitors get anonymous data (no names, no activity). With a team-view device token (🔑, valid 365 days, localStorage) the
// backend also returns names and activity. ?shot=…&mock=live[&team=1] is a screenshot-only preview with fake data.
(function () {
  var C = window.P7_STATUS || {}, Q = new URLSearchParams(location.search), mock = Q.get('shot') ? Q.get('mock') : null, LS = 'p7_tv';
  var btn = document.getElementById('tvk');
  function tok() { try { var o = JSON.parse(localStorage.getItem(LS) || 'null'); if (o && o.t && Date.parse(o.exp) > Date.now()) return o.t; } catch (e) {} return null; }
  function mark() { var on = mock ? Q.get('team') === '1' : !!tok(); document.body.classList.toggle('team', on); if (on) { var inf = document.getElementById('info'); if (inf) inf.style.display = 'none'; }
    if (btn) { btn.classList.toggle('on', on); btn.title = on ? '團隊觀看中（點一下登出）' : '團隊'; } if (window.P7_teamChanged) window.P7_teamChanged(on); }
  window.P7_tvTok = function () { return mock ? (Q.get('team') === '1' ? 'mock' : null) : tok(); }; window.P7_url = C.url || ''; window.P7_mock = !!mock;
  function ready(cb) { if (window.P7_applyStatus) cb(); else setTimeout(function () { ready(cb); }, 200); }
  mark();
  if (mock) { var ids = ['mira', 'vera', 'stylist', 'contract', 'fx', 'nova'], team = Q.get('team') === '1';
    var NM = { mira: 'Mira', vera: 'Vera', stylist: '造型師', contract: '合約管家', fx: '外匯小精靈', nova: 'Nova' };
    var list = ids.map(function (id) { var r = { id: 'home_' + id, state: 'away', fresh: 'stale' }; if (team) { r.name = NM[id]; r.activity = ''; } return r; });
    for (var i = 1; i <= 16; i++) list.push({ id: 'srg_' + ('0' + i).slice(-2), state: 'idle', fresh: 'live' });
    var by = {}; list.forEach(function (r) { by[r.id] = r; });
    function S(id, st, w, act, say) { var r = by[id]; r.state = st; r.fresh = 'live'; if (w) r['with'] = w; if (team && act) r.activity = act; if (team && say) r.say = say; }
    if (mock !== 'live') ids.forEach(function (id) { S('home_' + id, 'idle'); });
    if (mock === 'live') { list[5].state = 'work'; list[5].fresh = 'live'; list[0].state = 'idle'; list[0].fresh = 'live'; if (team) { list[5].activity = '蓋大樓中'; list[0].activity = '巡視大廳'; } }
    if (mock === 'solo') { S('home_nova', 'work', 0, '蓋大樓中'); S('home_contract', 'work', 0, '看合約'); S('srg_02', 'work'); S('srg_06', 'work'); }
    if (mock === 'icons') { S('home_nova', 'work', 0, '蓋大樓中'); S('home_contract', 'work', 0, '看合約'); S('home_mira', 'meet', ['home_vera']); S('home_vera', 'meet', ['home_mira']); }
    if (mock === 'pair') { S('srg_01', 'meet', ['srg_05'], 0, '客戶問交期能不能提前'); S('srg_05', 'meet', ['srg_01'], 0, '我查一下產線排程'); S('home_mira', 'meet', ['home_nova'], 0, '這週的報表先給我看一下？'); S('home_nova', 'meet', ['home_mira'], 0, '好，下午三點前整理好。'); S('srg_02', 'meet', ['srg_04']); S('srg_04', 'meet', ['srg_02']); }
    if (mock === 'cross') { S('home_vera', 'meet', ['srg_10']); S('srg_10', 'meet', ['home_vera']); S('srg_03', 'meet', ['home_fx']); S('home_fx', 'meet', ['srg_03']); }
    if (mock === 'group') { var g = ['home_mira', 'home_vera', 'home_stylist', 'home_contract', 'home_fx', 'home_nova', 'srg_03', 'srg_04'];
      var SY = { home_mira: '今天的重點是新大樓進度', home_vera: '我補充一下預算', home_nova: '3D 模型已經上線了', srg_03: '外部團隊這邊沒問題' };
      g.forEach(function (id) { S(id, 'meet', g.filter(function (x) { return x !== id; }), 0, SY[id]); }); }
    if (mock === 'sched') { S('home_nova', 'work', 0, '蓋大樓中'); S('home_contract', 'work', 0, '看合約'); S('home_vera', 'work', 0, '整理品牌'); S('home_stylist', 'away'); by['home_stylist'].fresh = 'stale'; for (var j = 1; j <= 16; j += 3) S('srg_' + ('0' + j).slice(-2), 'work'); }
    if (mock === 'meet6') { ['koc', 'engineer'].forEach(function (id) { var r = { id: 'home_' + id, state: 'away', fresh: 'stale' }; list.push(r); by[r.id] = r; }); ['nova', 'contract', 'vera', 'mira', 'fx', 'koc', 'engineer'].forEach(function (id) { S('home_' + id, 'work'); }); }
    if (mock === 'board') { S('home_nova', 'work', 0, '蓋大樓中'); S('home_contract', 'work', 0, '看合約'); S('home_mira', 'meet', ['home_vera']); S('home_vera', 'meet', ['home_mira']); S('srg_01', 'work', 0, '整理客戶名單'); }
    window.P7_mockList = list;
    ready(function () { window.P7_applyStatus(list, team ? (function () { var n = {}; for (var i = 1; i <= 16; i++) n['srg_' + ('0' + i).slice(-2)] = '（團隊名牌' + i + '）'; return n; })() : null); }); return; }
  if (!C.enabled || !C.url) return;
  function tick() { var t = tok(); fetch(C.url + '?action=state' + (t ? '&tv=' + encodeURIComponent(t) : ''), { cache: 'no-store' }).then(function (r) { return r.json(); })
    .then(function (j) { if (!j || !j.ok || !window.P7_applyStatus) return; if (j.tv_error) { localStorage.removeItem(LS); mark(); }
      window.P7_applyStatus(j.residents || [], j.team ? (j.names || {}) : null); if (window.P7_teamTick && j.team) window.P7_teamTick(); }).catch(function () {}); }
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
