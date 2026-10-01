/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(2600);
  const probe = async (tag) => {
    const r = await page.evaluate(() => {
      const L = document.querySelector('[data-mount="legend"]') || document.querySelector('.legend');
      const leg = document.querySelector('.legend');
      const body = document.querySelector('#legend-body');
      const by = document.querySelector('#legend-byline');
      const stage = document.querySelector('.app__stage');
      const rect = e => e ? (({x,y,width,height}) => ({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(e.getBoundingClientRect()) : null;
      return {
        legend: rect(leg),
        body: rect(body),
        bodyScroll: body ? { sh: body.scrollHeight, ch: body.clientHeight } : null,
        byline: rect(by),
        stage: rect(stage),
        mode: leg ? leg.className : null,
        hasColours: !!document.querySelector('.legend__fams, .legend__families'),
        hasMarks: !!document.querySelector('.legend__chips'),
        text: leg ? leg.innerText.replace(/\s+/g,' ').slice(0,400) : null,
        bylineText: by ? by.innerText.replace(/\s+/g,' ').slice(0,500) : null,
      };
    });
    log(tag + ' :: ' + JSON.stringify(r, null, 1));
    return r;
  };
  await probe('boot');
  await shot('boot');
  await page.keyboard.press('2'); await page.waitForTimeout(700);
  await probe('after-2');
  await shot('after-2');
  await page.keyboard.press('1'); await page.waitForTimeout(700);
  await probe('after-1');
  await shot('after-1');
  log('ERRORS ' + JSON.stringify(errs));
};
