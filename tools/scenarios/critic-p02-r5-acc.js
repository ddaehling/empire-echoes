/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const q = async (year, ids) => {
    const r = await page.evaluate(([year, ids]) => {
      const st = window.BEA.data.statusAt(year);
      const get = id => { const e = st instanceof Map ? st.get(id) : st[id]; return e ? {status:e.status, deg:e.controlDegree, partial:e.partial, since:e.since, circa:e.circa, contested: !!e.contested} : null; };
      return Object.fromEntries(ids.map(i => [i, get(i)]));
    }, [year, ids]);
    log(year + ': ' + JSON.stringify(r));
  };
  await q(1900, ['egypt','eg-egypt','cyprus','ie-ireland','in-bengal-presidency','sudan','south-africa-transvaal']);
  await q(1922, ['iraq','palestine','ie-irish-free-state','egypt','eg-egypt']);
  await q(1913, ['iran','ar-buenos-aires','cn-weihaiwei']);
  // list all ids matching
  const ids = await page.evaluate(() => { const st = window.BEA.data.statusAt(1900); const a = st instanceof Map ? [...st.keys()] : Object.keys(st); return a.filter(i=>/egypt|cyprus|irel|sudan/i.test(i)); });
  log('ids: ' + JSON.stringify(ids));
};
