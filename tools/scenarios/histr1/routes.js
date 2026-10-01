module.exports = async ({ page, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const p = window.BEA && window.BEA.toursRoutes;
    if (!p) return 'no payload';
    return JSON.stringify((p.routes||[]).map(x => ({
      id:x.id, label:x.label, for:x.for, isDefault:x.isDefault, steps:x.steps, beats:x.beats,
      minutes:x.minutes, minutesLow:x.minutesLow, minutesExact:x.minutesExact, minutesMax:x.minutesMax,
      minutesExactMax:x.minutesExactMax, minutesSay:x.minutesSay, periods:x.periods, fitsPeriod:x.fitsPeriod,
      covers:x.covers, greyLines:x.greyLines, leaves:x.leaves, strap:x.strap, leavesLead:x.leavesLead
    })), null, 1);
  });
  log(r);
};
