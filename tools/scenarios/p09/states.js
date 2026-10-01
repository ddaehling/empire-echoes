module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  // the entry must appear once the reader touches anything, and never at plate
  const atPlate = await page.evaluate(() => ({
    stage: document.getElementById('app').dataset.stage,
    entryHidden: document.querySelector('.mx-entry').hidden,
  }));
  log('PLATE ' + JSON.stringify(atPlate));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(700);
  const atWorking = await page.evaluate(() => ({
    stage: document.getElementById('app').dataset.stage,
    entryHidden: document.querySelector('.mx-entry').hidden,
  }));
  log('WORKING ' + JSON.stringify(atWorking));

  // open it with the keyboard, the way a teacher would
  await page.keyboard.press('m');
  await page.waitForTimeout(700);
  log('AFTER M ' + await page.evaluate(() => location.hash));
  await shot('01-sealed');

  // tab through: the table must be operable without a mouse
  await page.evaluate(() => document.querySelector('.mx-ch').focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  await shot('02-revealed');

  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.mx-t__cb')].find(x => /negotiated/.test(x.textContent));
    b.focus();
  });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  await shot('03-col-negotiated');
  log('COL ' + await page.evaluate(() => location.hash));
  log('DETAIL HEAD ' + await page.evaluate(() => (document.querySelector('.mx-d__t')||{}).innerText));

  const doc = await page.evaluate(() => ({ scrollH: document.documentElement.scrollHeight, inner: innerHeight,
    map: (() => { const e = document.querySelector('.stage__map canvas') || document.querySelector('.stage__map svg'); const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); })() }));
  log('DOC ' + JSON.stringify(doc));

  // close it again; the paint must go with it
  await page.keyboard.press('m');
  await page.waitForTimeout(600);
  log('CLOSED ' + await page.evaluate(() => location.hash + ' sheet=' + (document.getElementById('app').dataset.sheet || '-')));
  await shot('04-closed');
};
