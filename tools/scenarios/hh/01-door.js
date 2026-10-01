/* hh/01-door — head of history, round 2. What does the app say on the door, cold? */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);
  await shot('door');
  const txt = await page.evaluate(() => document.body.innerText);
  log('--- DOOR TEXT ---\n' + txt.slice(0, 4000));
  log('--- ROUTES PAYLOAD ---');
  log(JSON.stringify(await page.evaluate(() => window.BEA && window.BEA.toursRoutes || 'absent'), null, 1).slice(0, 6000));
};
