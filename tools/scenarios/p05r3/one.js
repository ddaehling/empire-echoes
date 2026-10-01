module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(1600);
  await page.evaluate(() => { location.hash = '#tour=thirty&step=19'; });
  await page.waitForTimeout(3000);
  const d = await page.evaluate(() => {
    const s = document.querySelector('.app__sheet');
    return { title: (document.querySelector('.cx-sheet__head')||{}).innerText,
      lede: (document.querySelector('.app__lede')||{}).innerText,
      figs: [...document.querySelectorAll('.tr-q[data-fig]')].map(x=>x.getAttribute('data-fig')),
      block: !!document.querySelector('.tr-figs'),
      text: s ? s.innerText.slice(0,700) : null };
  });
  log(JSON.stringify(d, null, 1));
  await shot('sing');
};
