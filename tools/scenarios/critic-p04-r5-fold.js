/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  // dismiss any overlays
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await shot('01-after-escape');
  const el = await page.$('[data-slot="dossier"], #dossier, .dossier');
  await el.screenshot({ path: require('path').join(process.env.SHOT_DIR || '/tmp/p04r5-fold', 'dossier-crop.png') }).catch(e=>log('cropfail', e.message));
  const d = await page.evaluate(() => {
    const el = document.querySelector('[data-slot="dossier"], #dossier, .dossier');
    const r = el.getBoundingClientRect();
    // what is above the fold (within viewport height)
    const heads = [...el.querySelectorAll('h1,h2,h3,h4,[class*=head],[class*=label]')].slice(0,40)
      .map(n=>({t:n.textContent.trim().slice(0,60), y: Math.round(n.getBoundingClientRect().top)}));
    return { rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
      scrollH: el.scrollHeight, clientH: el.clientHeight,
      innerScrollers: [...el.querySelectorAll('*')].filter(n=>n.scrollHeight>n.clientHeight+4).length,
      heads, html: el.innerHTML.length };
  });
  log(JSON.stringify(d, null, 1));
  log('ERRORS', JSON.stringify(errs));
};
