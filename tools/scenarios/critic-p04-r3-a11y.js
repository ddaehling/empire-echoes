/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1857&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const aria = await page.evaluate(() => {
    const el = document.querySelector('.app__dossier');
    const attrs = {}; for (const a of el.attributes) attrs[a.name] = a.value;
    const heads = Array.from(el.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => h.tagName + ':' + h.innerText.slice(0,50));
    const imgs = Array.from(el.querySelectorAll('svg,img')).map(i => i.getAttribute('aria-label')||i.getAttribute('alt')||i.getAttribute('aria-hidden')||'NONE');
    return { attrs, heads: heads.slice(0,30), headCount: heads.length, imgs: imgs.slice(0,10),
      live: document.querySelectorAll('[aria-live]').length };
  });
  log('ARIA:', JSON.stringify(aria).slice(0,3000));
  // tab in
  await page.evaluate(() => document.querySelector('.app__dossier').focus());
  const seq = [];
  for (let i=0;i<25;i++){
    await page.keyboard.press('Tab');
    const a = await page.evaluate(() => { const e=document.activeElement; const cs=getComputedStyle(e); return { tag:e.tagName, cls:(e.className||'').toString().slice(0,40), txt:(e.innerText||e.getAttribute('aria-label')||'').replace(/\n/g,' ').slice(0,45), outline: cs.outlineWidth+' '+cs.outlineStyle+' '+cs.outlineColor, inDossier: !!e.closest('.app__dossier') }; });
    seq.push(a);
  }
  for (const s of seq) log('TAB', JSON.stringify(s));
  await shot('focus');
};
