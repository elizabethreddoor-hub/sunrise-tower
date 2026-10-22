// P007 團隊模式：內部工作看板、對話面板、角色今日紀錄。只在輸入團隊觀看碼後出現；資料都從後端用觀看憑證即時取得，這個檔案本身不含任何對話或敏感資料。
(function () {
  var Q = new URLSearchParams(location.search), D = document, on = false, tab = Q.get('panel') === 'chat' ? 'chat' : 'board', speak = null, data = { board: null, log: [] }, filt = '', busy = false, SPK = 'p7_sp';
  // 發言裝置憑證：這台裝置成功驗證過一次發言密碼後才顯示發言區（365 天）。密碼本身不存。
  var MOCKSP = { owner: '庭彣', zhang: '張總' };
  function spObj() { if (window.P7_mock) { var k = Q.get('speak'); return MOCKSP[k] ? { t: 'mock', name: MOCKSP[k] } : null; }
    try { var o = JSON.parse(localStorage.getItem(SPK) || 'null'); if (o && o.t && Date.parse(o.exp) > Date.now()) return o; } catch (e) {} return null; }
  function spTok() { var o = spObj(); return o ? o.t : null; }
  var css = D.createElement('style'); css.textContent =
    'body.team #info,body.team #hint{display:none!important}' +
    '#tb{position:absolute;left:12px;top:12px;width:min(360px,calc(100% - 24px));max-height:calc(100% - 24px);display:none;flex-direction:column;background:rgba(18,24,38,.93);color:#eef2f8;border:1px solid #2F80ED;border-radius:12px;z-index:7;font-size:13px;overflow:hidden}' +
    'body.team #tb{display:flex}#tb.min .bd{display:none}' +
    '#tb .hd{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid rgba(47,128,237,.5)}#tb .hd b{flex:1;font-size:15px;color:#9cc4ff}' +
    '#tb button{background:#24324a;color:#eef2f8;border:1px solid #3a5070;border-radius:7px;padding:3px 9px;font-size:12px;cursor:pointer}#tb button.on{background:#2F80ED;border-color:#2F80ED}' +
    '#tb input{background:#101828;color:#eef2f8;border:1px solid #3a5070;border-radius:7px;font-size:12px;padding:4px 6px;flex:1;min-width:0}#tb .who{font-size:12px;color:#9cc4ff}#tb a.out{font-size:11px;color:#93a3b8;cursor:pointer;text-decoration:underline;margin-left:auto}#tb .go{background:#2F80ED;border-color:#2F80ED;margin-top:2px}' +
    '#tb .bd{overflow:auto;padding:8px 10px}#tb h4{margin:10px 0 4px;font-size:13px;color:#ffd08a}#tb h4:first-child{margin-top:2px}' +
    '#tb .r{padding:4px 0;border-bottom:1px dashed rgba(255,255,255,.12);line-height:1.45}#tb .t{color:#93a3b8;font-size:11px;margin-right:6px}#tb .n{color:#9cc4ff;font-weight:600}' +
    '#tb .chip{display:inline-block;margin:2px 4px 2px 0;padding:1px 8px;border-radius:9px;background:#3b2a2a;color:#ffb4a8;font-size:12px}#tb .em{color:#93a3b8}' +
    '#tb select,#tb textarea{background:#101828;color:#eef2f8;border:1px solid #3a5070;border-radius:7px;font-size:12px;padding:3px}#tb textarea{width:100%;box-sizing:border-box;height:46px;margin:4px 0;resize:vertical}' +
    '#tb .spk{display:flex;flex-direction:column;border-top:1px solid rgba(47,128,237,.5);padding:8px 10px}#tb .sayrow{display:flex;gap:6px;align-items:center}' +
    '#dl{position:absolute;right:12px;top:12px;width:min(340px,calc(100% - 24px));max-height:calc(100% - 24px);overflow:auto;background:rgba(255,255,255,.97);color:#1F2A3C;border:2px solid #2F80ED;border-radius:12px;z-index:8;display:none;font-size:13px}' +
    '#dl h3{margin:0;padding:10px 12px;font-size:15px;color:#1F4E85;border-bottom:1px solid #cfe0f7;display:flex;justify-content:space-between}#dl h3 button{background:none;border:0;font-size:18px;cursor:pointer;color:#555}' +
    '#dl .b{padding:8px 12px}#dl h4{margin:8px 0 4px;color:#C25E00;font-size:13px}#dl .r{padding:3px 0;border-bottom:1px dashed #dde6f2;line-height:1.45}#dl .t{color:#7a8899;font-size:11px;margin-right:6px}';
  D.head.appendChild(css);
  function el(tag, cls, txt) { var e = D.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function hm(ts) { try { return new Date(ts).toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', hour12: false }); } catch (e) { return ''; } }
  var ST = { work: '⌨ 工作中', meet: '💬 討論中', idle: '☕ 待命', away: '☕ 待命' };
  var box = el('div'); box.id = 'tb'; var hd = el('div', 'hd'), bd = el('div', 'bd'), sy = el('div', 'spk');
  var bB = el('button', '', '工作看板'), bC = el('button', '', '對話'), bM = el('button', '', '－'); bM.title = '收合';
  hd.appendChild(el('b', '', '內部工作模式')); hd.appendChild(bB); hd.appendChild(bC); hd.appendChild(bM); box.appendChild(hd); box.appendChild(bd); box.appendChild(sy);
  var dl = el('div'); dl.id = 'dl'; D.body.appendChild(box); D.body.appendChild(dl);
  bB.onclick = function () { tab = 'board'; render(); }; bC.onclick = function () { tab = 'chat'; render(); };
  bM.onclick = function () { box.classList.toggle('min'); bM.textContent = box.classList.contains('min') ? '＋' : '－'; };
  function api(action, extra) { if (window.P7_mock) return Promise.resolve(mockApi(action, extra || {}));
    var t = window.P7_tvTok && window.P7_tvTok(); if (!t || !window.P7_url) return Promise.reject();
    var q = '?action=' + action + '&tv=' + encodeURIComponent(t); Object.keys(extra || {}).forEach(function (k) { q += '&' + k + '=' + encodeURIComponent(extra[k]); });
    return fetch(window.P7_url + q, { cache: 'no-store' }).then(function (r) { return r.json(); }); }
  function post(body) { return fetch(window.P7_url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
  function mockApi(a, x) { var S = window.P7_SAMPLE || {}; if (a === 'board') return S.board || { ok: true, now: [], recent: [], stale: [] };
    if (a === 'msg_log') return { ok: true, messages: S.log || [] }; if (a === 'day_log') return (S.day && S.day[x.id]) || { ok: true, name: x.id, jobs: [], messages: [] }; return { ok: false }; }
  function names() { var m = {}; ((data.board && data.board.now) || []).forEach(function (r) { m[r.id] = { name: r.name, floor: r.floor }; }); return m; }
  function render() { bB.className = tab === 'board' ? 'on' : ''; bC.className = tab === 'chat' ? 'on' : ''; bd.textContent = ''; sy.style.display = tab === 'chat' ? 'flex' : 'none'; spUI();
    if (tab === 'board') { var b = data.board; if (!b) { bd.appendChild(el('div', 'em', '讀取中…')); return; }
      bd.appendChild(el('h4', '', '每位 AI 現在的工作'));
      b.now.slice().sort(function (a, c) { var o = { meet: 0, work: 1 }; return (o[a.state] === undefined ? 2 : o[a.state]) - (o[c.state] === undefined ? 2 : o[c.state]); }).forEach(function (r) {
        var d = el('div', 'r'); d.appendChild(el('span', 'n', r.name)); d.appendChild(el('span', 't', ' ' + r.floor + 'F'));
        d.appendChild(D.createTextNode(ST[r.state] || '☕ 待命')); var s = (r.activity ? '・' + r.activity : '') + (r['with'] && r['with'].length ? '・和 ' + r['with'].join('、') + ' 討論' : ''); if (s) d.appendChild(D.createTextNode(s)); bd.appendChild(d); });
      bd.appendChild(el('h4', '', '最近 10 筆工作紀錄')); if (!b.recent.length) bd.appendChild(el('div', 'em', '還沒有紀錄'));
      b.recent.forEach(function (j) { var d = el('div', 'r'); d.appendChild(el('span', 't', hm(j.ts))); d.appendChild(el('span', 'n', j.name));
        d.appendChild(D.createTextNode(' ' + (j.kind === 'start' ? '開始' : '完成') + (j.mode === 'meet' ? '討論' + (j['with'].length ? '（' + j['with'].join('、') + '）' : '') : '工作') + (j.activity ? '：' + j.activity : ''))); bd.appendChild(d); });
      bd.appendChild(el('h4', '', '超過 2 小時沒有回報')); if (!b.stale.length) bd.appendChild(el('div', 'em', '全部都有回報'));
      var w = el('div'); b.stale.forEach(function (r) { w.appendChild(el('span', 'chip', r.name)); }); bd.appendChild(w); return; }
    var nm = names(), fr = el('div', 'sayrow'), sel = el('select'); sel.appendChild(new Option('全部對話', ''));
    [1, 2, 3, 4].forEach(function (f) { sel.appendChild(new Option(f + 'F 樓層', 'f:' + f)); });
    Object.keys(nm).forEach(function (id) { sel.appendChild(new Option(nm[id].name, 'a:' + id)); }); sel.value = filt; sel.onchange = function () { filt = sel.value; render(); };
    fr.appendChild(el('span', '', '篩選：')); fr.appendChild(sel); bd.appendChild(fr);
    var list = data.log.filter(function (m) { if (!filt) return true; var v = filt.slice(2);
      if (filt[0] === 'a') return m.from === v || m.to === v; var fl = function (id) { return nm[id] && String(nm[id].floor) === v; }; return m.to === 'floor:' + v || fl(m.from) || fl(m.to); });
    if (!list.length) bd.appendChild(el('div', 'em', '還沒有對話'));
    list.slice(-100).forEach(function (m) { var d = el('div', 'r'); d.appendChild(el('span', 't', hm(m.ts))); d.appendChild(el('span', 'n', m.from_name));
      d.appendChild(D.createTextNode(' → ' + m.to_name + '：')); d.appendChild(D.createTextNode(m.body)); bd.appendChild(d); });
    bd.scrollTop = bd.scrollHeight; }
  // 庭彣發言：需要另一組「發言密碼」，只存在這個分頁的記憶體裡
  var spUI = function () {};
  (function () { var lock = el('div', 'sayrow'), pw = el('input'), ub = el('button', '', '輸入發言密碼'); pw.type = 'password'; pw.placeholder = '發言密碼'; pw.autocomplete = 'off';
    lock.appendChild(pw); lock.appendChild(ub);
    var open = el('div'), row = el('div', 'sayrow'), to = el('select'), ta = el('textarea'), go = el('button', 'go', ''), who = el('div', 'sayrow'), wn = el('span', 'who', ''), out = el('a', 'out', '登出發言');
    ta.placeholder = '要說的話（最多 1000 字）'; ta.maxLength = 1000; who.appendChild(wn); who.appendChild(out);
    row.appendChild(el('span', '', '對象：')); row.appendChild(to); open.appendChild(who); open.appendChild(row); open.appendChild(ta); open.appendChild(go);
    open.style.display = 'flex'; open.style.flexDirection = 'column'; sy.appendChild(lock); sy.appendChild(open);
    spUI = function () { var o = spObj(); lock.style.display = o ? 'none' : 'flex'; open.style.display = o ? 'flex' : 'none';
      if (o) { wn.textContent = '目前發言身分：' + o.name; go.textContent = '以' + o.name + '身分發言'; } };
    var err = function (e) { return e === 'speak not set' ? '發言功能尚未開啟' : e === 'wrong speak code' ? '發言密碼不正確' : e === 'speak locked' ? '這台裝置的發言權限已失效，請重新輸入發言密碼' : e === 'rate limited' ? '太頻繁了，請一分鐘後再試' : e === 'team only' ? '團隊觀看已失效，請重新輸入觀看碼' : '失敗，請稍後再試'; };
    ub.onclick = pw.onkeydown = function (ev) { if (ev && ev.type === 'keydown' && ev.key !== 'Enter') return; if (window.P7_mock || busy) return; var c = pw.value; if (!c.trim()) return; busy = true;
      post({ action: 'tv_speak_unlock', tv: window.P7_tvTok(), speak_code: c }).then(function (j) { busy = false; pw.value = '';
        if (j && j.ok) { localStorage.setItem(SPK, JSON.stringify({ t: j.speak_token, exp: j.expires, name: j.name })); spUI(); return; } alert(err(j && j.error)); })
        .catch(function () { busy = false; pw.value = ''; alert('連線失敗，請稍後再試'); }); };
    out.onclick = function () { if (confirm('登出發言？這台裝置之後要重新輸入發言密碼才能發言。')) { localStorage.removeItem(SPK); spUI(); } };
    to.onfocus = function () { var v = to.value, nm = names(); to.textContent = ''; [1, 2, 3, 4].forEach(function (f) { to.appendChild(new Option(f + 'F 全樓層', 'floor:' + f)); });
      Object.keys(nm).forEach(function (id) { to.appendChild(new Option(nm[id].name, id)); }); if (v) to.value = v; }; to.onfocus();
    go.onclick = function () { if (window.P7_mock || busy) return; var body = ta.value.trim(), st = spTok(); if (!body || !st) return; busy = true;
      post({ action: 'tv_say', tv: window.P7_tvTok(), speak_token: st, to: to.value, body: body }).then(function (j) { busy = false;
        if (j && j.ok) { ta.value = ''; tick(); return; } var e = j && j.error; if (e === 'speak locked') { localStorage.removeItem(SPK); spUI(); } alert(err(e)); })
        .catch(function () { busy = false; alert('連線失敗，請稍後再試'); }); }; })();
  function tick() { if (!on) return; api('board').then(function (j) { if (j && j.ok) { data.board = j; if (tab === 'board') render(); } }).catch(function () {});
    api('msg_log').then(function (j) { if (j && j.ok) { data.log = j.messages || []; if (tab === 'chat') render(); } }).catch(function () {}); }
  window.P7_pick = function (id) { if (!on) return; api('day_log', { id: id }).then(function (j) { if (!j || !j.ok) return; dl.textContent = '';
    var h = el('h3', '', (j.name || id) + ' 今日紀錄'), x = el('button', '', '×'); x.onclick = function () { dl.style.display = 'none'; }; h.appendChild(x); dl.appendChild(h);
    var b = el('div', 'b'); b.appendChild(el('h4', '', '工作')); if (!j.jobs.length) b.appendChild(el('div', 'r', '今天還沒有工作紀錄'));
    j.jobs.forEach(function (k) { var d = el('div', 'r'); d.appendChild(el('span', 't', hm(k.ts))); d.appendChild(D.createTextNode((k.kind === 'start' ? '開始' : '完成') + (k.mode === 'meet' ? '討論' + (k['with'].length ? '（' + k['with'].join('、') + '）' : '') : '工作') + (k.activity ? '：' + k.activity : ''))); b.appendChild(d); });
    b.appendChild(el('h4', '', '對話')); if (!j.messages.length) b.appendChild(el('div', 'r', '今天還沒有對話'));
    j.messages.forEach(function (m) { var d = el('div', 'r'); d.appendChild(el('span', 't', hm(m.ts))); d.appendChild(D.createTextNode(m.from_name + ' → ' + m.to_name + '：' + m.body)); b.appendChild(d); });
    dl.appendChild(b); dl.style.display = 'block'; }).catch(function () {}); };
  window.P7_teamTick = tick;
  window.P7_teamChanged = function (v) { on = v; if (!v) dl.style.display = 'none'; else { render(); tick(); } };
  function start() { on = !!(window.P7_tvTok && window.P7_tvTok()); render(); if (!on) return; tick();
    if (window.P7_mock && window.P7_SAMPLE && window.P7_SAMPLE.bubbles && window.P7_mockList) { var L = window.P7_mockList;
      L.forEach(function (r) { var m = window.P7_SAMPLE.bubbles[r.id]; if (m) r.msg = m; });
      (function ap() { if (window.P7_applyStatus) window.P7_applyStatus(L); else setTimeout(ap, 200); })(); }
    if (Q.get('pick')) setTimeout(function () { window.P7_pick(Q.get('pick')); }, 300); }
  if (window.P7_mock && Q.get('team') === '1') { var s = D.createElement('script'); s.src = '../mock/board_sample.js'; s.onload = s.onerror = start; D.head.appendChild(s); } else start();
})();
