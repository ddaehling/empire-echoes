/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  const before = await page.evaluate(() => document.getElementById('dossier').innerText.length);
  const btn = page.locator('#dossier button.dsr__choice').first();
  log('first choice text:', await btn.innerText());
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(1000);
  const r = await page.evaluate(() => {
    const d = document.getElementById('dossier'); const t = d.innerText;
    const i = t.toUpperCase().indexOf('THINK');
    const pressed = [...d.querySelectorAll('[aria-pressed="true"]')].map(e=>e.textContent.trim());
    return { len: t.length, pressed, seg: i<0? 'NO THINK SECTION' : t.slice(i-200, i+1600).replace(/\n{2,}/g,'\n') };
  });
  log('len before/after:', before, r.len);
  log('pressed:', JSON.stringify(r.pressed));
  log('SEGMENT:\n' + r.seg);
  await shot('think', '#dossier');
  const ls = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).map(([k,v])=>[k, String(v).slice(0,400)]))));
  log('LOCALSTORAGE:', ls);
  const busSpy = await page.evaluate(() => Object.keys(window).filter(k=>/APP|BUS|STORE|LEDGER|atlas/i.test(k)));
  log('globals:', JSON.stringify(busSpy));
};
