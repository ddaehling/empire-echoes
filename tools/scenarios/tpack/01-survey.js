/* tpack/01-survey — what BEA publishes, and what each classroom sheet costs on A4. */
const fs = require('fs');
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });

  log('BEA KEYS: ' + JSON.stringify(await page.evaluate(() => Object.keys(window.BEA || {}).sort())));
  log('ANSWERKEY: ' + JSON.stringify(await page.evaluate(() => {
    const k = window.BEA && window.BEA.toursAnswerKey;
    return Array.isArray(k) ? k.slice(0, 40).map(r => [r.step, r.beatId, r.optional]) : 'absent';
  })));
  log('TOURSSTATE: ' + JSON.stringify(await page.evaluate(() => window.BEA && window.BEA.toursState || 'absent')));
  log('STEPINDEX: ' + JSON.stringify(await page.evaluate(() => window.BEA && window.BEA.toursSteps || window.BEA && window.BEA.tourSteps || 'absent')));

  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(900);
  await shot('classroom-tab');

  const items = await page.evaluate(() => [...document.querySelectorAll('.tp-packs__i')]
    .map(li => (li.querySelector('.tp-packs__t') || {}).innerText || li.innerText.slice(0, 60)));
  log('PACK ITEMS: ' + JSON.stringify(items));

  const dir = '/tmp/tp-r2/pdf';
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < items.length; i++) {
    const btn = page.locator('.tp-packs__i').nth(i).locator('button').first();
    try { await btn.click(); } catch (e) { log('click fail ' + i + ' ' + e.message); continue; }
    await page.waitForTimeout(500);
    const meta = await page.evaluate(() => {
      const p = document.querySelector('.tp-paper');
      return p ? { chars: p.innerText.length, title: (p.querySelector('.tp-paper__pack') || {}).innerText } : null;
    });
    const name = String(i).padStart(2, '0') + '-' + String(items[i]).replace(/[^\w]+/g, '_').slice(0, 40);
    try { await page.pdf({ path: dir + '/' + name + '.pdf', format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } }); }
    catch (e) { log('PDF FAIL ' + name + ' ' + e.message); }
    log('SHEET ' + i + ' | ' + items[i] + ' | ' + JSON.stringify(meta));
  }
};
