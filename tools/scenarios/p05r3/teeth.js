/* Prove the mount-time audit ran against the step index, and that the
   runtime voice check would catch a contradiction if one were introduced. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(() => { location.hash = '#tour=core&step=3'; });
  await page.waitForTimeout(1800);
  const a = await page.evaluate(() => (window.BEA && window.BEA.throughLineAudit) || null);
  log('mount audit entryChecked=' + (a && a.entryChecked) + ' ok=' + (a && a.ok) + ' problems=' + JSON.stringify(a && a.problems));
  // now open the Close and read the live voice audit
  await page.evaluate(() => window.BEA.bus.emit('close:open', {}));
  await page.waitForTimeout(1200);
  const v = await page.evaluate(() => window.BEA.closeVoiceAudit);
  log('voice ' + JSON.stringify(v));
  // and the arithmetic the audit forbids, computed independently from the index
  const arith = await page.evaluate(() => {
    const ix = window.BEA.toursIndex;
    const out = {};
    for (const r of Object.keys(ix.routes)) {
      const st = ix.routes[r].steps;
      const carry = st.filter(x => x.kind === 'beat' && !x.optional).length;
      const last = st.length - 1;
      const before = st.filter(x => x.i < last && x.kind === 'beat' && !x.optional).length;
      out[r] = { steps: st.length, beats: carry, beatsBeforeLastStep: before, oldTest: last, wouldHaveLied: carry < last - 1 };
    }
    return out;
  });
  log('arith ' + JSON.stringify(arith, null, 1));
};
