/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* The critic's own measurement, re-run: interrogatives, inputs, non-navigation buttons. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  const out = await page.evaluate(async () => {
    const store = window.BEA.store;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const rows = [];
    for (const id of ['kenya', 'british-india', 'new-zealand', 'barbados', 'egypt', 'ireland']) {
      store.batch((d) => { d('setYear', 1913); d('select', id); });
      await sleep(120);
      const a = document.querySelector('.dossier');
      const txt = a.innerText;
      rows.push({
        id,
        chars: txt.length,
        interrogatives: (txt.match(/\?/g) || []).length,
        commitControls: a.querySelectorAll('button.dsr__choice').length,
        commitsAvailable: a.querySelectorAll('[data-ask][data-state="open"]').length,
        revealsHeld: a.querySelectorAll('[data-ask][data-state="open"]').length,
      });
    }
    return rows;
  });
  for (const r of out) log(JSON.stringify(r));
};
