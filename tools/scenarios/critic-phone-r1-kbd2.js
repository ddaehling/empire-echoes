/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.goto(page.url().split('#')[0] + '#tour=thirty&step=3&filter=stage:working,pressure:off');
  await page.waitForTimeout(1800);
  for (let i = 0; i < 22; i++) {
    await page.keyboard.press('Tab');
    const a = await page.evaluate(() => {
      const e = document.activeElement; if (!e) return null;
      const r = e.getBoundingClientRect();
      const cx = r.x + r.width/2, cy = r.y + r.height/2;
      const top = document.elementFromPoint(cx, cy);
      const occluded = top && !e.contains(top) && top !== e;
      const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && r.width>0;
      let anc = e, hidden=false;
      while (anc && anc !== document.body) { const cs=getComputedStyle(anc); if (cs.visibility==='hidden'||cs.display==='none'||cs.opacity==='0') {hidden=true;break;} anc=anc.parentElement; }
      return { t: (e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,34), cls: e.className.toString().slice(0,24), y: Math.round(r.y), inView, occluded, hidden, topEl: top ? top.className.toString().slice(0,28) : 'null' };
    });
    if (a) log(`${i}: y=${a.y} inView=${a.inView} OCCLUDED=${a.occluded} hidden=${a.hidden} top="${a.topEl}" :: .${a.cls} "${a.t}"`);
    if (i === 12) await shot('tab12');
    if (i === 21) await shot('tab21');
  }
};
