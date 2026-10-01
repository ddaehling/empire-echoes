module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1919&sel=punjab-province', { waitUntil:'load' });
  await page.waitForTimeout(3000);
  await shot('dossier');
  const t = await page.evaluate(()=> (document.querySelector('#sheet')||document.body).innerText);
  log('DOSSIER len', t.length);
  log(t.slice(0, 3500));
};
