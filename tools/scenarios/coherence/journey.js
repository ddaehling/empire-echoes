// P22 coherence — a cold 15-minute student journey.
module.exports = async ({ page, shot, log }) => {
  const st = () => page.evaluate(() => {
    const s = window.BEA && BEA.store.getState();
    if (!s) return { none: true };
    const app = document.getElementById('app');
    return {
      year: s.year, sel: s.selectedTerritoryId, layer: s.activeLayer,
      panels: s.panelState, tour: s.activeTour, step: s.tourStep,
      filters: s.filters, hash: location.hash,
      dataAttrs: app ? Object.fromEntries([...app.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value])) : null,
    };
  });

  await page.waitForTimeout(2600);
  log('BOOT STATE', JSON.stringify(await st()));
  await shot('01-land-cold');

  // What text greets you?
  log('VISIBLE TEXT ON LANDING:\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 2200));

  // Registry
  log('REGISTRY', JSON.stringify(await page.evaluate(() => { const r = BEA.registry.report(); return { mounted: r.mounted, failed: r.failed, absent: r.absent }; })));

  // 2. Scrub the years using the timeline UI as a student would: drag the scrubber.
  const scrub = await page.evaluate(() => {
    const cand = document.querySelector('[data-mount="timeline"] input[type="range"], [data-mount="timeline"] [role="slider"]');
    if (!cand) return null;
    const r = cand.getBoundingClientRect();
    return { tag: cand.tagName, role: cand.getAttribute('role'), x: r.x, y: r.y, w: r.width, h: r.height };
  });
  log('SCRUBBER', JSON.stringify(scrub));
  if (scrub) {
    await page.mouse.move(scrub.x + scrub.w * 0.20, scrub.y + scrub.h / 2);
    await page.mouse.down();
    for (const f of [0.3, 0.45, 0.62, 0.78]) { await page.mouse.move(scrub.x + scrub.w * f, scrub.y + scrub.h / 2); await page.waitForTimeout(160); }
    await page.mouse.up();
    await page.waitForTimeout(500);
    await shot('02-after-scrub');
    log('AFTER SCRUB', JSON.stringify(await st()));
  }

  // 3. Go to a canonical teaching year and click a territory on the map.
  await page.evaluate(() => BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(700);
  await shot('03-1913');

  // find a big unit to click: India
  const target = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[data-unit-id]')];
    const pick = els.find(e => /in-uttar|in-|india/i.test(e.getAttribute('data-unit-id'))) || els[0];
    if (!pick) return null;
    const r = pick.getBoundingClientRect();
    return { id: pick.getAttribute('data-unit-id'), x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
  });
  log('CLICK TARGET', JSON.stringify(target));
  if (target && target.w > 0) {
    await page.mouse.move(target.x, target.y);
    await page.waitForTimeout(450);
    await shot('04-hover-unit');
    await page.mouse.click(target.x, target.y);
    await page.waitForTimeout(900);
    await shot('05-selected-dossier');
    log('AFTER SELECT', JSON.stringify(await st()));
    log('DOSSIER TEXT:\n' + (await page.evaluate(() => { const d = document.querySelector('[data-mount="dossier"]'); return d ? d.innerText.slice(0, 2500) : 'NO DOSSIER'; })));
  }

  // 4. Legend
  log('LEGEND TEXT:\n' + (await page.evaluate(() => { const d = document.querySelector('[data-mount="legend"]'); return d ? d.innerText.slice(0, 1600) : 'NO LEGEND'; })));
  await shot('06-legend', '[data-mount="legend"]');

  // 5. Scrub past independence while selected — does the selection die gracefully?
  await page.evaluate(() => BEA.store.dispatch('setYear', 1975));
  await page.waitForTimeout(800);
  await shot('07-selection-after-independence');
  log('AFTER 1975', JSON.stringify(await st()));
  log('DOSSIER AT 1975:\n' + (await page.evaluate(() => { const d = document.querySelector('[data-mount="dossier"]'); return d ? d.innerText.slice(0, 1200) : 'NO DOSSIER'; })));

  // 6. A year where nothing is British
  await page.evaluate(() => BEA.store.dispatch('setYear', 1600));
  await page.waitForTimeout(800);
  await shot('08-1600-empty');
  log('AT 1600', JSON.stringify(await st()));
  log('STAGE NOTE 1600:', await page.evaluate(() => { const d = document.querySelector('[data-mount="stage-note"]'); return d ? d.innerText.slice(0,600) : 'none'; }));
  log('STATUSBAR 1600:', await page.evaluate(() => { const d = document.querySelector('[data-mount="statusbar"]'); return d ? d.innerText.slice(0,600) : 'none'; }));

  // 7. Definition switch coherence
  await page.evaluate(() => BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(400);
  await page.keyboard.press('3');
  await page.waitForTimeout(700);
  await shot('09-definition-controlled');
  log('AFTER key 3', JSON.stringify(await st()));
  log('LEGEND AFTER DEF:', await page.evaluate(() => { const d = document.querySelector('[data-mount="legend"]'); return d ? d.innerText.slice(0, 700) : 'none'; }));
  log('STAGE NOTE AFTER DEF:', await page.evaluate(() => { const d = document.querySelector('[data-mount="stage-note"]'); return d ? d.innerText.slice(0,400) : 'none'; }));

  // 8. Deselect / empty state
  await page.evaluate(() => BEA.store.dispatch('deselect'));
  await page.waitForTimeout(600);
  await shot('10-nothing-selected');
  log('DOSSIER EMPTY STATE:\n' + (await page.evaluate(() => { const d = document.querySelector('[data-mount="dossier"]'); return d ? d.innerText.slice(0, 900) : 'none'; })));

  // 9. Back button
  await page.goBack(); await page.waitForTimeout(600);
  log('AFTER BACK', JSON.stringify(await st()));
  await shot('11-after-back');

  // 10. Reload from URL
  await page.goto('http://localhost:8777/app/#year=1857&sel=bengal', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await shot('12-deeplink-1857-bengal');
  log('DEEPLINK STATE', JSON.stringify(await st()));
  log('DEEPLINK dossier head:\n' + (await page.evaluate(() => { const d = document.querySelector('[data-mount="dossier"]'); return d ? d.innerText.slice(0, 900) : 'none'; })));
};
