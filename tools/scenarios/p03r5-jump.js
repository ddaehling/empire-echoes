/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  log(JSON.stringify(await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    let same = 0, diff = 0, examples = [];
    for (let y = p.bounds.min; y < p.bounds.max; y++) {
      const mine = p.nextChange(y, 1);
      const theirs = p.data.nextChangeYear ? p.data.nextChangeYear(y, 1) : null;
      if (mine === theirs) same++; else { diff++; if (examples.length < 8) examples.push(`${y}: mine=${mine} data=${theirs}`); }
    }
    return { same, diff, examples, storyYears: p.storyYears.length, changeYears: p.def.changeYears.length, eventYears: p.events.years.length };
  }), null, 1));
};
