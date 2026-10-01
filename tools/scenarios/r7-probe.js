/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1664&sel=new-york', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const body = document.body.innerText;
    const has = body.indexOf('TAKEN FROM') >= 0 || /Taken from/i.test(body);
    const panels = [...document.querySelectorAll('[class]')].map(e=>e.className).filter(c=>typeof c==='string'&&/dossier|ds__|panel/.test(c)).slice(0,25);
    return { len: body.length, has, panels, hash: location.hash, snippet: body.slice(0, 400) };
  });
  log(JSON.stringify(info, null, 1));
};
