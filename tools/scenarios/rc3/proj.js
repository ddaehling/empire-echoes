module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1921');
  await page.waitForTimeout(2500);
  await shot('mercator');
  for (const k of ['p','s','w','h']) {
    await page.keyboard.press(k);
    await page.waitForTimeout(1400);
    await shot('key-'+k);
    const s = await page.evaluate(()=>{const t=document.body.innerText; return t.slice(0,260).replace(/\s+/g,' ');});
    log('key ' + k + ' -> ' + s.slice(0,180));
    await page.keyboard.press(k); await page.waitForTimeout(900);
  }
};
