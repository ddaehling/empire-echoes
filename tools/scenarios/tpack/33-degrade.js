/* tpack/33-degrade — with tours.json unreachable, the pack must print the state
   links and say why, and print no step number at all. */
const fs = require('fs');
module.exports = async ({ page, log }) => {
  await page.route('**/js/tours/tours.json', (r) => r.abort());
  await page.goto(page.url().split('#')[0] + '#panel=classroom');
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { window.print = () => {}; });
  log('index: ' + JSON.stringify(await page.evaluate(() => {
    const i = window.BEA.tourStepIndex;
    return i ? { verified: i.verified, routes: Object.keys(i.routes || {}) } : 'absent';
  })));
  log('lesson steps on screen: ' + await page.evaluate(() => document.querySelectorAll('.tp-lesson__step').length));
  log('moves block: ' + JSON.stringify(await page.evaluate(() =>
    [...document.querySelectorAll('.tp-moves__i')].map(n => n.innerText.replace(/\s+/g, ' ').slice(0, 90)))));
  await page.evaluate(() => {
    const li = [...document.querySelectorAll('[data-pack]')].find(x => x.dataset.pack === 'plan');
    if (li) li.querySelector('button').click();
  });
  await page.waitForTimeout(600);
  const txt = await page.evaluate(() => (document.querySelector('.tp-paper') || {}).innerText || '');
  log('plan mentions step numbers: ' + /step \d+ of \d+/.test(txt));
  log('plan says why: ' + (txt.match(/could not confirm[^.]*\./) || ['no'])[0]);
  log('plan has state links: ' + /#year=1921/.test(txt));
  fs.mkdirSync('/tmp/tp-r2/deg', { recursive: true });
  try { await page.pdf({ path: '/tmp/tp-r2/deg/plan.pdf', printBackground: true, preferCSSPageSize: true }); } catch (e) { log('pdf ' + e.message); }
};
