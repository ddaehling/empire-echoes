/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  // tab through from top
  const seq = [];
  for (let i=0;i<25;i++){
    await page.keyboard.press('Tab');
    const a = await page.evaluate(() => { const e=document.activeElement; return (e.tagName||'')+'.'+(e.className||'').toString().slice(0,40)+' | '+((e.getAttribute('aria-label')||e.innerText||'').slice(0,70)); });
    seq.push(i+': '+a);
  }
  log(seq.join('\n'));
  // focus map listbox and arrow around
  await page.evaluate(() => { const e = document.querySelector('.map__target[tabindex="0"]'); e && e.focus(); });
  await page.waitForTimeout(400);
  log('focused: ' + await page.evaluate(() => document.activeElement.getAttribute('aria-label')));
  for (const k of ['ArrowRight','ArrowRight','ArrowDown']) { await page.keyboard.press(k); await page.waitForTimeout(350); log(k + ' -> ' + await page.evaluate(() => document.activeElement.getAttribute('aria-label'))); }
  await shot('kbd-focus');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  await shot('kbd-selected');
  log('selected state: ' + await page.evaluate(() => { const s=document.querySelector('.map__target[aria-selected="true"]'); return s && s.dataset.unit; }));
  log('hash: ' + await page.evaluate(() => location.hash));
  log('BODY:\n' + (await page.evaluate(() => document.body.innerText)).slice(0,1200));
};
