module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const c = page.getByRole('button', { name: /Compare/i });
  log('compare on plate', await c.count());
  if (await c.count()) { await c.first().click({force:true}); await page.waitForTimeout(2000); await shot('compare'); }
  log('AFTER', JSON.stringify(await page.evaluate(() => ({ hash: location.hash, text: document.body.innerText.replace(/\s+/g,' ').slice(0,1800) })), null, 1));
  // open a dossier while compare is on
  const terr = page.locator('[class*="map"] path, svg path').first();
  await page.keyboard.press('Tab');
  await shot('compare2');
};
