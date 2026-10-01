/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3200);
  const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(400); }
  await page.click('.map__zoom--home'); await page.waitForTimeout(1400);
  const r = await page.evaluate(()=>{
    const out=[];
    for (const id of ['au-new-south-wales','au-victoria','au-queensland','au-western-australia','in-bengal','gb-england','ca-ontario']) {
      const o=[...document.querySelectorAll('.map__targets [role="option"]')].find(e=>e.getAttribute('data-unit')===id);
      if(!o){out.push([id,'no target']);continue;}
      const b=o.getBoundingClientRect(); const cx=b.x+b.width/2, cy=b.y+b.height/2;
      const t=document.elementFromPoint(cx,cy);
      out.push([id, Math.round(cx)+','+Math.round(cy), t? (t.className||t.tagName):'null']);
    }
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
