/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'hidden').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(''+e));
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1600'; });
  await page.waitForTimeout(500);
  await page.evaluate(() => { window.__ev=[]; const p=document.querySelector('.tl').__p03;
    p.bus.on('time:pause',(x)=>window.__ev.push(['pause',x.reason,p.store.getState().year]));
    p.bus.on('time:stop',(x)=>window.__ev.push(['stop',x.year,x.title]));
  });
  await page.click('.tl-btn--play');
  const seen = [];
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(250);
    const s = await page.evaluate(() => ({ y: document.querySelector('.tl__year').textContent, playing: document.querySelector('.tl-btn--play').dataset.playing, rest: document.querySelector('.tl__rest').hidden ? '' : document.querySelector('.tl__rest').textContent }));
    seen.push(s.y + (s.playing==='false'?'*':'') + (s.rest?' ['+s.rest.slice(0,40)+']':''));
    if (s.playing === 'false') break;
  }
  log('15s of playback from 1600:', seen.join(' → '));
  log('events:', await page.evaluate(() => JSON.stringify(window.__ev)));
  log('stopcard:', await page.evaluate(() => document.querySelector('.tl__stopcard').hidden ? 'none' : document.querySelector('.tl__stopcard').innerText.replace(/\n/g,' | ')));
  await shot('01-play-stop');
  log('errors:', JSON.stringify(errs));
};
