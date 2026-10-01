/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1858'; });
  await page.waitForTimeout(800);
  const link = await page.$('a:has-text("Skip to the timeline")');
  if (link) { await link.evaluate(e=>e.focus()); await page.keyboard.press('Enter'); await page.waitForTimeout(500); }
  log('after skip focus:', await page.evaluate(()=>{const e=document.activeElement;return e.tagName+'.'+e.className+' ['+(e.getAttribute('aria-label')||'').slice(0,60)+']';}));
  const seq=[];
  for(let i=0;i<20;i++){ await page.keyboard.press('Tab'); seq.push(await page.evaluate(()=>{const e=document.activeElement; const r=e.getBoundingClientRect(); return e.tagName+'.'+String(e.className).slice(0,28)+'['+(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,45)+'] '+Math.round(r.width)+'x'+Math.round(r.height);})); }
  log('TAB from timeline:\n'+seq.join('\n'));
  await shot('kbd-focus');
  // can we reach an uncertainty tick?
  const reach = await page.evaluate(()=>{
    const t=[...document.querySelectorAll('.time__slot button')].filter(b=>/date is firm|not settled|approximate/i.test(b.getAttribute('aria-label')||''));
    return {n:t.length, ti:t.slice(0,3).map(b=>b.getAttribute('tabindex')), size:t.slice(0,3).map(b=>{const r=b.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height);})};
  });
  log('uncertainty ticks: '+JSON.stringify(reach));
};
