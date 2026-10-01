module.exports = async ({ page, shot, log }) => {
  const links = ['#tour=core&step=7','#tour=thirty&step=18','#tour=eight&step=3','#tour=sixty&step=20',
                 '#year=1857&sel=bengal-presidency&layer=trade','#year=1914&compare=1783','#panel=workshop','#quiz=recall'];
  for (const l of links) {
    await page.goto('http://localhost:8777/app/' + l, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
    await page.waitForTimeout(2200);
    const st = await page.evaluate(() => {
      const a = document.getElementById('app');
      return { hash: location.hash, tour: a.getAttribute('data-tour'), step: a.getAttribute('data-step'),
        year: a.getAttribute('data-year'), sel: a.getAttribute('data-selected'), layer: a.getAttribute('data-layer'),
        cmp: a.getAttribute('data-compare'), ovl: a.getAttribute('data-overlay'), dev: a.hasAttribute('data-dev'),
        report: window.BEA.registry.report ? (()=>{const r=window.BEA.registry.report(); return {failed:r.failed, absent:r.absent, disabled:r.disabled};})() : null };
    });
    log(l + '  ->  ' + JSON.stringify(st));
  }
};
