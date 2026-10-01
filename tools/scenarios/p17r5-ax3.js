/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Is the text of every legend row actually in the accessibility tree? */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { location.hash = '#year=1900&layer=exit'; });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(1100);
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const text = nodes.filter(n => !n.ignored).map(n => (n.name && n.name.value) || '').join(' ‖ ');
  const probes = [
    'On the plate now', 'negotiated independence', 'The legal-status vocabulary below',
    'Broken bands', 'Dense hatch', 'Coastline only', 'Haze, no border', 'Heavy outline', 'Hairline',
    'under 10 years', '150 years or more', 'never held', 'What the colour means',
    'A record for this place was destroyed', 'stood back',
  ];
  for (const p of probes) log((text.includes(p) ? 'IN TREE   ' : 'MISSING   ') + p);
  await cdp.detach();
};
