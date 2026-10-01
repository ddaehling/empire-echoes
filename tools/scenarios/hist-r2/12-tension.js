module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=17', { waitUntil:'load' });
  await page.waitForTimeout(3000);
  await shot('tension-before');
  const t = await page.evaluate(()=> (document.querySelector('#sheet')||document.body).innerText.slice(0,400));
  log('AT STEP', t);
  // answer the five choices
  const opts = ['That the crowd was penned in and could not get out.','To defend the decision as deliberate deterrence.','That the Punjab was under martial law and he could not go there.','To make a refusal legible in Britain with the only instrument he held.','Neither on its own. Dyer explains the decision; Tagore explains the consequence.'];
  for (const o of opts) {
    const b = page.locator('#sheet button', { hasText: o.slice(0, 40) });
    if (await b.count()) { try { await b.first().click({force:true,timeout:2500}); await page.waitForTimeout(350); } catch(e){ log('miss', o); } }
    else log('NOT FOUND', o);
  }
  const show = page.locator('#sheet button').filter({ hasText: /Show me what they wrote/i });
  log('show btn', await show.count());
  if (await show.count()) { await show.first().click({force:true}); await page.waitForTimeout(1500); }
  await shot('tension-after');
  log('AFTER', (await page.evaluate(()=> (document.querySelector('#sheet')||document.body).innerText)).slice(0,4500));
};
