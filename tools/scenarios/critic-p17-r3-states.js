/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const probe = async (label) => {
    await page.waitForTimeout(1800);
    const t = await page.evaluate(() => {
      const b = document.querySelector('.byline'); const l = document.querySelector('.legend');
      const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width>0 && r.height>0 && getComputedStyle(e).visibility!=='hidden'; };
      const nBylines = document.querySelectorAll('.byline').length, nLegends = document.querySelectorAll('.legend').length;
      return { bylineVisible: vis(b), legendVisible: vis(l), nBylines, nLegends,
        byline: b ? b.innerText.replace(/\n+/g,' | ').slice(0,300) : null,
        legendHead: l ? l.innerText.split('MARKS')[0].replace(/\n+/g,' | ').slice(0,260) : null };
    });
    log('=== ' + label + ' ===\n' + JSON.stringify(t, null, 1));
    await shot(label);
  };
  await page.evaluate(() => location.hash = '#year=1820&compare=1770');
  await probe('compare');
  await page.evaluate(() => location.hash = '#year=1857&tour=company-rule&step=3');
  await probe('tour');
  await page.evaluate(() => location.hash = '#year=1913&panel=evidence');
  await probe('panel-evidence');
  await page.evaluate(() => location.hash = '#year=1913&sel=bengal');
  await probe('dossier');
  await page.evaluate(() => location.hash = '#year=1913&panel=close');
  await probe('close');
};
