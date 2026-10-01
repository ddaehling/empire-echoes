/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type()==='error'||m.type()==='warning') errs.push(m.type()+': '+m.text().slice(0,300)); });
  page.on('pageerror', e => errs.push('pageerror: '+e.message.slice(0,300)));
  await page.waitForTimeout(3000);
  await shot('01-landing');
  log('title:', await page.title());
  const t = await page.evaluate(() => {
    const el = document.querySelector('.timeline, #timeline, [data-module="timeline"], .timeline-root');
    return el ? {sel: el.className||el.id, text: el.innerText.slice(0,3000), h: el.getBoundingClientRect().height} : null;
  });
  log('timeline node:', JSON.stringify(t));
  log('console:', errs.join('\n'));
};
