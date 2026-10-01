/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1800);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1400);
  const seen = [];
  for (let i = 1; i <= 30; i++) {
    await page.waitForTimeout(600);
    // try to satisfy any interaction that blocks Next
    const sheet = page.locator('.cx-sheet__body').first();
    for (let pass = 0; pass < 3; pass++) {
      const nxt = page.locator('.tr-bar__next').first();
      if (!(await nxt.count())) break;
      if (!(await nxt.isDisabled().catch(()=>false))) break;
      // gate field
      const f = page.locator('.tr-field__cell');
      if (await f.count()) { await f.nth(4).click({force:true}).catch(()=>{}); await page.waitForTimeout(400); continue; }
      const g = page.locator('.tr-guess__go, .tr-guess__skip, [class*=decline]');
      if (await g.count()) { await g.first().click({force:true}).catch(()=>{}); await page.waitForTimeout(400); continue; }
      break;
    }
    const info = await page.evaluate(() => {
      const q = s => document.querySelector(s);
      const sh = q('.cx-sheet__body');
      return {
        step: (q('.tr-bar__count')||{}).innerText?.replace(/\s+/g,'') || '?',
        title: (q('.cx-sheet__title')||{}).innerText?.trim() || '',
        eyebrow: (q('.cx-sheet__eyebrow')||{}).innerText?.trim() || '',
        lede: (q('.cx-lede__say')||{}).innerText?.trim().slice(0,150) || '',
        ledeYear: (q('.cx-lede__mark')||{}).innerText?.trim() || '',
        tl: (q('.tl__now')||{}).innerText?.replace(/\n/g,' ').trim().slice(0,70) || '',
        mapH: q('.stage__map') ? Math.round(q('.stage__map').getBoundingClientRect().height) : 0,
        sc: sh ? sh.clientHeight + '/' + sh.scrollHeight : '',
        cloze: (q('.cl-blk')||{}).innerText?.split('\n')[1] || '',
        body: sh ? sh.innerText.replace(/\n+/g,' | ').slice(0, 700) : '',
      };
    });
    log(`\n=== STEP ${info.step} [${info.eyebrow}] "${info.title}" | map ${info.mapH} | sheet ${info.sc} | ledeYear "${info.ledeYear}" | tl "${info.tl}"`);
    log(`  lede: ${info.lede}`);
    log(`  body: ${info.body}`);
    await shot('f' + String(i).padStart(2,'0'));
    seen.push(info.step);
    const nxt = page.locator('.tr-bar__next').first();
    if (!(await nxt.count())) { log('*** NO NEXT — end at ' + info.step); break; }
    if (await nxt.isDisabled().catch(()=>false)) { log('*** STILL BLOCKED at ' + info.step); break; }
    await nxt.click();
  }
  log('\nsteps seen: ' + seen.join(' '));
};
