/** w4-switch — change route mid-session and confirm the retrieval plan and the
 *  printed total follow the route the reader is now on. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  log('on core: ' + JSON.stringify(await page.evaluate(() => { const c = BEA.quiz.checkpoints(); return { route: c.route, planned: c.planned, total: c.total }; })));
  await page.evaluate(() => BEA.bus.emit('tours:setRoute', { id: 'eight' }));
  await page.waitForTimeout(900);
  await page.evaluate(() => BEA.bus.emit('tours:beat', { id: 'poster', chapter: 'poster', t: 'T1', n: 1, total: 5, exploring: false }));
  await page.waitForTimeout(500);
  log('after switch to eight: ' + JSON.stringify(await page.evaluate(() => { const c = BEA.quiz.checkpoints(); return { route: c.route, planned: c.planned, total: c.total }; })));
};
