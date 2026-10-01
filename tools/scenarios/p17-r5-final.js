/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 5 — the whole run: the headline regression, staleness, clipping,
   the fold, the keyboard and a scrub, with every error collected. */
module.exports = async ({ page, shot, log }) => {
  const errs=[], reqs=[];
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  page.on('requestfailed',r=>reqs.push(r.url()));
  await page.waitForTimeout(2800);

  const key = () => page.evaluate(() => {
    const leg = document.querySelector('.legend');
    if (!leg) return { legend: null };
    const r = leg.getBoundingClientRect();
    const foot = leg.querySelector('.legend__foot');
    const fr = foot ? foot.getBoundingClientRect() : null;
    const chips = [...leg.querySelectorAll('.legend__colours .legend__chip--fam')];
    return {
      h: Math.round(r.height),
      hasColours: chips.length > 0,
      colours: chips.map(c => c.querySelector('.legend__chip-w').textContent + ' ' + c.querySelector('.legend__count').textContent),
      swatchTex: chips.map(c => (c.querySelector('.sym')||{}).dataset ? (c.querySelector('.sym').dataset.tex||'plain') : null),
      footInside: fr ? Math.round(fr.bottom) <= Math.round(r.bottom) + 1 : null,
      clipped: [...leg.querySelectorAll('*')].filter(n=>{const b=n.getBoundingClientRect();
        return b.height>0 && (b.bottom > r.bottom+1 || b.top < r.top-1);}).length,
      scroll: (leg.querySelector('.legend__scroll')||{dataset:{}}).dataset.state,
      figures: (leg.querySelector('.legend__figures')||{}).textContent,
      def: (leg.querySelector('.legend__rule-inline, .legend__rule-line')||{}).textContent,
    };
  });

  /* --- the headline regression: 1/2/3/4 must never remove the colours ---- */
  const seq = ['boot','2','1','3','1','4','1','2','3','4'];
  const out = [];
  out.push(['boot', await key()]);
  for (const k of seq.slice(1)) { await page.keyboard.press(k); await page.waitForTimeout(500); out.push(['def '+k, await key()]); }
  for (const [t,v] of out) log('DEF ' + t + ' :: ' + JSON.stringify(v));

  /* --- staleness: modes then a scrub -------------------------------------- */
  await page.keyboard.press('1'); await page.waitForTimeout(400);
  await page.keyboard.press('w'); await page.waitForTimeout(600);
  await page.keyboard.press('s'); await page.waitForTimeout(500);
  await page.keyboard.press('h'); await page.waitForTimeout(800);
  const modeAt = async (y) => {
    await page.evaluate(yy => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(1300);
    return page.evaluate(() => {
      const by = document.getElementById('legend-byline');
      const leg = document.querySelector('.legend');
      const m = window.__map;
      let holes=0, tiny=0, counted=0, missing=0;
      for (const [uid,rec] of m.plate.paint) {
        if (rec.mode==='hole') holes++;
        if (m.plate.isTiny(uid) && !rec.lost) tiny++;
        if (rec.lost||rec.mode==='hole'||rec.mode==='informal') continue;
        if (rec.mode==='absence') missing++; else counted++;
      }
      return { year: window.BEA.store.getState().year,
        byline: by ? by.innerText.replace(/\s+/g,' ') : null,
        legFig: leg ? (leg.querySelector('.legend__figures')||{}).textContent : null,
        truth: { counted, missing, holes, tiny },
        legH: leg ? Math.round(leg.getBoundingClientRect().height) : null,
        clipped: leg ? [...leg.querySelectorAll('*')].filter(n=>{const b=n.getBoundingClientRect(); const r=leg.getBoundingClientRect();
          return b.height>0 && (b.bottom>r.bottom+1||b.top<r.top-1);}).length : null };
    });
  };
  for (const y of [1620, 1750, 1900, 1950, 2020]) log('MODES @' + y + ' :: ' + JSON.stringify(await modeAt(y), null, 1));
  await shot('modes-2020');

  /* --- fold ---------------------------------------------------------------- */
  await page.evaluate(() => { location.hash = '#year=1900'; });
  await page.waitForTimeout(900);
  await page.keyboard.press('h'); await page.keyboard.press('s'); await page.keyboard.press('w');
  await page.waitForTimeout(700);
  const fold = await page.$('.legend__toggle');
  if (fold) { await fold.click(); await page.waitForTimeout(500); }
  log('after fold: ' + JSON.stringify(await key()));
  await shot('folded');
  const back = await page.$('.legend__toggle--compact');
  if (back) { await back.click(); await page.waitForTimeout(500); }
  log('after unfold: ' + JSON.stringify(await key()));

  /* --- the plate, escape, and the scrub ------------------------------------ */
  await page.click('.legend__open'); await page.waitForTimeout(700);
  const plateOk = await page.evaluate(() => {
    const p = document.querySelector('#legend-plate');
    const c = p && p.querySelector('.lplate__close');
    const b = c && c.getBoundingClientRect();
    const n = b && document.elementFromPoint(b.x+b.width/2, b.y+b.height/2);
    return { open: !!p, closeHit: n ? n.tagName+'.'+n.className : null,
      details: p ? p.querySelectorAll('details').length : null,
      tenureVisible: !!(p && p.querySelector('.legend__ramp')),
      countingVisible: !!(p && [...p.querySelectorAll('h3')].some(h=>/HOW THESE TOTALS/i.test(h.textContent))) };
  });
  log('PLATE ' + JSON.stringify(plateOk));
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  log('plate closed: ' + await page.evaluate(() => !document.querySelector('#legend-plate')));

  for (let y = 1600; y <= 1990; y += 30) {
    await page.evaluate(yy => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(1200);
  await shot('after-scrub');
  log('ERRORS ' + JSON.stringify(errs));
  log('FAILED REQUESTS ' + JSON.stringify(reqs));
};
