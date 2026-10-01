module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1831&sel=jamaica&tour=core&step=4&filter=stage:working,pressure:off&view=8.396,-0.2148,-0.0308');
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Go to the field and place the fact/i }).first().click().catch(e=>log('no jump'));
  await page.waitForTimeout(900);
  await shot('gate');
  const html = await page.evaluate(() => {
    const g = document.querySelector('[class*="gate"], [data-gate]');
    return g ? g.outerHTML.slice(0, 6000) : 'NO GATE EL';
  });
  log(html);
};
