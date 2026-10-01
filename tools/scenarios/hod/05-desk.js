module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(6000);
  const d = await page.$('text=Teaching desk');
  if(!d){ log('NO TEACHING DESK'); return; }
  await d.click(); await page.waitForTimeout(2500);
  await shot('desk');
  log(await page.evaluate(()=>document.body.innerText));
  const btns = await page.evaluate(()=>[...document.querySelectorAll('button,a')].map(b=>(b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,120));
  log('CONTROLS: '+JSON.stringify(btns));
};
