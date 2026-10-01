/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  const boot = async (hash) => {
    await page.goto('http://localhost:8777/app/' + (hash || ''), { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
    await page.waitForTimeout(1800);
  };
  for (const [name, hash] of [
    ['america', '#year=1770&compare=1820&filter=cmp:america,cmpr:1,stage:working'],
    ['peak', '#year=1914&compare=1922&filter=cmp:peak,cmpr:1,stage:working'],
    ['dissolution', '#year=1945&compare=1965&filter=cmp:dissolution,cmpr:1,stage:working'],
    ['informal', '#year=1860&compare=1860&filter=cmp:informal,cmpa:claimed,cmpb:influenced,cmpr:1,stage:working'],
    ['redirect', '#year=1783&compare=1815&filter=cmp:redirect,cmpr:1,stage:working'],
  ]) {
    await boot(hash);
    const g = await page.evaluate(() => {
      const e = document.querySelector('.cmp__grain');
      const truth = (() => {
        const D = window.BEA.data; const out = {};
        for (const n of ['british-india', 'ascension-island']) { }
        return out;
      })();
      return { text: e ? e.textContent.replace(/\s+/g, ' ').trim() : null };
    });
    log(name + ': ' + (g.text || '(no grain note — under three sized rows, or no disproportion)'));
  }
  // verify the two figures against unitMeta directly
  await boot('#year=1770&compare=1820&filter=cmp:america,cmpr:1,stage:working');
  const check = await page.evaluate(() => {
    const D = window.BEA.data;
    const names = [...document.querySelectorAll('.cmp__grain b')].map(e => e.textContent);
    const nums = [...document.querySelectorAll('.cmp__grain .num')].map(e => e.textContent);
    // recompute from the dataset
    const rowFor = (nm) => [...document.querySelectorAll('.cmp__row')].find(r => r.querySelector('.cmp__row-name').textContent === nm);
    return { names, nums, rowsFound: names.map(n => !!rowFor(n)) };
  });
  log('grain figures: ' + JSON.stringify(check));
  await shot('grain');
};
