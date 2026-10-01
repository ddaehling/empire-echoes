/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 7 — how wide is every ribbon entry, really, and what fits. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(2800);

  const probe = () => page.evaluate(() => {
    const q = s => document.querySelector(s);
    const rr = n => { if (!n) return null; const b = n.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const leg = q('.legend--ribbon');
    const list = q('.legend__ribbon-list');
    const say = q('.legend__say');
    const route = q('.legend__route');
    const ribs = [...document.querySelectorAll('.legend__rib')].map(r => ({
      t: r.innerText.replace(/\s+/g, ' ').trim(),
      w: Math.round(r.getBoundingClientRect().width),
      right: Math.round(r.getBoundingClientRect().right),
      compact: r.dataset.compact || null,
    }));
    return {
      vw: innerWidth, vh: innerHeight,
      key: rr(q('.stage__key')), legend: rr(leg), list: rr(list),
      listScrollW: list ? Math.round(list.scrollWidth) : null,
      listClientW: list ? Math.round(list.clientWidth) : null,
      overflow: list ? Math.round(list.scrollWidth - list.clientWidth) : null,
      say: say ? { t: say.textContent, w: Math.round(say.getBoundingClientRect().width) } : null,
      route: route ? { t: route.textContent, w: Math.round(route.getBoundingClientRect().width),
        left: Math.round(route.getBoundingClientRect().left) } : null,
      ribs,
      clippedRibs: list ? ribs.filter(r => r.right > list.x + list.w + 0.5).map(r => r.t) : [],
    };
  });

  log('PLATE ' + JSON.stringify(await probe(), null, 1));
  await shot('plate');
  log('ERRORS ' + JSON.stringify(errs));
};
