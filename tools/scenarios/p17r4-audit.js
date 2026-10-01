/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 4 — the acceptance tests, run against the running app. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const ev = (fn) => page.evaluate(fn);

  // T5 — the totals equal data.metricsAt for that definition
  log('T5 totals vs metricsAt:', JSON.stringify(await ev(() => {
    const d = window.BEA.data, t = window.BEA.legend.totalsAt(1900), m = d.metricsAt(1900);
    const byDeg = m.byDegree || {};
    const sum = (lo) => [1,2,3,4,5].filter(x=>x>=lo).reduce((n,x)=>n+(byDeg[x]||0),0);
    return { claimed: t.sets.claimed.units, administered: t.sets.administered.units,
      controlled: t.sets.controlled.units, influenced: t.sets.influenced.units,
      metricsControlled: m.controlledUnits, degreeOne: t.degreeOneUnits,
      admFromDeg: sum(3), ctrlFromDeg: byDeg[5] || 0,
      partials: { claimed: t.sets.claimed.partialUnits, administered: t.sets.administered.partialUnits,
        controlled: t.sets.controlled.partialUnits, influenced: t.sets.influenced.partialUnits } };
  })));

  // broken bands is definition-aware: read the printed figure under each rule
  const bands = [];
  for (const k of ['1','2','3','4']) {
    await page.keyboard.press(k);
    await page.waitForTimeout(450);
    bands.push(await ev(() => {
      const rows = [...document.querySelectorAll('.lplate__col--b .legend__row')];
      const r = rows.find(x => /Broken bands/.test(x.innerText));
      const rule = document.querySelector('.lplate__rule .legend__defword');
      return { rule: rule && rule.textContent, band: r ? r.innerText.replace(/\s+/g,' ').slice(0,120) : 'ABSENT' };
    }));
  }
  log('BANDS BEFORE PLATE:', JSON.stringify(bands));

  await ev(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(700);
  const bands2 = [];
  for (const k of ['1','2','3','4']) {
    await page.keyboard.press(k);
    await page.waitForTimeout(450);
    bands2.push(await ev(() => {
      const rows = [...document.querySelectorAll('.lplate__col--b .legend__row')];
      const r = rows.find(x => /Broken bands/.test(x.innerText));
      const rule = document.querySelector('.lplate__rule .legend__defword');
      const fig = document.querySelector('.lplate__rule .legend__figures');
      return { rule: rule && rule.textContent, fig: fig && fig.innerText.replace(/\s+/g,' '),
        band: r ? r.innerText.replace(/\s+/g,' ').slice(0,150) : 'ABSENT' };
    }));
  }
  log('BANDS IN PLATE:', JSON.stringify(bands2, null, 1));
  await page.keyboard.press('1');
  await page.waitForTimeout(400);
  await shot('plate-colour');

  // the roll of places: Yukon / South Georgia under crown colony
  await ev(() => {
    const b = [...document.querySelectorAll('.lplate__col--a .legend__entry')]
      .find(x => /Crown colony/.test(x.innerText));
    if (b) b.click();
  });
  await page.waitForTimeout(600);
  log('ROLL crown-colony:', await ev(() => {
    const roll = document.querySelector('.lplate__col--a .legend__roll');
    if (!roll) return 'NONE';
    const items = [...roll.querySelectorAll('.legend__roll-list > li')];
    const flagged = items.filter(i => i.classList.contains('is-mismatch')).map(i => i.innerText.replace(/\s+/g,' '));
    const cite = roll.querySelector('.legend__cite-h');
    return { n: items.length, flagged, warn: !!roll.querySelector('.legend__roll-warn'),
      cite: cite && cite.textContent.slice(0, 140),
      sample: items.slice(0,3).map(i => i.innerText.replace(/\s+/g,' ')) };
  }));
  await shot('roll-crown');

  // company rule: the evidence must be a place on the plate at 1900
  await ev(() => {
    const b = [...document.querySelectorAll('.lplate__col--a .legend__entry')]
      .find(x => /Company rule/.test(x.innerText));
    if (b) b.click();
  });
  await page.waitForTimeout(600);
  log('ROLL company-rule:', await ev(() => {
    const roll = document.querySelector('.lplate__col--a .legend__roll');
    if (!roll) return 'NONE';
    const cite = roll.querySelector('.legend__cite-h');
    const go = roll.querySelector('.legend__cite-go');
    return { places: [...roll.querySelectorAll('.legend__roll-name')].map(n=>n.textContent),
      cite: cite && cite.textContent, go: go && go.textContent,
      src: (roll.querySelector('.legend__cite') || {}).innerText };
  }));
  await shot('roll-company');
};
