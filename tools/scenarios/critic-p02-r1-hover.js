/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=botswana', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  await shot('selected-botswana');
  const s = await page.evaluate(()=>({hash:location.hash, sel:[...document.querySelectorAll('[aria-selected=true]')].map(e=>e.dataset.unit), tip: document.querySelector('.map__tip,.map__hover,.map__label')?.innerText}));
  log('sel state', JSON.stringify(s));
  // hover over India
  const p = await page.evaluate(()=>{const e=document.getElementById('map-u-bengal-presidency')||document.querySelector('.map__target'); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,id:e.dataset.unit};});
  await page.mouse.move(p.x,p.y); await page.waitForTimeout(700);
  await shot('hover');
  log('hover on', p.id, await page.evaluate(()=>document.querySelector('.map__tip,.map__hover,.map__label,[class*=tip]')?.innerText||'no tip element'));
  // silence count honesty
  await page.evaluate(async ()=>{ const b=await import('/app/js/core/bus.js'); const bus=b.default&&b.default.emit?b.default:b; bus.emit('ask:paintSilence',{unitIds:['kenya','zzz-not-a-unit','also-fake'],reason:'r',agent:'a'}); });
  await page.waitForTimeout(900);
  log('silence readout', await page.evaluate(()=>{const t=[...document.querySelectorAll('.map__caveat,.map__readout,.map *')].map(e=>e.innerText).filter(t=>t&&/silence/i.test(t)); return t[t.length-1]||'none';}));
  await shot('silence-fake');
};
