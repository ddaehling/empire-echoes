module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('door');
  const t = await page.evaluate(() => document.body.innerText);
  log('--- BODY TEXT ---');
  log(t.slice(0, 6000));
  log('--- ROUTES PAYLOAD ---');
  const r = await page.evaluate(() => {
    try { return JSON.stringify(window.BEA && window.BEA.toursRoutes, null, 1); } catch (e) { return 'ERR ' + e.message; }
  });
  log(r ? r.slice(0, 6000) : '(none)');
};
