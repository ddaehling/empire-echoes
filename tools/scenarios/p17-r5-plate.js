/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2600);
  await page.click('.legend__open');
  await page.waitForTimeout(900);
  await shot('plate');
  const r = await page.evaluate(() => {
    const p = document.querySelector('#legend-plate');
    const rr = e => e ? (({x,y,width,height})=>({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(e.getBoundingClientRect()) : null;
    const map = document.querySelector('.stage__map');
    return {
      plate: rr(p),
      details: p ? p.querySelectorAll('details').length : null,
      headings: p ? [...p.querySelectorAll('h3')].map(h=>h.innerText.replace(/\s+/g,' ')) : [],
      truncated: p ? [...p.querySelectorAll('*')].filter(n => n.scrollWidth > n.clientWidth + 2 && getComputedStyle(n).textOverflow === 'ellipsis').map(n=>n.className+' :: '+n.innerText.slice(0,60)) : [],
      map: rr(map),
      colA: rr(p && p.querySelector('.lplate__col--a')),
      colB: rr(p && p.querySelector('.lplate__col--b')),
      critCount: p ? p.querySelectorAll('.lplate__crit > li').length : 0,
      posterQs: p ? p.querySelectorAll('.lplate__q').length : 0,
    };
  });
  log(JSON.stringify(r, null, 1));
  // criticism section reachable + poster
  await page.evaluate(() => { const n = document.querySelector('#legend-poster-h'); if (n) n.scrollIntoView(); });
  await page.waitForTimeout(400);
  await shot('poster');
  log('ERRORS ' + JSON.stringify(errs));
};
