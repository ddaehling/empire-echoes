/** Where does the "Taken → left" control live at narrow widths? */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(400);

  const probe = () => page.evaluate(() => {
    const e = document.querySelector('.mx-entry');
    if (!e) return { missing: true };
    const b = e.getBoundingClientRect();
    const chain = [];
    let n = e.parentElement;
    while (n && n !== document.body && chain.length < 6) {
      const cs = getComputedStyle(n);
      chain.push({
        cls: (n.className || n.tagName).toString().slice(0, 44),
        disp: cs.display, vis: cs.visibility, hidden: n.hidden,
        w: Math.round(n.getBoundingClientRect().width),
        ov: cs.overflowX,
      });
      n = n.parentElement;
    }
    return {
      hidden: e.hidden, disp: getComputedStyle(e).display,
      rect: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
      stage: document.getElementById('app').dataset.stage,
      chain,
      tools: [...document.querySelectorAll('button')].map((x) => x.textContent.trim().slice(0, 24)).filter(Boolean).slice(0, 24),
    };
  });
  log('closed ' + JSON.stringify(await probe()));
  await page.evaluate(() => window.BEA.mechanism.open({}));
  await page.waitForTimeout(600);
  log('open   ' + JSON.stringify(await probe()));
};
