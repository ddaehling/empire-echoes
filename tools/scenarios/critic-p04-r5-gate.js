/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'dataset').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const sc = '.app__dossier';
  // Find belief gate
  const gate = await page.evaluate(() => {
    const box = document.querySelector('.dsr__ask');
    if (!box) return null;
    return { html: box.innerText.slice(0,600), state: box.dataset.state, kind: box.dataset.ask };
  });
  log('GATE', JSON.stringify(gate));
  const btn = await page.$('.dsr__ask button');
  const btns = await page.evaluate(() => [...document.querySelectorAll('.dsr__ask button')].map(b=>b.innerText.trim()));
  log('BTNS', JSON.stringify(btns));
  // click the WRONG answer deliberately
  const h = await page.evaluateHandle(() => [...document.querySelectorAll('.dsr__ask button')].find(b=>/I think that is true/i.test(b.innerText)));
  if (h.asElement()) { await h.asElement().scrollIntoViewIfNeeded(); await shot('gate-before'); await h.asElement().click(); }
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => {
    const box = document.querySelector('.dsr__ask');
    return { state: box.dataset.state, text: box.innerText.slice(0,1600) };
  });
  log('AFTER GATE', after.state, '\n' + after.text);
  await shot('gate-after');
  // now the toll gate
  const toll = await page.evaluate(() => {
    const b = document.querySelector('.dsr__ask--toll');
    if (!b) return null;
    b.scrollIntoView({block:'center'});
    return { state: b.dataset.state, text: b.innerText.slice(0,1200) };
  });
  log('TOLL GATE', JSON.stringify(toll));
  await page.waitForTimeout(600);
  await shot('toll-gate');
  const th = await page.evaluateHandle(() => [...document.querySelectorAll('.dsr__ask--toll button')][0]);
  if (th.asElement()) { await th.asElement().click(); await page.waitForTimeout(1200); }
  const tafter = await page.evaluate(() => {
    const b = document.querySelector('.dsr__ask--toll');
    b.scrollIntoView({block:'center'});
    return { state: b.dataset.state, text: b.innerText.slice(0,2000) };
  });
  await page.waitForTimeout(400);
  log('TOLL AFTER', tafter.state, '\n' + tafter.text);
  await shot('toll-after');
};
