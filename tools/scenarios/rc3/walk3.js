module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1200);
  const satisfy = async () => {
    // textareas
    const tas = page.locator('textarea');
    const n = await tas.count();
    for (let k=0;k<n;k++){ await tas.nth(k).fill('A student answer written for testing purposes.').catch(()=>{}); }
    if (n) await page.waitForTimeout(500);
    // any 3x3 gate cells / radios / commit buttons
    const sel = ['[role=radio]','.cg-cell','[class*="cell"] button','button[data-verdict]','[data-place]'];
    for (const s of sel) {
      const l = page.locator(s);
      const c = await l.count();
      if (c) { log('   satisfy via ' + s + ' n=' + c); for(let k=0;k<Math.min(c,1);k++) await l.nth(k).click({force:true}).catch(()=>{}); await page.waitForTimeout(600); break; }
    }
    // commit buttons
    for (const rx of [/^That is my guess/i,/^Commit/i,/^Weigh it up/i,/^I think that is false/i]) {
      const b = page.getByRole('button', { name: rx }).first();
      if (await b.count()) { await b.click({force:true}).catch(()=>{}); await page.waitForTimeout(500); }
    }
  };
  for (let i = 1; i <= 32; i++) {
    const st = await page.evaluate(() => { const e=document.querySelector('[class*="bar__count"],[class*="tr-bar"] '); return document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,120)||''; });
    const head = await page.evaluate(()=>{ const e=document.querySelector('.beat__line,[class*="headline"],[class*="__line"]'); return (e?.innerText||'').replace(/\s+/g,' ').slice(0,160); });
    log(`STEP ${i} | ${st}`);
    log(`   head: ${head}`);
    log(`   url: ${page.url().replace('http://localhost:8777/app/','')}`);
    let next = page.getByRole('button', { name: /^Next beat$/i }).first();
    if (!(await next.count())) {
      log('   GATE');
      const jump = page.getByRole('button', { name: /the field|place the fact|Go to the field/i }).first();
      if (await jump.count()) { await jump.click({force:true}).catch(()=>{}); await page.waitForTimeout(800); }
      await satisfy();
      next = page.getByRole('button', { name: /^Next beat$/i }).first();
      if (!(await next.count())) { await satisfy(); next = page.getByRole('button', { name: /^Next beat$/i }).first(); }
      if (!(await next.count())) { log('   STILL BLOCKED'); await shot('blk'+i); 
        const t = await page.evaluate(()=>document.body.innerText.slice(0,1800)); log(t); break; }
      log('   gate passed');
    }
    await shot('s'+String(i).padStart(2,'0'));
    await next.click({ timeout: 5000 }).catch(e => log('   click fail ' + e.message));
    await page.waitForTimeout(1100);
    if (await page.getByRole('button', { name: /^Next beat$/i }).count() === 0 && /step=1[5-9]|close/.test(page.url())) {}
  }
  await shot('final');
  log('FINAL>>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,4000));
};
