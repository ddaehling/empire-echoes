module.exports = async ({ page, shot, log }) => {
  const st = () => page.evaluate(() => {
    const s = BEA.store.getState();
    return { year: s.year, sel: s.selectedTerritoryId, filters: s.filters, panels: s.panelState, hash: location.hash,
      dossierOpen: document.getElementById('app').dataset.dossier };
  });
  await page.waitForTimeout(2600);

  log('OVERLAY CONTENT', await page.evaluate(() => { const o = document.querySelector('[data-mount="overlay"]'); return [...o.children].map(c=>c.tagName+'.'+(c.className||'')+' vis='+ (c.getBoundingClientRect().width>0)).join(' | '); }));

  // click India
  await page.evaluate(() => BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(600);
  const t = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[data-unit]')];
    const names = els.map(e => e.getAttribute('data-unit'));
    const pick = els.find(e => /^in-/.test(e.getAttribute('data-unit'))) || els[0];
    const r = pick.getBoundingClientRect();
    return { total: els.length, id: pick.getAttribute('data-unit'), x: r.x+r.width/2, y: r.y+r.height/2, sampleIds: names.slice(0,8) };
  });
  log('TARGETS', JSON.stringify(t));
  await page.mouse.move(t.x, t.y); await page.waitForTimeout(500);
  await shot('hover');
  await page.mouse.click(t.x, t.y); await page.waitForTimeout(1000);
  await shot('selected');
  log('AFTER CLICK', JSON.stringify(await st()));
  log('DOSSIER:\n' + await page.evaluate(() => { const d = document.querySelector('.dossier, [data-mount="dossier"]'); return d ? d.innerText.slice(0,3000) : 'none'; }));
  // scroll dossier
  await page.evaluate(() => { const d = document.querySelector('[data-mount="dossier"]'); if (d) d.scrollTop = 900; const p = d && d.closest('.dossier'); if (p) p.scrollTop = 900; });
  await page.waitForTimeout(400); await shot('dossier-scrolled');
  // move past independence
  await page.evaluate(() => BEA.store.dispatch('setYear', 1975));
  await page.waitForTimeout(900); await shot('after-independence');
  log('1975', JSON.stringify(await st()));
  log('DOSSIER 1975 head:\n' + await page.evaluate(() => { const d = document.querySelector('[data-mount="dossier"]'); return d ? d.innerText.slice(0,1200) : 'none'; }));
  // back
  await page.goBack(); await page.waitForTimeout(700);
  log('BACK1', JSON.stringify(await st()).slice(0,300));
  await page.goBack(); await page.waitForTimeout(700);
  log('BACK2', JSON.stringify(await st()).slice(0,300));
  await shot('back');
};
