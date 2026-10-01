module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1200);
  const COMMIT = [/Now show me this atlas/i, /^That is my guess/i, /^Weigh it up$/i, /^I think that is false/i, /^Show me/i, /^Reveal/i];
  const satisfy = async () => {
    const jump = page.getByRole('button', { name: /the field|place the fact|Go to the field/i }).first();
    if (await jump.count()) { await jump.click({force:true}).catch(()=>{}); await page.waitForTimeout(700); }
    const tas = page.locator('textarea'); const n = await tas.count();
    for (let k=0;k<n;k++){ await tas.nth(k).scrollIntoViewIfNeeded().catch(()=>{}); await tas.nth(k).fill('A treaty concession; obtained 1888; to secure mining rights; it cannot say what was said aloud.').catch(()=>{}); }
    const radios = page.locator('[role=radio]');
    if (await radios.count()) { await radios.nth(0).click({force:true}).catch(()=>{}); await page.waitForTimeout(500); }
    for (const rx of COMMIT) { const b = page.getByRole('button', { name: rx }).first(); if (await b.count()) { await b.click({force:true}).catch(()=>{}); await page.waitForTimeout(700); } }
  };
  for (let i = 1; i <= 34; i++) {
    const bar = await page.evaluate(() => document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,110)||'');
    const head = await page.evaluate(() => { const e=document.querySelector('.cx-head, .beat-head, [class*="__line"]'); return (e?.innerText||'').replace(/\s+/g,' ').slice(0,150); });
    log(`STEP ${i} | ${bar}`);
    log(`   ${page.url().replace(/.*app\//,'')}`);
    let next = page.getByRole('button', { name: /^Next beat$/i }).first();
    let tries = 0;
    while (!(await next.count()) && tries < 3) { log('   gate try ' + tries); await satisfy(); next = page.getByRole('button', { name: /^Next beat$/i }).first(); tries++; }
    if (!(await next.count())) { log('   BLOCKED'); await shot('blk'+i); log((await page.evaluate(()=>document.body.innerText)).slice(0,1200)); break; }
    await shot('s'+String(i).padStart(2,'0'));
    await next.click({timeout:5000}).catch(e=>log('   clickfail '+e.message));
    await page.waitForTimeout(1100);
    if (page.url().includes('step=') === false) { log('   left tour'); }
  }
  await shot('final');
  log('FINAL>>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,5000));
};
