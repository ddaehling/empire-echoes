/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const b = await page.evaluate(() => {
    const m = [...document.querySelectorAll('button,a')].find(e=>/open the full key/i.test(e.innerText));
    if(!m) return null; const r=m.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
  });
  if (b) { await page.mouse.click(b.x,b.y); await page.waitForTimeout(1000); }
  const grab = async (tag) => {
    const t = await page.evaluate(() => {
      const hs = [...document.querySelectorAll('h2,h3,h4,div,section')].filter(e=>/^THREE THINGS WRONG/i.test((e.innerText||'').trim()));
      // find the container whose text starts with the heading
      let best=null;
      for (const e of document.querySelectorAll('section,div')) {
        const s=(e.innerText||'').trim();
        if (/^THREE THINGS WRONG/i.test(s) && s.length<2500) { if(!best || s.length<best.length) best=s; }
      }
      return best || 'NONE';
    });
    log(tag + ' >>> ' + t.replace(/\s+/g,' ').slice(0,1300));
  };
  await grab('A mercator/claimed');
  await page.keyboard.press('p'); await page.waitForTimeout(1200); await grab('B equalearth/claimed');
  await page.keyboard.press('3'); await page.waitForTimeout(1200); await grab('C equalearth/controlled');
  await page.keyboard.press('w'); await page.waitForTimeout(1500); await grab('D weight');
  await page.keyboard.press('w'); await page.waitForTimeout(700);
  await page.keyboard.press('s'); await page.waitForTimeout(1400); await grab('E stitch');
  await page.keyboard.press('s'); await page.waitForTimeout(700);
  await page.keyboard.press('4'); await page.waitForTimeout(1200); await grab('F influenced');
  await page.keyboard.press('h'); await page.waitForTimeout(1200); await grab('G silences');
};
