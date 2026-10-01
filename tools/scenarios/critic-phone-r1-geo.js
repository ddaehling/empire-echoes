/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1800);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1600);
  const g = await page.evaluate(() => {
    const b = s => { const e = document.querySelector(s); if (!e) return s + ': ABSENT'; const r = e.getBoundingClientRect(); return `${s}: ${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} bottom=${Math.round(r.bottom)}`; };
    const sels = ['.app__bar','.app__lede','.app__stage','.stage__map','.stage__map svg','.map__ribbon','.app__panel','.app__time','.app__foot','.tl-ax','.cl-bar'];
    const out = sels.map(b);
    // find the scrolling prose region inside panel
    const p = document.querySelector('.app__panel');
    if (p) {
      const scrollers = [...p.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 4 && getComputedStyle(e).overflowY !== 'visible');
      out.push('panel scrollers: ' + scrollers.map(e => `${e.className.toString().slice(0,30)} client=${e.clientHeight} scroll=${e.scrollHeight}`).join(' | '));
    }
    // any element whose text is visually clipped by app__time
    const t = document.querySelector('.app__time');
    if (t) {
      const tr = t.getBoundingClientRect();
      const bad = [];
      document.querySelectorAll('.app__panel p, .app__panel h1, .app__panel h2, .app__panel h3, .app__panel li, .app__panel label').forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.height > 0 && r.top < tr.top && r.bottom > tr.top + 2) bad.push(`${e.tagName}.${e.className.toString().slice(0,24)} top=${Math.round(r.top)} bot=${Math.round(r.bottom)} timeTop=${Math.round(tr.top)} "${e.innerText.trim().slice(0,50)}"`);
      });
      out.push('CLIPPED BY TIMELINE (' + bad.length + '):\n  ' + bad.join('\n  '));
    }
    return out.join('\n');
  });
  log(g);
  const cls = await page.evaluate(() => {
    const q = [];
    document.querySelectorAll('.app__bar button, .app__bar a').forEach(e => q.push(e.className + ' :: ' + (e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,30)));
    return q.join('\n');
  });
  log('bar controls:\n' + cls);
};
