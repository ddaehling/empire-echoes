/* RETIRED, WAVE 9 — NOT PART OF THE ACCEPTANCE SUITE (`tools/acceptance.js`).
 * P03 round 3. Superseded by `p03-accept.js`. It starts a route called "anything" and reads a caption element the timeline no longer appends.
 * The guarantee it protected is now protected by `tools/scenarios/p03-accept.js`.
 * Kept, unedited below, as the record of what that round measured. Running it
 * will fail against the current DOM; that is expected and is not a build break. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  const P = () => page.evaluate(() => document.querySelector('.tl').__p03);

  // T1 spine visible in every state
  const t1 = await page.evaluate(async () => {
    const vis = () => { const n = document.querySelector('.tl-spine'); const r = n && n.getBoundingClientRect(); return !!(r && r.width > 100 && r.height > 10); };
    const out = { base: vis() };
    const s = window.BEA.store;
    s.dispatch('setCompareYear', 1914); await new Promise(r=>requestAnimationFrame(r)); out.compare = vis();
    s.dispatch('setCompareYear', null);
    s.dispatch('startTour', 'anything'); await new Promise(r=>requestAnimationFrame(r)); out.tour = vis();
    s.dispatch('endTour');
    s.dispatch('openOverlay', 'close'); await new Promise(r=>requestAnimationFrame(r)); out.overlay = vis();
    s.dispatch('closeOverlay');
    // kill the tours module
    try { window.BEA.registry.report(); } catch(e){}
    return out;
  });
  log('T1 spine visible: ' + JSON.stringify(t1));

  // T2 1820 three lit + caption
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(150);
  log('T2: ' + JSON.stringify(await page.evaluate(() => ({
    lit: [...document.querySelectorAll('.tl-lane[data-on="true"]')].map(b => b.dataset.phase),
    caption: document.querySelector('.tl-spine__caption').innerText,
  }))));

  // T3 Shift+Right from 1856
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1856));
  await page.waitForTimeout(120);
  await page.focus('.tl-ax__rail');
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(200);
  log('T3: ' + JSON.stringify(await page.evaluate(() => ({ landed: window.BEA.store.getState().year, dataSays: window.BEA.data.nextChangeYear(1856, 1) }))));

  // T4 contested markers + reason on focus
  const t4 = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.tl-mark:not([hidden])')];
    const noLabel = btns.filter(b => !b.getAttribute('aria-label') || b.getAttribute('aria-label').length < 30);
    return { marks: btns.length, withoutReason: noLabel.length, sample: btns[3] && btns[3].getAttribute('aria-label').slice(0, 120) };
  });
  log('T4: ' + JSON.stringify(t4));
  // focus one and check the popover appears with a note
  await page.evaluate(() => { const b=[...document.querySelectorAll('.tl-mark:not([hidden])')][3]; b.tabIndex=0; b.focus(); });
  await page.waitForTimeout(200);
  log('T4 popover: ' + JSON.stringify(await page.evaluate(() => { const p=document.querySelector('.tl__pop'); return { open: !p.hidden, text: p.innerText.slice(0,160) }; })));

  // playback stops
  await page.keyboard.press('Escape');
  await page.evaluate(() => { const tl = document.querySelector('.tl').__p03; window.BEA.store.dispatch('setYear', 1996); window.BEA.store.dispatch('setSpeed', 16); tl.play(); });
  await page.waitForTimeout(1600);
  const stop = await page.evaluate(() => ({ y: window.BEA.store.getState().year, playing: window.BEA.store.getState().playing,
    card: (()=>{const c=document.querySelector('.tl__stopcard'); return c && !c.hidden ? c.innerText.replace(/\n/g,' | ') : null;})(),
    row: document.querySelector('.tl__changehead').innerText.replace(/\n/g,' | ') }));
  log('stop at 1997: ' + JSON.stringify(stop, null, 1));
  await shot('stop-1997');
};
