// Polls the public state endpoint every 30s; falls back to roster.json. Needs setRoster/people from tail.js.
(function () {
  var C = window.P7_STATUS || {}; if (!C.enabled || !C.url) return;
  var base = null;
  function apply(list) { if (typeof setRoster !== 'function') return; setRoster({ version: 3, residents: list }); if (typeof people === 'function') people(0, 0); }
  function merge(live) { var by = {}; (live.residents || []).forEach(function (r) { by[r.id.replace(/^home_/, '')] = r; });
    var out = (base ? base.residents : []).map(function (r) { var l = by[r.id]; if (!l) return r; delete by[r.id];
      return Object.assign({}, r, { state: l.state, activity: l.activity, fresh: l.fresh }); });
    Object.keys(by).forEach(function (k) { var l = by[k]; out.push({ id: l.id, name: l.name, floor: l.floor, desk: l.desk, skin: (l.style || {}).skin, state: l.state, activity: l.activity, fresh: l.fresh }); });
    return out; }
  function tick() { fetch(C.url + '?action=state', { cache: 'no-store' }).then(function (r) { return r.json(); })
    .then(function (j) { if (j && j.ok) apply(merge(j)); }).catch(function () { if (base) apply(base.residents); }); }
  fetch('roster.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (r) { base = r; }).catch(function () {})
    .then(function () { tick(); setInterval(tick, C.intervalMs || 30000); });
})();
