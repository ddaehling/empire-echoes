/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1957', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  await page.keyboard.press('h'); await page.waitForTimeout(1800);
  const o = await page.evaluate(() => {
    const d = window.BEA && window.BEA.data;
    const res = { silencesShape: null, list: [] };
    try {
      const sils = [];
      (d.territories||[]).forEach(t => { if (t.silences && t.silences.length) sils.push({id:t.id,name:t.name,n:t.silences.length, s:t.silences.map(s=>({kind:s.kind,agent:s.agent,year:s.year||s.date,summary:(s.summary||s.text||'').slice(0,120)}))}); });
      res.list = sils.slice(0,20); res.count = sils.length;
    } catch(e){ res.err = String(e); }
    return res;
  });
  log('SILENCES ' + JSON.stringify(o, null, 1).slice(0, 5000));
  await page.mouse.move(1430, 380); await page.waitForTimeout(900);
  await shot('hover-aus');
  const zoom = await page.evaluate(()=>{ return document.title; });
  log('title', zoom);
};
