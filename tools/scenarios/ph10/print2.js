module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(700);
  await page.evaluate(() => { location.hash = '#panel=classroom'; });
  await page.waitForTimeout(2000);
  await shot('00-classroom');
  const all = await page.evaluate(() => document.body.innerText);
  log('CLASSROOM MINUTE SENTENCES:\n' + (all.match(/[^.\n]{0,200}\bminutes?\b[^.\n]{0,160}/gi) || ['(none)']).join('\n---\n'));
  log('CLASSROOM TEXT (first 7000)>>>\n' + all.slice(0, 7000) + '\n<<<');
};
