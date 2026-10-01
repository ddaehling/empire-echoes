/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.getAttribute: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const m = async (tag) => log(tag + ' :: ' + await page.evaluate(()=>{
    const g=s=>{const e=document.querySelector(s); if(!e)return 'none'; const r=e.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}@y${Math.round(r.y)}`;};
    const p=document.querySelector('[aria-label*="scrollable"]');
    return `map=${g('.stage__map')} panel=${p?Math.round(p.getBoundingClientRect().height)+'h/'+p.scrollHeight:'none'} tl=${g('.tl')}`;
  }));
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1500);
  for (let i=0;i<2;i++){ await page.getByRole('button',{name:/^Next/i}).first().click(); await page.waitForTimeout(1300);} 
  await m('beat3 default');
  const mapBtn = page.getByRole('button', { name: /^Map —/i }).first();
  log('map btn label: ' + await mapBtn.getAttribute('aria-label'));
  await mapBtn.click(); await page.waitForTimeout(700);
  await m('after map press 1'); await shot('shrunk1');
  log('map btn label now: ' + await page.getByRole('button',{name:/^Map —/i}).first().getAttribute('aria-label'));
  await page.getByRole('button',{name:/^Map —/i}).first().click(); await page.waitForTimeout(700);
  await m('after map press 2'); await shot('shrunk2');
  log('map btn label now: ' + await page.getByRole('button',{name:/^Map —/i}).first().getAttribute('aria-label'));
  await page.getByRole('button',{name:/^Map —/i}).first().click(); await page.waitForTimeout(700);
  await m('after map press 3'); await shot('shrunk3');
};
