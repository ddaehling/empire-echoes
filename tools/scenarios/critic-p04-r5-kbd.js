/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  // Focus first element of dossier and tab through 30 stops
  await page.evaluate(() => document.getElementById('dossier').querySelector('button')?.focus());
  const stops = [];
  for (let i = 0; i < 30; i++) {
    const f = await page.evaluate(() => {
      const a = document.activeElement;
      const cs = a ? getComputedStyle(a) : null;
      const r = a ? a.getBoundingClientRect() : null;
      return a ? { tag: a.tagName, cls: String(a.className).slice(0,40), txt: (a.innerText||a.getAttribute('aria-label')||'').replace(/\n/g,' ').slice(0,50),
        outline: cs.outlineWidth + ' ' + cs.outlineStyle, inDossier: !!a.closest('#dossier'), visible: r.width>0&&r.height>0, top: Math.round(r.top) } : null;
    });
    stops.push(f);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(60);
  }
  stops.forEach((s,i)=>log('tab'+i, JSON.stringify(s)));
  // Escape closes?
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  log('after Esc hash:', await page.evaluate(()=>location.hash));
  log('dossier text after Esc:', (await page.evaluate(()=>document.getElementById('dossier').innerText)).slice(0,200).replace(/\n/g,' | '));
  await shot('after-esc');
  // aria structure
  const aria = await page.evaluate(() => {
    const d = document.getElementById('dossier');
    return { role: d.getAttribute('role'), label: d.getAttribute('aria-label'), live: d.getAttribute('aria-live'), tabindex: d.getAttribute('tabindex'),
      headings: [...d.querySelectorAll('h1,h2,h3,h4')].map(h=>h.tagName+':'+h.innerText.slice(0,40)) };
  });
  log('ARIA:', JSON.stringify(aria));
};
