/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const m = async (tag) => {
    const b = await page.evaluate(() => {
      const b = document.querySelector('#legend-body');
      const l = document.querySelector('.stage__legend');
      const rows = [...document.querySelectorAll('#legend-body .legend__row, #legend-body li')].filter(e=>e.getBoundingClientRect().height>0);
      let vis = 0;
      const br = b.getBoundingClientRect();
      rows.forEach(r=>{const rr=r.getBoundingClientRect(); if(rr.bottom>br.top+2 && rr.top<br.bottom-2) vis++;});
      return { legendH: Math.round(l.getBoundingClientRect().height), bodyCh: b.clientHeight, bodySh: b.scrollHeight, rowsTotal: rows.length, rowsVisible: vis, stage: Math.round(document.querySelector('#stage').getBoundingClientRect().height), win: window.innerHeight };
    });
    log(tag, JSON.stringify(b));
  };
  await m('h=window');
  await shot('full');
  await shot('legend', '.stage__legend');
};
