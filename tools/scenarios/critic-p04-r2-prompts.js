/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  for (const id of ['kenya','british-india','new-zealand','barbados','egypt','ireland']) {
    await page.evaluate((i)=>{location.hash='#year=1913&sel='+i;}, id);
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const el = document.querySelector('.dossier');
      const t = el.innerText;
      const qs = (t.match(/[^.!?\n]{8,120}\?/g) || []);
      const inputs = el.querySelectorAll('input, textarea, select, [role=slider], [contenteditable]').length;
      const btns = [...el.querySelectorAll('button')].map(b=>b.innerText.replace(/\n/g,' ').slice(0,40));
      return { qs: qs.slice(0,8), inputs, btnKinds: [...new Set(btns.map(b=>b.split('(')[0].trim()))].slice(0,10) };
    });
    log(id + ' :: questions asked of the student: ' + JSON.stringify(r.qs) + ' | form inputs: ' + r.inputs + ' | buttons: ' + JSON.stringify(r.btnKinds));
  }
};
