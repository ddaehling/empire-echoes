/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'concat').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1400);

  // AT1 — spine survives the tours module being killed
  await page.evaluate(() => { const r = window.BEA.registry; try { r.destroy && r.destroy('tours'); } catch (_) {} });
  log('AT1 spine after killing tours:', await page.evaluate(() => document.querySelectorAll('.tl-lane').length));

  // AT6-ish: full scrub 1600 -> 1997 with no errors
  await page.evaluate(async () => {
    for (let y = 1600; y <= 1997; y++) { window.BEA.store.dispatch('setYear', y); if (y % 40 === 0) await new Promise(r => requestAnimationFrame(r)); }
  });
  await page.waitForTimeout(800);
  log('after full scrub, year =', await page.evaluate(() => window.BEA.store.getState().year));

  // reduced-motion behaviour
  log('play word (default):', await page.evaluate(() => document.querySelector('.tl-btn__word').textContent));

  // playback: does it stop itself and say why?
  await page.evaluate(() => { const p = document.querySelector('.tl').__p03; p.setYear(1856); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { const p = document.querySelector('.tl').__p03; p.store.dispatch('setSpeed', 16); p.play(); });
  await page.waitForTimeout(2500);
  log('playing?', await page.evaluate(() => window.BEA.store.getState().playing), 'year', await page.evaluate(() => window.BEA.store.getState().year));
  log('stopcard:', await page.evaluate(() => { const e = document.querySelector('.tl__stopcard'); return e && !e.hidden ? e.innerText.replace(/\n/g,' | ').slice(0,260) : 'hidden'; }));
  await shot('stop');
  await page.evaluate(() => document.querySelector('.tl').__p03.pause('user'));

  // event tick snapping
  const r = await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    const rect = p.scrub.rail.getBoundingClientRect();
    const x = rect.left + p.scrub.scale.x(1736);
    return { snapped: p.scrub.snapYear(x), raw: p.scrub.yearAt(x) };
  });
  log('event tick snap at 1736:', JSON.stringify(r));

  // 1736 reachable by Shift-jump?
  log('1736 on jump chain:', await page.evaluate(() => { const p = document.querySelector('.tl').__p03; return p.storyYears.includes(1736); }));
  log('event years off chain:', await page.evaluate(() => { const p = document.querySelector('.tl').__p03; return p.events.years.filter(y => !p.storyYears.includes(y)).length; }));
  log('big jump years / threshold:', await page.evaluate(() => { const p = document.querySelector('.tl').__p03; return p.bigYears.length + ' / ' + p.bigCut; }));
  log('big chain from 1908:', await page.evaluate(() => { const p = document.querySelector('.tl').__p03; const o=[]; let c=1908; for(let i=0;i<8;i++){const n=p.seek(p.bigYears,c,1); if(n==null)break; o.push(n); c=n;} return o.join(','); }));

  // no banned sentence anywhere, on all four definitions
  log('banned sentence scan:', await page.evaluate(async () => {
    const p = document.querySelector('.tl').__p03;
    const ids = ['claimed','administered','controlled','influenced'];
    let bad = 0, checked = 0;
    for (const id of ids) {
      p.useDefinition(id);
      for (const [, rec] of p.def.years) for (const g of rec.groups.concat(rec.records)) {
        checked++;
        const blob = [g.mechanism, g.gloss, g.how, g.threshold, g.thresholdWhy].filter(Boolean).join(' ');
        if (/redefined|Nothing was taken or given up/i.test(blob)) bad++;
      }
    }
    p.useDefinition('claimed');
    return `${bad} banned of ${checked} cards across 4 definitions`;
  }));
  // duplicate-place scan: the same territory twice in one year's row
  log('duplicate-place scan:', await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    const dups = [];
    for (const y of p.storyYears) {
      const { groups, records } = p.itemsFor(y);
      const seen = new Map();
      for (const g of groups.concat(records)) {
        const k = g.subject;
        if (seen.has(k)) dups.push(y + ':' + k);
        seen.set(k, 1);
      }
    }
    return dups.length + ' duplicated subjects; ' + dups.slice(0, 8).join(', ');
  }));
};
