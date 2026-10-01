/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1600);
  for (let i = 1; i <= 20; i++) {
    const info = await page.evaluate(() => {
      const g = s => { const e = document.querySelector(s); if(!e) return 'none'; const r = e.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.y)}`; };
      const p = document.querySelector('[aria-label*="scrollable"]');
      return { step:(document.body.innerText.match(/(\d+)\s*\/\s*(\d+)/)||[])[0],
        map:g('.stage__map'), panel: p?`${Math.round(p.getBoundingClientRect().height)}h scroll=${p.scrollHeight}`:'none',
        cloze:(document.body.innerText.match(/\d\/6/)||['-'])[0],
        head:(document.body.innerText.split('\n').slice(0,40).join(' | ')).slice(0,300) };
    });
    log(`=== ${i} :: ${info.step} map=${info.map} panel=${info.panel} cloze=${info.cloze}`);
    await shot('s' + String(i).padStart(2,'0'));
    // gate?
    const place = page.getByRole('button', { name: /Place it first/i });
    if (await place.count() > 0 && await place.first().isVisible()) {
      log('  GATE at step ' + info.step);
      await place.first().click(); await page.waitForTimeout(600);
      await shot('s' + String(i).padStart(2,'0') + '-gate');
      const opt = page.getByRole('button', { name: /complicates it, fairly sure/i });
      if (await opt.count()>0) { await opt.first().click(); await page.waitForTimeout(900); }
      else { const alt = page.getByRole('button',{name:/rather not place/i}); if(await alt.count()>0) await alt.first().click(); await page.waitForTimeout(800); }
      await shot('s' + String(i).padStart(2,'0') + '-placed');
    }
    // commit prompts (input + That is my guess)
    const guess = page.getByRole('button', { name: /That is my guess|rather not guess|Commit|Show me/i });
    if (await guess.count() > 0 && await guess.first().isVisible()) {
      const inp = page.locator('input[type=text],input:not([type])').first();
      if (await inp.count()>0 && await inp.isVisible()) { try{ await inp.fill('4'); }catch(e){} }
      await guess.first().click(); await page.waitForTimeout(800);
    }
    const next = page.getByRole('button', { name: /^Next beat|^Next →|^Next$/i }).first();
    if (await next.count() === 0 || !(await next.isVisible())) {
      const alt = page.getByRole('button',{name:/^Next/i}).first();
      if (await alt.count()===0 || !(await alt.isVisible())) { log('STOP: no Next at ' + info.step); break; }
      await alt.click();
    } else await next.click();
    await page.waitForTimeout(1500);
  }
  await shot('final');
  log('--- final text ---');
  log((await page.evaluate(()=>document.body.innerText)).slice(0,2500));
  log('--- errors ---'); errs.forEach(e=>log(e));
};
