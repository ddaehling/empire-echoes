/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(2600);
  const probe = async (tag) => {
    const r = await page.evaluate(() => {
      const leg = document.querySelector('.legend');
      const by = document.querySelector('#legend-byline');
      const sc = leg && leg.querySelector('.legend__scroll');
      const rr = e => e ? (({x,y,width,height})=>({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(e.getBoundingClientRect()) : null;
      const clip = (() => {
        if (!leg) return null;
        const lb = leg.getBoundingClientRect();
        const over = [...leg.querySelectorAll('*')].filter(n => {
          const b = n.getBoundingClientRect();
          return b.height > 0 && (b.bottom > lb.bottom + 1 || b.top < lb.top - 1);
        }).map(n => n.className && n.className.toString().slice(0,40));
        return [...new Set(over)].slice(0,8);
      })();
      return {
        legend: rr(leg), scroll: rr(sc), scrollState: sc && sc.dataset.state,
        hasColours: !!(leg && leg.querySelector('.legend__colours')),
        colourChips: leg ? [...leg.querySelectorAll('.legend__colours .legend__chip-w')].map(n=>n.textContent) : [],
        overflowing: clip,
        legText: leg ? leg.innerText.replace(/\s+/g,' ') : null,
        byText: by ? by.innerText.replace(/\s+/g,' ') : null,
      };
    });
    log('### ' + tag + '\n' + JSON.stringify(r, null, 1));
    return r;
  };
  await probe('boot 1900');
  await page.keyboard.press('w'); await page.waitForTimeout(800); await probe('W on @1900');
  await page.evaluate(() => { location.hash = '#year=1620'; });
  await page.waitForTimeout(1200); await probe('W @1620');
  await shot('w-1620');
  await page.keyboard.press('s'); await page.waitForTimeout(600);
  await page.keyboard.press('h'); await page.waitForTimeout(900);
  await probe('W+S+H @1620');
  await shot('wsh-1620');
  await page.keyboard.press('2'); await page.waitForTimeout(700);
  await probe('W+S+H+def2 @1620');
  await shot('wshd-1620');
  await page.evaluate(() => { location.hash = '#year=1950'; });
  await page.waitForTimeout(1200); await probe('W+S+H+def2 @1950');
  await shot('wsh-1950');
  log('ERRORS ' + JSON.stringify(errs));
};
