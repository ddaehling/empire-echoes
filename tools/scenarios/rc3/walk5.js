module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1300);
  const COMMIT = [/Now show me this atlas/i, /Show me what they wrote/i, /^That is my guess/i, /^Weigh it up$/i, /^Show me/i, /^Reveal/i, /^Place it$/i];
  const satisfy = async (tag) => {
    const jump = page.getByRole('button', { name: /the field|place the fact|Go to the field/i }).first();
    if (await jump.count()) { await jump.click({force:true}).catch(()=>{}); await page.waitForTimeout(600); }
    // textareas
    const tas = page.locator('textarea'); const n = await tas.count();
    for (let k=0;k<n;k++){ await tas.nth(k).scrollIntoViewIfNeeded().catch(()=>{}); await tas.nth(k).fill('A concession document of 1888, obtained for the company, which cannot record what was said aloud.').catch(()=>{}); }
    // radios / choice rows
    const radios = page.locator('[role=radio]');
    let rc = await radios.count();
    if (rc) { for (let k=0;k<rc;k++){ const r = radios.nth(k); const checked = await r.getAttribute('aria-checked'); if (checked === 'false') { await r.click({force:true}).catch(()=>{}); await page.waitForTimeout(120);} } }
    // generic choice buttons in the beat panel
    const opts = page.locator('button[class*="opt"], li[class*="opt"] button, [class*="choice"] button');
    const oc = await opts.count();
    if (oc) { for (let k=0;k<oc;k++){ await opts.nth(k).click({force:true}).catch(()=>{}); await page.waitForTimeout(80); } }
    for (const rx of COMMIT) { const b = page.getByRole('button', { name: rx }).first(); if (await b.count() && await b.isEnabled().catch(()=>false)) { await b.click({force:true}).catch(()=>{}); await page.waitForTimeout(800); } }
  };
  let last = '';
  for (let i = 1; i <= 40; i++) {
    const bar = await page.evaluate(() => document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,110)||'');
    log(`STEP ${i} | ${bar} | ${page.url().replace(/.*#/,'')}`);
    let next = page.getByRole('button', { name: /^Next beat$/i }).first();
    let tries = 0;
    while (!(await next.count()) && tries < 5) { await satisfy(i); next = page.getByRole('button', { name: /^Next beat$/i }).first(); tries++; }
    if (!(await next.count())) { log('   BLOCKED after '+tries); await shot('blk'+i); break; }
    await shot('s'+String(i).padStart(2,'0'));
    await next.click({timeout:5000}).catch(e=>log('   clickfail '+e.message));
    await page.waitForTimeout(1100);
    if (page.url() === last) { log('  NO ADVANCE'); break; }
    last = page.url();
  }
  await shot('final');
  log('FINAL>>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,6000));
};
