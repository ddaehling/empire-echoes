/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getAttribute').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2800);
  const r = await page.evaluate(() => {
    const mine = [...document.querySelectorAll('.legend button, #legend-byline button, #legend-plate button, #legend-plate textarea')];
    return { count: mine.length,
      unnamed: mine.filter(b => !(b.textContent||'').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length,
      dupNames: (() => { const n = mine.map(b=>(b.textContent||'').trim().slice(0,40)); const seen={}; const d=[];
        for (const x of n) { if (seen[x]) d.push(x); seen[x]=1; } return d; })(),
      byline: { role: document.getElementById('legend-byline').getAttribute('role'),
        label: document.getElementById('legend-byline').getAttribute('aria-label') },
      headings: [...document.querySelectorAll('.legend h2, .legend h3')].map(h=>h.tagName+':'+h.textContent.trim().slice(0,40)),
      colourBtnAria: [...document.querySelectorAll('.legend__colours .legend__chip--fam')].map(b=>b.title.slice(0,50)),
    };
  });
  log(JSON.stringify(r, null, 1));
  // keyboard reach: tab until we hit our controls
  const seen = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const a = await page.evaluate(() => { const e = document.activeElement;
      return e ? (e.getAttribute('data-focus-key') || e.className || e.tagName) : null; });
    if (a && /focus-key|legend|byline/.test(String(a))) seen.push(i + ':' + a);
    if (seen.length >= 6) break;
  }
  log('tab reach: ' + JSON.stringify(seen));
  log('ERRORS ' + JSON.stringify(errs));
};
