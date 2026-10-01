module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1955&sel=kenya', { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.click('.hgx-card__go');
  await page.waitForTimeout(1000);
  for (let i = 1; i <= 12; i++) {
    const t = await page.evaluate(() => (document.querySelector('.cx-sheet__body')||document.body).innerText);
    log('---------- CHAPTER ' + i + ' ----------');
    log(t.slice(0, 2400));
    const nx = page.locator('button', { hasText: 'Next' }).last();
    if (!(await nx.count())) { log('no next at ' + i); break; }
    const dis = await nx.isDisabled().catch(()=>false);
    if (dis) { log('next disabled at chapter ' + i); break; }
    await nx.click().catch((e)=>log('click fail '+e.message));
    await page.waitForTimeout(700);
  }
  await shot('hgx-last');
};
