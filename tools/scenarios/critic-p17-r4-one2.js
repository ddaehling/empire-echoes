/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const r = await page.evaluate(() => {
    const l = document.querySelector('.legend');
    const st = document.querySelector('.app__stage');
    const t = l? l.innerText.replace(/\s+/g,' ') : '';
    const cls = {};
    if (l) l.querySelectorAll('*').forEach(e=>{ String(e.className).split(/\s+/).forEach(c=>{ if(c) cls[c]=(cls[c]||0)+1; }); });
    return { vw:innerWidth, vh:innerHeight, stageH: st?Math.round(st.getBoundingClientRect().height):0,
      legendH: l?Math.round(l.getBoundingClientRect().height):0,
      classes: Object.entries(cls).filter(([k,v])=>/sw|chip|entry|group|mark/i.test(k)).sort(),
      pct: (t.match(/(\d+)% of the key fits here/)||[])[1] || null,
      foot: (t.match(/Open the full key[^]{0,90}/)||[''])[0],
      text: t.slice(0,400) };
  });
  log(JSON.stringify(r));
};
