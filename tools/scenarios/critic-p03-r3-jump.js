/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1908));
  await page.waitForTimeout(400);
  const rail = await page.$('.tl-ax__rail');
  await rail.focus();
  const seq = [];
  for (let i=0;i<10;i++){ await page.keyboard.press('Shift+ArrowRight'); await page.waitForTimeout(200); seq.push(await page.evaluate(()=>window.BEA.store.getState().year)); }
  log('Shift+Right chain from 1908:', seq.join(' -> '));
  // does it hit 1913 (event-only year)?
  const evYears = await page.evaluate(() => { const tl = window.BEA.data.timeline(); return [...tl.eventsByYear.keys()].sort((a,b)=>a-b).length; });
  log('years with events:', evYears);
  const chYears = await page.evaluate(() => { let n=0; for(let y=1200;y<=2027;y++){ if (window.BEA.data.nextChangeYear(y-1,1)===y) n++; } return n; });
  log('change years reachable by Shift+arrow:', chYears);
  const eventOnly = await page.evaluate(() => {
    const tl = window.BEA.data.timeline();
    const ev = [...tl.eventsByYear.keys()];
    let n=0, sample=[];
    for (const y of ev) { if (window.BEA.data.nextChangeYear(y-1,1) !== y) { n++; if (sample.length<12) sample.push(y); } }
    return {n, total: ev.length, sample};
  });
  log('event years NOT on the Shift-jump chain:', JSON.stringify(eventOnly));
  // jump buttons
  log('buttons:', await page.evaluate(()=>[...document.querySelectorAll('.tl-btn')].map(b=>b.getAttribute('aria-label')).join(' || ')));
};
