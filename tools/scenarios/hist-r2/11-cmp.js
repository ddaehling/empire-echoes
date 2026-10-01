module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900&sel=egypt', { waitUntil:'load' });
  await page.waitForTimeout(2600);
  let c = page.getByRole('button', { name: /Compare/i });
  log('compare count', await c.count());
  if (!await c.count()) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(800); c = page.getByRole('button', { name: /Compare/i }); log('after nudge', await c.count()); }
  if (await c.count()) {
    await c.first().click({force:true}); await page.waitForTimeout(2000); await shot('cmp');
    log('STATE', JSON.stringify(await page.evaluate(()=>({hash:location.hash, t:document.body.innerText.replace(/\s+/g,' ').slice(0,1500)}))));
  }
};
