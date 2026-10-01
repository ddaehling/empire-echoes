module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1500);
  const grab = async () => page.evaluate(() => (document.querySelector('#sheet')||document.body).innerText.replace(/\n{2,}/g,'\n').slice(0,3400));
  const clickIf = async (sel) => { const l = page.locator(sel); if (await l.count()) { try { await l.first().click({force:true, timeout:2500}); await page.waitForTimeout(500); return true; } catch(e){} } return false; };
  const answer = async () => {
    // gate: pick a stance + confidence
    for (const t of ['complicates it','fairly sure']) {
      const b = page.locator('#sheet button', { hasText: new RegExp('^'+t+'$','i') });
      if (await b.count()) { try { await b.first().click({force:true,timeout:2000}); await page.waitForTimeout(300); } catch(e){} }
    }
    // any commit/submit style button
    for (const re of [/Commit/i,/That is my guess/i,/Lock it in/i,/^Reveal/i,/Show me/i,/I would rather not/i,/Skip/i]) {
      const b = page.locator('#sheet button').filter({ hasText: re });
      if (await b.count()) { try { await b.first().click({force:true,timeout:2000}); await page.waitForTimeout(600); } catch(e){} }
    }
  };
  let last = '';
  for (let i = 1; i <= 40; i++) {
    let txt = await grab();
    if (txt === last) { await answer(); txt = await grab(); }
    log('\n===== STOP ' + i + ' =====\n' + txt);
    await shot('s' + String(i).padStart(2,'0'));
    const n = page.locator('button.tr-bar__next');
    if (!await n.count()) { log('END no-next'); break; }
    const disabled = await n.first().isDisabled().catch(()=>false);
    if (disabled) await answer();
    last = txt;
    try { await n.first().click({force:true, timeout:4000}); } catch(e) { await answer(); try { await n.first().click({force:true, timeout:4000}); } catch(e2){ log('STUCK at', i); break; } }
    await page.waitForTimeout(1100);
  }
};
