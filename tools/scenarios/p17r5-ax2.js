/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 — the spoken name of every control, swatch and row in the module,
   from Chromium's own accessible-name computation. */
async function names(page, selector, log, tag) {
  const cdp = await page.context().newCDPSession(page);
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector });
  const out = [];
  for (const nodeId of nodeIds) {
    let name = '(no ax node)', role = '', ignored = false;
    try {
      const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
      const n = nodes && nodes[0];
      if (n) { role = n.role ? n.role.value : ''; ignored = !!n.ignored; name = n.name ? n.name.value : ''; }
    } catch (e) { name = 'ERR ' + e.message; }
    const desc = await cdp.send('DOM.describeNode', { nodeId }).catch(() => null);
    const a = desc && desc.node && desc.node.attributes || [];
    const cls = a[a.indexOf('class') + 1] || '';
    out.push({ role, ignored, cls: String(cls).slice(0, 44), name: String(name).slice(0, 200) });
  }
  await cdp.detach();
  log('--- ' + tag + ' [' + selector + '] (' + out.length + ')');
  for (const o of out) log('    ' + (o.ignored ? 'IGNORED ' : '') + '[' + o.role + '] ' + o.cls + ' => "' + o.name + '"');
}
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { location.hash = '#year=1900&layer=exit'; });
  await page.waitForTimeout(1200);
  for (const s of ['.legend--ribbon', '.legend__rib', '.legend__rib .sym', '.legend__say', '.legend__route']) await names(page, s, log, 'ribbon');
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(1100);
  for (const s of ['.legend__live', '.legend__live-row', '.legend__live-h',
    '.legend__entry', '.legend__entry--static .legend__word', '.legend__family-head',
    '.legend__ramp-step', '.legend__section h3', '.lsheet .cx-more', '.legend__row--strong']) await names(page, s, log, 'sheet');
  await page.evaluate(() => window.BEA.legend.openPlate('criticism'));
  await page.waitForTimeout(900);
  for (const s of ['#legend-byline', '.byline__item', '.byline__crit']) await names(page, s, log, 'byline');
  await shot('crit');
};
