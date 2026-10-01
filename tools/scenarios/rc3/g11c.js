module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1919&sel=punjab-province&tour=core&step=11&filter=stage:working,pressure:off&view=7,0.2095,-0.0722');
  await page.waitForTimeout(2600);
  // find scroller containing "Two men"
  const sc = await page.evaluateHandle(()=>{ return [...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+40 && /Two men|Which account explains/.test(e.textContent)).pop(); });
  await page.evaluate(el=>{ if(el) el.scrollTop = 0; }, sc);
  await page.waitForTimeout(400);
  const full = await page.evaluate(el=>el?el.innerText:'', sc);
  log('PANEL FULL >>>\n' + full.slice(0,6000));
  await shot('top');
};
