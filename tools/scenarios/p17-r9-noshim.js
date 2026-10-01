/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 9 — the piece with chrome.css's §E P17 shim DELETED at runtime.
   Every rule in that block names this piece as the one that deletes it. This
   asserts it is already dead code: the strip, the byline and the phone key must
   be identical with the block in force and with it gone. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);

  const probe = () => page.evaluate(() => {
    const rr = (s) => { const n = document.querySelector(s); if (!n) return null;
      const b = n.getBoundingClientRect(); const cs = getComputedStyle(n);
      return { w: Math.round(b.width), h: Math.round(b.height), y: Math.round(b.y),
        on: cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 1 && b.height > 1 }; };
    const rib = document.querySelector('.legend--ribbon');
    const items = rib ? [...rib.querySelectorAll('.legend__rib')] : [];
    return {
      stage: document.getElementById('app').dataset.stage,
      ribbon: rr('.legend--ribbon'),
      byline: rr('#legend-byline'),
      shown: items.filter(li => !li.hidden).length,
      route: rib && rib.querySelector('.legend__route') && !rib.querySelector('.legend__route').hidden,
      scroll: document.documentElement.scrollHeight - innerHeight,
    };
  });

  const kill = () => page.evaluate(() => {
    let n = 0;
    for (const sheet of [...document.styleSheets]) {
      if (!/chrome\.css/.test(sheet.href || '')) continue;
      for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
        const t = sheet.cssRules[i].cssText || '';
        if (/legend|byline|stage__apparatus|stage__note|data-phone/.test(t)) { sheet.deleteRule(i); n++; }
      }
    }
    return n;
  });

  const stages = ['plate', 'apparatus'];
  for (const st of stages) {
    if (st !== 'plate') {
      await page.goto('http://localhost:8777/app/#filter=stage:' + st, { waitUntil: 'load' });
      await page.waitForTimeout(2500);
    }
    const before = await probe();
    const n = await kill();
    await page.evaluate(() => window.BEA.legend && window.BEA.legend.render && window.BEA.legend.render());
    await page.waitForTimeout(700);
    const after = await probe();
    const same = JSON.stringify(before) === JSON.stringify(after);
    log((same ? 'PASS  ' : 'FAIL  ') + 'shim-independent @ ' + st + '  ' + n + ' rules deleted'
      + '\n      before ' + JSON.stringify(before) + '\n      after  ' + JSON.stringify(after));
    await shot('noshim-' + st);
  }
  log('page errors ' + JSON.stringify(errs));
};
