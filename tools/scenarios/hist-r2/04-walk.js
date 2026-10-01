module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1500);
  const names = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>JSON.stringify({t:b.className, a:(b.getAttribute('aria-label')||b.innerText).replace(/\s+/g,' ').trim().slice(0,60)})));
  log('BUTTONS', names.join('\n'));
};
