/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 5 — the fold regression test.
 * Asserts the four above-fold answers are inside the dossier's visible box
 * at the viewport the spec names (1280x800), and reports the grid rows. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  const m = await page.evaluate(() => {
    const app = document.querySelector('.app');
    const aside = document.querySelector('.app__dossier');
    const r = aside ? aside.getBoundingClientRect() : null;
    const pick = (sel) => {
      const n = document.querySelector(sel);
      if (!n) return null;
      const b = n.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), text: (n.innerText || '').slice(0, 90) };
    };
    return {
      rows: getComputedStyle(app).gridTemplateRows,
      cols: getComputedStyle(app).gridTemplateColumns,
      time: (() => { const t = document.querySelector('.app__time'); return t ? Math.round(t.getBoundingClientRect().height) : null; })(),
      stage: (() => { const t = document.querySelector('.app__stage'); const b = t && t.getBoundingClientRect(); return b ? { h: Math.round(b.height), w: Math.round(b.width) } : null; })(),
      dossier: r ? { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width) } : null,
      scrollTop: aside ? aside.scrollTop : null,
      scrollH: aside ? aside.scrollHeight : null,
      blocks: {
        name: pick('.dsr__name'),
        status: pick('#dsr-status'),
        taken: pick('#dsr-taken'),
        ended: pick('#dsr-ended'),
      },
      franchise: (() => {
        const n = [...document.querySelectorAll('.app__dossier .dsr__fold .dsr__fact, .app__dossier .dsr__fold p, .app__dossier .dsr__fold li')]
          .find((x) => /who could vote/i.test(x.textContent || ''));
        if (!n) return null;
        const b = n.getBoundingClientRect();
        return { top: Math.round(b.top), bottom: Math.round(b.bottom), text: (n.innerText || '').slice(0, 80) };
      })(),
      innerLen: (document.querySelector('.app__dossier') || { innerText: '' }).innerText.length,
    };
  });
  log(JSON.stringify(m, null, 1));
  const d = m.dossier;
  if (d) {
    for (const [k, v] of Object.entries(m.blocks)) {
      if (!v) { log('FOLD ' + k + ': NOT FOUND'); continue; }
      log('FOLD ' + k + ': bottom ' + v.bottom + ' vs dossier bottom ' + d.bottom + ' -> ' + (v.bottom <= d.bottom ? 'PASS' : 'FAIL'));
    }
    if (m.franchise) log('FOLD franchise: bottom ' + m.franchise.bottom + ' vs ' + d.bottom + ' -> ' + (m.franchise.bottom <= d.bottom ? 'PASS' : 'FAIL'));
    else log('FOLD franchise: NOT FOUND');
  }
  await shot('fold-1280');
};
