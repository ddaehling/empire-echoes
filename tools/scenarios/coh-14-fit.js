/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1000);
  log(await page.evaluate(() => {
    const t=document.querySelector('.tl'), s=document.querySelector('.app__time');
    const r=x=>{const e=document.querySelector(x);if(!e)return null;const b=e.getBoundingClientRect();return Math.round(b.y)+'..'+Math.round(b.bottom)+' h'+Math.round(b.height);};
    return JSON.stringify({vh:innerHeight, timeSlot:r('.app__time'), tl:r('.tl'), tlRows:getComputedStyle(t).gridTemplateRows,
      deck:r('.tl__deck'), chg:r('.tl__changes'), body:r('.tl__body'), ax:r('.tl-ax'), rate:r('.tl-rate'), spine:r('.tl-spine'),
      spineTrack:r('.tl-spine__track'), spineFoot:r('.tl-spine__foot'), rateHead:r('.tl-rate__head'), rateCap:r('.tl-rate__caption'),
      foot:r('.app__foot'), need: t.scrollHeight, have: t.clientHeight });
  }));
};
