/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2800);
  const r = await page.evaluate(() => {
    const rr = e => e ? (({x,y,width,height})=>({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(e.getBoundingClientRect()) : null;
    const slot = document.querySelector('[data-mount="legend"]');
    const kb = document.querySelector('.byline__key');
    const cb = document.querySelector('.byline__crit');
    const at = e => { if (!e) return null; const b = e.getBoundingClientRect(); const n = document.elementFromPoint(b.x+b.width/2, b.y+b.height/2); return n ? n.tagName+'.'+(n.className||'') : null; };
    return { slot: rr(slot), slotHidden: slot ? getComputedStyle(slot).display : null, slotPhone: slot && slot.dataset.phone,
      legendPresent: !!document.querySelector('.legend'),
      keyBtn: rr(kb), keyBtnHit: at(kb), critBtn: rr(cb), critBtnHit: at(cb),
      byline: rr(document.querySelector('#legend-byline')),
      stage: rr(document.querySelector('.app__stage')) };
  });
  log(JSON.stringify(r, null, 1));
  await shot('mob-boot');
  const kb = await page.$('.byline__key');
  if (kb) { await kb.click({ timeout: 4000 }); log('key button click OK'); }
  await page.waitForTimeout(900);
  await shot('mob-plate');
  const r2 = await page.evaluate(() => {
    const rr = e => e ? (({x,y,width,height})=>({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(e.getBoundingClientRect()) : null;
    return { plate: rr(document.querySelector('#legend-plate')), map: rr(document.querySelector('.stage__map')), stage: rr(document.querySelector('.app__stage')) };
  });
  log(JSON.stringify(r2, null, 1));
  log('ERRORS ' + JSON.stringify(errs));
};
