// Polls the public state endpoint (plain GET, no custom headers -> no CORS preflight; Apps Script redirects to googleusercontent with ACAO:*).
// Hands the list to the 3D scene (window.P7_applyStatus); characters change state gracefully there.
// ?mock=live is a screenshot-only preview: fake data, nothing is sent anywhere.
(function () {
  var C = window.P7_STATUS || {}, Q = new URLSearchParams(location.search), mock = Q.get('mock');
  if (!mock && (!C.enabled || !C.url)) return;
  function ready(cb) { if (window.P7_applyStatus) cb(); else setTimeout(function () { ready(cb); }, 200); }
  if (mock) { var ids = ['mira', 'vera', 'stylist', 'contract', 'fx', 'nova'];
    var list = ids.map(function (id) { return { id: 'home_' + id, state: 'away', activity: '', fresh: 'stale' }; });
    if (mock === 'live') { list[5] = { id: 'home_nova', state: 'work', activity: '蓋大樓中', fresh: 'live' }; list[0] = { id: 'home_mira', state: 'idle', activity: '巡視大廳', fresh: 'live' }; }
    ready(function () { window.P7_applyStatus(list); }); return; }
  function tick() { fetch(C.url + '?action=state', { cache: 'no-store' }).then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.ok && window.P7_applyStatus) window.P7_applyStatus(j.residents || []); }).catch(function () {}); }
  ready(function () { tick(); setInterval(tick, C.intervalMs || 30000); });
})();
