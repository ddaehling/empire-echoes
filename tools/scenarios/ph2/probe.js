const R = require('../lib/routes.js');
module.exports = async ({ page, log }) => {
  const p = await R.payload(page);
  log('DEFAULT: ' + p.default);
  log('HERE: ' + JSON.stringify(p.here).slice(0, 400));
  for (const r of p.routes) {
    log('ROUTE ' + r.id + ' :: ' + JSON.stringify(r).slice(0, 900));
  }
  const idx = p.index;
  for (const id of Object.keys(idx.routes)) {
    const st = idx.routes[id].steps;
    log('STEPS ' + id + ' (' + st.length + '): ' + st.map(s => s.step + ':' + s.kind + ':' + s.id).join(' | '));
  }
};
