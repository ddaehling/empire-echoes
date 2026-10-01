/* pk/40-index — the checked step index, route by route, against the guided
   path's own published count. Fails when a route the app publishes is not
   verified here, because an unverified route prints no page numbers and takes
   that lesson's whole pack down with it. */
const { Checks } = require('../lib/routes.js');
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.toursRoutes && window.BEA.tourStepIndex,
    null, { timeout: 30000 });
  await page.waitForTimeout(900);
  const d = await page.evaluate(() => {
    const ix = window.BEA.tourStepIndex, pub = window.BEA.toursIndex;
    const out = { verified: ix.verified, computedBy: ix.computedBy, routes: {} };
    for (const id of Object.keys(ix.routes)) {
      const r = ix.routes[id];
      out.routes[id] = {
        verified: r.verified, why: r.why, required: r.required,
        told: pub && pub.routes[id] ? pub.routes[id].steps.filter(s => !s.optional).length : null,
        kinds: r.steps.map(s => s.kind[0].toUpperCase()).join(''),
        toldKinds: pub && pub.routes[id]
          ? pub.routes[id].steps.map(s => s.kind[0].toUpperCase()).join('') : '',
      };
    }
    return out;
  });
  const C = Checks(log);
  log('computedBy: ' + d.computedBy);
  for (const id of Object.keys(d.routes)) {
    const r = d.routes[id];
    log('  ' + id.padEnd(12) + ' ours=' + r.required + ' tour=' + r.told + '  ' + r.kinds
      + (r.verified ? '' : '   UNVERIFIED: ' + r.why));
    C.t('IDX ' + id + ' step list matches the guided path',
      r.verified && r.required === r.told && r.kinds === r.toldKinds,
      'ours ' + r.required + ' ' + r.kinds, 'tour ' + r.told + ' ' + r.toldKinds);
  }
  C.t('IDX every published route is verified', d.verified === true,
    String(d.verified), 'true');
  C.finish('pk/40 the checked step index');
};
