/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** P08 — the drive surface: bus, URL, Back, and standing down for the path. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  /* 1. deep link straight into a surface, the way a teacher would set one */
  await page.goto(page.url().split('#')[0] + '#year=1834&filter=viz:plate.abolition,stage:working');
  await page.waitForTimeout(1600);
  log('DEEP LINK ' + JSON.stringify(await page.evaluate(() => ({
    hash: location.hash,
    open: !!document.querySelector('.viz-plate'),
    sheetTitle: (document.querySelector('.cx-sheet__title') || {}).textContent,
    year: window.BEA.store.getState().year,
  }))));
  await shot('deeplink');

  /* 2. bus contract + idempotence: reopening must not reset a committed guess */
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'ratio:compensation' }));
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('.viz-ratio__commit').click());
  await page.waitForTimeout(500);
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'ratio:compensation' }));
  await page.waitForTimeout(400);
  log('IDEMPOTENT ' + JSON.stringify(await page.evaluate(() => ({
    state: document.querySelector('.viz-ratio').dataset.state,
    readout: document.querySelector('.viz-ratio__readout').innerText,
  }))));

  /* 3. Back closes it, because the surface is state and state is in the URL */
  await page.goBack();
  await page.waitForTimeout(900);
  log('AFTER BACK ' + JSON.stringify(await page.evaluate(() => ({
    hash: location.hash, open: !!document.querySelector('.viz-ratio'), sheet: document.getElementById('app').dataset.sheet,
  }))));

  /* 4. events out */
  const events = await page.evaluate(() => new Promise((res) => {
    const got = [];
    const names = ['viz:opened', 'viz:closed', 'viz:figure', 'viz:committed', 'viz:collapsed', 'viz:extentRevealed', 'ask:paintUnits', 'ask:setYear', 'ledger:append', 'ask:sheet'];
    const offs = names.map((n) => window.BEA.bus.on(n, (p) => got.push(n + ' ' + JSON.stringify(p).slice(0, 90))));
    window.BEA.bus.emit('viz:open', { id: 'plate:abolition' });
    setTimeout(() => {
      const f = [...document.querySelectorAll('.viz-fig')].find((n) => n.dataset.fig === 'paid-20m');
      if (f) f.focus();
      setTimeout(() => {
        document.querySelectorAll('.viz-claim__pick')[0].click();
        setTimeout(() => { offs.forEach((o) => o()); res(got); }, 300);
      }, 300);
    }, 500);
  }));
  log('EVENTS\n  ' + events.join('\n  '));

  /* 4b. the module's own route in, at data-stage="apparatus" only */
  await page.evaluate(() => window.BEA.bus.emit('viz:close'));
  await page.waitForTimeout(300);
  const atPlate = await page.evaluate(() => {
    const e = document.querySelector('.viz-entry');
    return { exists: !!e, display: e ? getComputedStyle(e).display : null, stage: document.getElementById('app').dataset.stage };
  });
  log('ENTRY AT ' + atPlate.stage + ': ' + JSON.stringify(atPlate));
  await page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: 'apparatus' }));
  await page.waitForTimeout(600);
  const atApp = await page.evaluate(() => {
    const e = document.querySelector('.viz-entry');
    return { display: getComputedStyle(e).display, text: e.textContent, stage: document.getElementById('app').dataset.stage };
  });
  log('ENTRY AT apparatus: ' + JSON.stringify(atApp));
  await page.evaluate(() => document.querySelector('.viz-entry').click());
  await page.waitForTimeout(700);
  log('INDEX ' + JSON.stringify(await page.evaluate(() => ({
    title: (document.querySelector('.cx-sheet__title') || {}).textContent,
    items: [...document.querySelectorAll('.viz-index__go')].map((n) => n.textContent),
    leaks: /1,000,000|£0\b|300,000,000/.test(document.querySelector('.viz-index').innerText),
  }))));
  await shot('index');
  await page.evaluate(() => document.querySelectorAll('.viz-index__go')[1].click());
  await page.waitForTimeout(600);
  log('FROM INDEX ' + JSON.stringify(await page.evaluate(() => ({ ratio: (document.querySelector('.viz-ratio') || {}).dataset, hash: location.hash }))));

  /* 5. while the authored path is speaking, this piece offers nothing */
  await page.evaluate(() => { window.BEA.bus.emit('viz:close'); window.BEA.bus.emit('tours:state', { running: true, exploring: false }); });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1834));
  await page.waitForTimeout(700);
  log('DURING TOUR, lede says: ' + (await page.evaluate(() => (document.querySelector('.cx-lede__say') || {}).textContent)));

  /* 6. off the path, the band offers a route in */
  await page.evaluate(() => { window.BEA.bus.emit('tours:state', { running: false }); });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1836));
  await page.waitForTimeout(700);
  const offer = await page.evaluate(() => ({
    say: (document.querySelector('.cx-lede__say') || {}).textContent,
    cta: (document.querySelector('.cx-cta') || {}).textContent,
    ctaHidden: document.querySelector('.cx-cta') ? document.querySelector('.cx-cta').hidden : null,
  }));
  log('OFF PATH OFFER ' + JSON.stringify(offer));
  await shot('offer');
  if (offer.cta) {
    await page.evaluate(() => document.querySelector('.cx-cta').click());
    await page.waitForTimeout(700);
    log('AFTER CTA ' + JSON.stringify(await page.evaluate(() => ({ open: !!document.querySelector('.viz-plate'), hash: location.hash }))));
    await shot('offer-opened');
  }
};
