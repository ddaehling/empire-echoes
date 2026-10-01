/* RETIRED, WAVE 9 — NOT PART OF THE ACCEPTANCE SUITE (`tools/acceptance.js`).
 * P03 round 5. Superseded by `p03-accept.js` and `p03r6-accept.js`. Its first read is of an element that is no longer rendered.
 * The guarantee it protected is now protected by `tools/scenarios/p03-accept.js`.
 * Kept, unedited below, as the record of what that round measured. Running it
 * will fail against the current DOM; that is expected and is not a build break. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push('PAGEERROR '+e)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  const failed=[]; page.on('requestfailed',r=>failed.push(r.url()));
  await page.waitForTimeout(3200);

  // TEST 1 — the spine band is visible in every state
  const spineOK = async (tag) => log('T1 spine ' + tag, await page.evaluate(() => {
    const s = document.querySelector('.tl-spine');
    if (!s) return 'MISSING';
    const r = s.getBoundingClientRect();
    const lanes = [...document.querySelectorAll('.tl-lane')].length;
    return `h=${Math.round(r.height)} lanes=${lanes} inViewport=${r.top < window.innerHeight && r.bottom > 0}`;
  }));
  await spineOK('landing:');
  await page.evaluate(() => { location.hash = '#panel=close'; });
  await page.waitForTimeout(500); await spineOK('#panel=close:');
  await page.evaluate(() => { location.hash = '#year=1913&compare=1914'; });
  await page.waitForTimeout(500); await spineOK('compare:');
  log('T1 compare ghost with compare=1914:', await page.evaluate(() => { const g=document.querySelector('.tl-ax__ghost'); return g.hidden ? 'hidden' : 'shown at ' + g.style.transform; }));
  await page.evaluate(() => { location.hash = '#panel=close'; });
  await page.waitForTimeout(600);
  log('T1 compare ghost after hash drops compare:', await page.evaluate(() => { const g=document.querySelector('.tl-ax__ghost'); return g.hidden ? 'hidden (correct)' : 'STILL SHOWN at ' + g.style.transform; }));

  // TEST 2 — 1820 lights three
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(600);
  log('T2 lanes at 1820:', await page.evaluate(() => [...document.querySelectorAll('.tl-lane')].map(b=>b.dataset.phase+'='+b.dataset.on).join(' ')));
  log('T2 caption:', await page.evaluate(() => document.querySelector('.tl-spine__caption').innerText.replace(/\n/g,' ')));
  await shot('01-1820');

  // TEST 3 — Shift+ArrowRight from 1856
  await page.evaluate(() => { location.hash = '#year=1856'; });
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('.tl-ax__rail').focus());
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(400);
  log('T3 shift+right from 1856 lands:', await page.evaluate(() => document.querySelector('.tl__year').textContent),
      ' data.nextChangeYear(1856,1) =', await page.evaluate(() => { const p=document.querySelector('.tl').__p03; return p.data.nextChangeYear ? p.data.nextChangeYear(1856,1) : 'n/a'; }),
      ' storyYears next =', await page.evaluate(() => document.querySelector('.tl').__p03.nextChange(1856,1)));
  // Alt+arrow second gear
  await page.keyboard.press('Alt+ArrowRight');
  await page.waitForTimeout(400);
  log('T3b alt+right lands:', await page.evaluate(() => document.querySelector('.tl__year').textContent));

  // TEST 4 — a circa / contested year carries a marker and a reason on focus
  await page.evaluate(() => { const p=document.querySelector('.tl').__p03; const y=p.uncertain[0].year; location.hash='#year='+y; });
  await page.waitForTimeout(500);
  log('T4 warn chip:', await page.evaluate(() => { const w=document.querySelector('.tl__warn'); return w.hidden ? 'HIDDEN' : w.textContent + ' | aria=' + w.getAttribute('aria-label').slice(0,120); }));
  log('T4 marks on axis:', await page.evaluate(() => document.querySelectorAll('.tl-mark:not([hidden])').length));
  await page.evaluate(() => document.querySelector('.tl-mark:not([hidden])').focus());
  await page.waitForTimeout(400);
  log('T4 popover after focusing a mark:', await page.evaluate(() => document.querySelector('.tl__pop').hidden ? 'NONE' : document.querySelector('.tl__pop').innerText.slice(0,180).replace(/\n/g,' | ')));

  // definition switch
  await page.keyboard.press('Escape');
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(500);
  const before = await page.evaluate(() => ({ count: document.querySelector('.tl__count').textContent, cap: document.querySelector('.tl-rate__caption').textContent.slice(0,90) }));
  await page.keyboard.press('3');
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => ({ count: document.querySelector('.tl__count').textContent, cap: document.querySelector('.tl-rate__caption').textContent.slice(0,90), sw: document.querySelector('.tl__defswitch').hidden ? 'hidden' : document.querySelector('.tl__defswitch').innerText.slice(0,140).replace(/\n/g,' | ') }));
  log('DEF before:', JSON.stringify(before));
  log('DEF after :', JSON.stringify(after));
  await shot('02-def3');
  log('errors:', JSON.stringify(errs), 'failedRequests:', JSON.stringify(failed));
};
