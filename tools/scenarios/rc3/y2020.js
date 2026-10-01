module.exports = async ({ page, shot, log }) => {
  for (const y of [2020, 1997, 1975, 2025]) {
    await page.goto('http://localhost:8777/app/#year=' + y);
    await page.waitForTimeout(2200);
    const labels = await page.evaluate(() => [...document.querySelectorAll('text, .map__label')].map(e=>e.textContent.trim()).filter(Boolean));
    log('YEAR ' + y + ' labels(' + labels.length + '): ' + JSON.stringify(labels.slice(0,80)));
    await shot('y'+y);
  }
};
