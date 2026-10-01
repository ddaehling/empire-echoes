/* tpack/04-index — is the mirrored step index verified, and does it match the probe? */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(2200);
  const idx = await page.evaluate(() => window.BEA && window.BEA.tourStepIndex || 'absent');
  log('VERIFIED: ' + JSON.stringify(idx === 'absent' ? idx : idx.verified));
  if (idx !== 'absent') {
    for (const [id, r] of Object.entries(idx.routes)) {
      log(id + ' verified=' + r.verified + ' required=' + r.required + ' why=' + r.why);
      log('   beats: ' + JSON.stringify(r.beats));
    }
  }
};
