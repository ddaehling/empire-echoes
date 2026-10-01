/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror', e=>errs.push(e.message));
  await page.waitForTimeout(3000);
  const openKey = async () => {
    const b = await page.evaluate(() => {
      const m = [...document.querySelectorAll('button,a')].find(e=>/open the full key|three things wrong/i.test(e.innerText));
      if(!m) return null; const r=m.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
    });
    if (b) { await page.mouse.click(b.x,b.y); await page.waitForTimeout(900); }
  };
  const wrongs = async (tag) => {
    const t = await page.evaluate(() => {
      const hs = [...document.querySelectorAll('*')].filter(e=>/three things wrong/i.test(e.textContent||'') && e.children.length<12);
      const host = document.querySelector('.legend__wrong, [class*="wrong"]');
      if (host) return host.innerText.replace(/\s+/g,' ');
      return 'NO .wrong host';
    });
    log(tag + ' :: ' + t.slice(0,1400));
  };
  await openKey();
  await shot('01-key-open');
  await wrongs('mercator/claimed/1900');
  await page.keyboard.press('p'); await page.waitForTimeout(1200); await wrongs('equalearth/claimed/1900');
  await page.keyboard.press('3'); await page.waitForTimeout(1200); await wrongs('equalearth/controlled/1900');
  await page.keyboard.press('w'); await page.waitForTimeout(1400); await wrongs('weight');
  await shot('02-weight-key');
  await page.keyboard.press('w'); await page.waitForTimeout(800);
  await page.keyboard.press('s'); await page.waitForTimeout(1200); await wrongs('stitch');
  await page.keyboard.press('s'); await page.waitForTimeout(600);
  await page.keyboard.press('4'); await page.waitForTimeout(1200); await wrongs('influenced');
  await shot('03-influenced-key');
  log('ERR '+JSON.stringify(errs));
};
