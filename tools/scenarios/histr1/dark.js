module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#theme=lamplit&year=1857&sel=bengal-presidency', { waitUntil:'load' });
  await page.waitForTimeout(3000);
  await shot('dark');
  log('scheme: ' + await page.evaluate(()=>getComputedStyle(document.body).backgroundColor + ' | ' + document.documentElement.getAttribute('data-theme')));
};
