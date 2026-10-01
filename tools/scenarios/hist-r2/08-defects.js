module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  // 9: legend accessible names
  const legend = await page.evaluate(() => [...document.querySelectorAll('[class*="legend"] *')].filter(e=>e.getAttribute&&(e.getAttribute('aria-label')||e.getAttribute('title'))).map(e=>(e.getAttribute('aria-label')||e.getAttribute('title'))).slice(0,30));
  log('LEGEND-NAMES', JSON.stringify(legend, null, 1));
  const anyDeg = await page.evaluate(() => document.body.innerHTML.match(/[A-Za-z]deg ?\d/g));
  log('DEG-LEAK', JSON.stringify(anyDeg));
  // masthead control counts at steps 1,5,8,9,14,23
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1500);
  const counts = [];
  for (let i = 1; i <= 24; i++) {
    const c = await page.evaluate(() => [...document.querySelectorAll('.bar button, .bar a, [class*="__bar"] button, header button')].filter(b=>b.offsetParent).length);
    counts.push(i + ':' + c);
    const n = page.locator('button.tr-bar__next');
    if (!await n.count()) break;
    try { await n.first().click({force:true,timeout:2500}); } catch(e) {
      // satisfy gate
      for (const t of ['complicates it','fairly sure']) { const b=page.locator('#sheet button',{hasText:new RegExp('^'+t+'$','i')}); if(await b.count()) try{await b.first().click({force:true,timeout:1500});}catch(e){} }
      for (const re of [/Commit/i,/That is my guess/i,/I would rather not/i,/Skip/i]) { const b=page.locator('#sheet button').filter({hasText:re}); if(await b.count()) try{await b.first().click({force:true,timeout:1500});}catch(e){} }
      try { await n.first().click({force:true,timeout:2500}); } catch(e2) { break; }
    }
    await page.waitForTimeout(700);
  }
  log('MASTHEAD-COUNTS', counts.join(' '));
};
