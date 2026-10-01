/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10r3-name — WCAG 2.5.3 Label in Name over every control this module draws:
 *  does the accessible name contain the visible string? */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1943&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  const check = () => page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('.qz-open, .qz button, .qz [role=button]')) {
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      /* the visible string = the text a sighted user can read on it */
      const vis = [...e.childNodes].map((n) => {
        if (n.nodeType === 3) return n.nodeValue;
        if (n.nodeType !== 1) return '';
        const cs = getComputedStyle(n);
        if (cs.clipPath && cs.clipPath !== 'none') return '';
        if (cs.display === 'none' || cs.visibility === 'hidden') return '';
        return n.textContent;
      }).join(' ').replace(/\s+/g, ' ').trim();
      const name = (e.getAttribute('aria-label') || e.textContent || '').replace(/\s+/g, ' ').trim();
      /* SC 2.5.3 is about labels that "include text or images of text". A bare
         glyph (an arrow) is a symbol, not a label a speech user can say, and
         it is excluded. Whitespace and case are normalised on both sides, and
         so is the join between element children, or a label split across two
         spans reports as a mismatch it is not. */
      if (!vis || !/[a-z0-9]/i.test(vis)) continue;
      const flat = (x) => x.toLowerCase().replace(/[\s\u00a0]+/g, '');
      const ok = flat(name).includes(flat(vis));
      out.push({ ok, vis, name: name.slice(0, 80), cls: String(e.className).slice(0, 26) });
    }
    return out;
  });
  let bad = 0, n = 0;
  const run = async (where) => {
    for (const r of await check()) {
      n++;
      if (!r.ok) { bad++; log('  FAIL ' + where + '  visible “' + r.vis + '”  name “' + r.name + '”  ' + r.cls); }
    }
  };
  await run('plate');
  const ids = await page.evaluate(() => window.BEA.quiz.items().map((i) => i.id));
  for (const id of ids) {
    await page.evaluate((i) => window.BEA.quiz.open(i), id);
    await page.waitForTimeout(140);
    await run(id);
  }
  await page.evaluate(() => window.BEA.quiz.schedule());
  await page.waitForTimeout(300);
  await run('the done panel');
  log((bad ? 'FAIL ' : 'PASS ') + bad + ' of ' + n + ' controls whose accessible name does not contain the visible label');
};
