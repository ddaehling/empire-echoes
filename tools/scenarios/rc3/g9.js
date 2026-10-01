module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1891&sel=southern-rhodesia&tour=core&step=9&filter=stage:working,pressure:off&view=4,0.0829,0.0811');
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /the field/i }).first().click().catch(()=>{});
  await page.waitForTimeout(1200);
  await shot('field9');
  const o = await page.evaluate(() => ({
    inputs: [...document.querySelectorAll('input,textarea,select')].map(e=>e.type+':'+(e.getAttribute('aria-label')||e.placeholder||e.name||'').slice(0,60)),
    txt: (document.querySelector('[class*="gate"], [class*="field"]')||document.body).innerText.slice(0,2500)
  }));
  log(JSON.stringify(o.inputs));
  log(o.txt);
};
