module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  // start the lesson
  const start = page.locator('button:has-text("Start the lesson"), a:has-text("Start the lesson")').first();
  await start.click();
  await page.waitForTimeout(1500);
  await shot('step-01');
  for (let i = 1; i <= 24; i++) {
    const txt = await page.evaluate(() => document.body.innerText);
    log('\n\n############ STEP ' + i + ' ############\n' + txt.slice(0, 3200));
    // find next
    const next = page.locator('button:has-text("Next"), button:has-text("Continue"), button[data-act="next"]').first();
    if (await next.count() === 0) { log('NO NEXT at step ' + i); break; }
    try { await next.click({ timeout: 2500 }); } catch (e) { log('next blocked at ' + i + ': ' + e.message.slice(0,120)); 
      // try to satisfy a gate: click first choice
      const c = page.locator('[role="radio"], .gate button, button[data-choice]').first();
      if (await c.count()) { await c.click().catch(()=>{}); await page.waitForTimeout(400); await next.click({timeout:2000}).catch(()=>{}); }
    }
    await page.waitForTimeout(900);
    if (i % 4 === 0) await shot('step-' + String(i).padStart(2,'0'));
  }
  await shot('end');
};
