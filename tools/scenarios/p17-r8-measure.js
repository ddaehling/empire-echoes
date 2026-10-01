/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 8 — the legend's footprint and its NAMES, in every state, at this
   viewport. The one question it answers: can a reader decode the plate's
   colours, right now, without leaving the screen they are on? */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 240)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 240)));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url().slice(0, 140)));

  const probe = () => page.evaluate(() => {
    const q = s => document.querySelector(s);
    const rr = n => { if (!n) return null; const b = n.getBoundingClientRect(); const cs = getComputedStyle(n);
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
        on: cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 1 && b.height > 1 }; };
    /* The strip's host moves: at 390 with the map lifted into the overlay the
       ribbon rides at the foot of that map instead of the foot of the stage.
       Measure the RIBBON, wherever it is standing. */
    const key = q('.legend--ribbon');
    const rib = q('.legend--ribbon');
    /* IS IT ACTUALLY LEGIBLE ON SCREEN? Five hit tests across the strip: if
       anything but the key answers, the key is behind something. */
    let seen = 0, pts = 0;
    if (key) { const b = key.getBoundingClientRect();
      for (let i = 0; i < 5; i++) { const x = b.x + 6 + (b.width - 12) * i / 4, y = b.y + b.height / 2;
        if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) continue;
        pts++; const e = document.elementFromPoint(x, y); if (e && key.contains(e)) seen++; } }
    const ribs = [...document.querySelectorAll('.legend__rib')].map(r => ({
      t: (r.querySelector('.legend__rib-w') || {}).textContent || '',
      n: (r.querySelector('.legend__rib-n') || {}).textContent || null,
      tier: r.dataset.tier, hidden: !!r.hidden }));
    const drawn = ribs.filter(r => !r.hidden);
    const route = q('.legend__route');
    const app = q('#app');
    return {
      vp: innerWidth + 'x' + innerHeight,
      stage: app.dataset.stage, dossier: app.dataset.dossier, sheet: app.dataset.sheet,
      key: rr(key), keyVisiblePts: pts ? seen + '/' + pts : 'offscreen',
      host: key ? (key.parentElement.className || '') : null,
      say: q('.legend__say') ? q('.legend__say').textContent : null,
      route: route ? route.textContent : null,
      total: ribs.length,
      NAMED: drawn.filter(r => r.tier !== 'bare' && r.t).map(r => r.t + (r.n ? ' ' + r.n : '')),
      drawnUnnamed: drawn.filter(r => r.tier === 'bare').length,
      byline: rr(q('#legend-byline')) || rr(q('.byline')),
      fit: rib ? rib.dataset.fit + '/' + rib.dataset.tier : null,
      docOver: document.documentElement.scrollHeight - innerHeight,
    };
  });

  const at = async (tag, url, after) => {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(2600);
    if (after) { try { await after(); } catch (e) { log(tag + ' AFTER-FAILED ' + e.message); } await page.waitForTimeout(900); }
    const p = await probe();
    log(tag + ' ' + JSON.stringify(p));
    await shot(tag);
    return p;
  };

  const U = 'http://localhost:8777/app/';
  await at('a-plate', U);
  await at('b-working', U + '#year=1900&filter=stage:working');
  await at('c-apparatus', U + '#year=1900&filter=stage:apparatus');
  await at('d-dossier', U + '#year=1900&sel=british-india');
  await at('e-sheet', U, async () => { const r = await page.$('.legend__route'); if (r) await r.click({ timeout: 4000, force: true }); });
  await at('f-both', U + '#year=1900&sel=british-india', async () => { const r = await page.$('.legend__route'); if (r) await r.click({ timeout: 4000, force: true }); });
  await at('g-1783', U + '#year=1783');
  await at('h-1620', U + '#year=1620');

  log('ERRORS ' + JSON.stringify(errs));
};
