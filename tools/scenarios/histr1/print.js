module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Teaching desk")').first().click();
  await page.waitForTimeout(1200);
  await page.locator('button:has-text("Classroom"), [role=tab]:has-text("Classroom")').first().click({force:true});
  await page.waitForTimeout(1200);
  // click through pack sections
  for (const s of ['The classroom pack','Everything to print']) {
    const el = page.locator('button:has-text("' + s + '"), a:has-text("' + s + '")').first();
    if (await el.count()===0) { log('missing ' + s); continue; }
    await el.click({force:true}); await page.waitForTimeout(1500);
    const t = await page.evaluate(()=>document.body.innerText);
    log('=== ' + s + ' ===\n' + t.slice(0, 12000));
    await shot('pack-' + s.replace(/\s+/g,'-'));
  }
  // now emulate print media and dump all minute figures
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(800);
  const mins = await page.evaluate(() => {
    const txt = document.body.innerText;
    const out = [];
    const re = /[^.\n]{0,110}\b(\d{1,3})\s*(?:–|-|to)?\s*(\d{1,3})?\s*(minutes|minute|min)\b[^.\n]{0,60}/gi;
    let m; while ((m = re.exec(txt))) out.push(m[0].trim());
    const re2 = /[^.\n]{0,110}\b(thirty|forty|fifty|twenty|sixty|forty-five|thirty-five)[- ]minute[^.\n]{0,60}/gi;
    while ((m = re2.exec(txt))) out.push('WORDS: ' + m[0].trim());
    return out;
  });
  log('=== MINUTE STRINGS IN PRINT MEDIA (' + mins.length + ') ===\n' + mins.join('\n'));
};
