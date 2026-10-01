/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const k = await page.evaluate(() => Object.keys(window.BEA||{}));
  log('BEA keys:', JSON.stringify(k));
  const d = await page.evaluate(() => {
    const B = window.BEA;
    const out = {};
    try { out.dataKeys = Object.keys(B.data||{}); } catch(e){ out.e1=String(e); }
    try { out.stateKeys = Object.keys((B.store&&B.store.get&&B.store.get())||B.state||{}); } catch(e){ out.e2=String(e); }
    return out;
  });
  log('D:', JSON.stringify(d, null, 1).slice(0,2500));
  const s = await page.evaluate(() => {
    const B = window.BEA; const data = B.data;
    const ids = ['us-florida','hawaii','reunion','id-maluku','pitcairn-islands','cn-weihaiwei','anguilla'];
    return ids.map(id => { try { const s = data.statusAt(id, 1900); return {id, s}; } catch(e){ return {id, err:String(e)}; } });
  });
  log('STATUS1900:', JSON.stringify(s, null, 1).slice(0,3000));
};
