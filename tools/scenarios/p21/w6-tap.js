/** p21/w6-tap.js — the size of every control the Close and the through-line put on a phone. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  const inBeat = await page.evaluate(() => [...document.querySelectorAll('.cl-blk button, .cl-bar button')]
    .map((b) => ({ c: (b.className || '').toString().slice(0, 34), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) })));
  await page.keyboard.press('Escape'); await page.waitForTimeout(140);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1100);
  const inClose = await page.evaluate(() => [...document.querySelectorAll('.cl-close button, .cl-close input, .cl-close textarea')]
    .map((b) => ({ c: (b.className || '').toString().slice(0, 34), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) })));
  /* A control in a strip this viewport does not draw (`.cl-bar` at
     `data-foot="off"`) has no size and is not a target; it is not on screen. */
  const all = inBeat.concat(inClose).filter((b) => b.w > 0 && b.h > 0);
  const small = all.filter((b) => b.h < 24 || b.w < 24);
  all.forEach((b) => log((b.h >= 44 ? 'AAA ' : (b.h >= 24 ? 'AA  ' : 'FAIL')) + ' ' + b.w + 'x' + b.h + '  ' + b.c));
  log(small.length ? '>>> ' + small.length + ' CONTROLS UNDER 24px' : '>>> every control clears WCAG 2.5.8 (24px)');
};
