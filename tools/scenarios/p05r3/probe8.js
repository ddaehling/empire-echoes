module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#tour=core&step=11'; });
  await page.waitForTimeout(1600);
  const d = await page.evaluate(() => {
    const s = document.querySelector('.app__sheet');
    return { text: s ? s.innerText.slice(0, 1500) : null,
      buttons: [...document.querySelectorAll('.app__sheet button')].map(b => b.className + ' | ' + (b.textContent||'').trim().slice(0,40) + (b.disabled?' [dis]':'')),
      locked: (window.BEA.toursState||{}).locked };
  });
  log(JSON.stringify(d, null, 1));
  await shot('step9');
};
