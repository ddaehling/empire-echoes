/* pk/11-matrix — desk or card, at whatever size this is; and the classroom's own numbers. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1700);
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/teaching desk|§/i.test(x.innerText||'')); if(b)b.click(); });
  await page.waitForTimeout(1400);
  const state = await page.evaluate(() => {
    const sm = document.querySelector('.tp-page--small');
    const b = document.querySelector('.cx-sheet__body');
    return { card: !!(sm && !sm.hidden), read: b ? b.clientHeight : null,
      head: (document.querySelector('.cx-sheet__head') || {}).innerText };
  });
  log('STATE ' + JSON.stringify(state));
  if (!state.card) {
    await page.evaluate(() => { const t=[...document.querySelectorAll('[role="tab"]')].find(x=>/classroom/i.test(x.innerText)); if(t)t.click(); });
    await page.waitForTimeout(1200);
    log('CLASSROOM ' + JSON.stringify(await page.evaluate(() => {
      const b=document.querySelector('.cx-sheet__body');
      return { read: b.clientHeight, holds: b.scrollHeight, screens:+(b.scrollHeight/b.clientHeight).toFixed(1),
        lessons: [...document.querySelectorAll('.tp-unit__b')].map(x=>x.innerText.replace(/\n/g,' · ')),
        packs: [...document.querySelectorAll('[data-pack]')].map(x=>x.dataset.pack).filter((v,i,a)=>a.indexOf(v)===i),
        overflowX: document.documentElement.scrollWidth > innerWidth + 1 }; })));
    await shot('classroom');
  } else { await shot('card'); }
};
