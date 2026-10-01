/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'scrollIntoView').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1913&sel=transvaal-colony'; });
  await page.waitForTimeout(1500);
  // find the quotation and its provenance block
  const m = await page.evaluate(() => {
    const sc = document.querySelector('.app__dossier');
    const q = sc.querySelector('blockquote, .dsr__quote');
    if (!q) return { found: false, classes: [...sc.querySelectorAll('*')].map(n => n.className).filter(c => typeof c === 'string' && /quote|source|src/.test(c)).slice(0, 20) };
    const qs = getComputedStyle(q);
    const src = q.closest('.dsr__source, figure, section') || q.parentElement;
    const order = [...src.children].map(n => ({ tag: n.tagName, cls: (n.className || '').toString().slice(0, 40), fs: getComputedStyle(n).fontSize, txt: n.innerText.replace(/\s+/g, ' ').slice(0, 90) }));
    q.scrollIntoView({ block: 'center' });
    return { found: true, quoteFs: qs.fontSize, quoteRect: q.getBoundingClientRect().toJSON(), order };
  });
  log('SOURCE BLOCK', JSON.stringify(m, null, 1).slice(0, 3500));
  await page.waitForTimeout(400);
  await shot('provenance');
  // attribution gate
  const gate = await page.evaluate(() => {
    const g = [...document.querySelectorAll('.dsr__ask')].find(n => /made for/i.test(n.innerText));
    if (!g) return null;
    g.scrollIntoView({ block: 'center' });
    return { state: g.dataset.state, text: g.innerText.slice(0, 700) };
  });
  log('ATTRIB GATE', JSON.stringify(gate));
  await page.waitForTimeout(400);
  await shot('attrib-gate');
  const h = await page.evaluateHandle(() => {
    const g = [...document.querySelectorAll('.dsr__ask')].find(n => /made for/i.test(n.innerText));
    return g && [...g.querySelectorAll('button')].filter(b => b.offsetParent)[0];
  });
  if (h.asElement()) { await h.asElement().click(); await page.waitForTimeout(1200); log('clicked'); }
  const after = await page.evaluate(() => {
    const g = [...document.querySelectorAll('.dsr__ask')].find(n => /made for|YOU ANSWERED/i.test(n.innerText));
    g.scrollIntoView({ block: 'center' });
    return { state: g.dataset.state, text: g.innerText.slice(0, 1200) };
  });
  log('ATTRIB AFTER', after.state, '\n' + after.text);
  await page.waitForTimeout(400);
  await shot('attrib-after');
};
