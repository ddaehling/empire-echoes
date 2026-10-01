module.exports = async ({ page, shot, log }) => {
  const T = process.env.HOD_TOUR||'lesson-one';
  await page.goto(page.url().split('#')[0] + '#tour='+T+'&step=9', { waitUntil:'load' });
  await page.waitForTimeout(11000);
  log('BAR: '+await page.evaluate(()=>{const b=document.querySelector('.tr-bar'); return b?b.innerText.replace(/\s+/g,' '):'none';}));
  log('BTNS: '+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('.tr-bar button, .tr-panel button')].map(b=>({t:b.innerText.trim().replace(/\s+/g,' ').slice(0,40),d:b.disabled,c:String(b.className).slice(0,30)})))));
  await shot('step9-'+T);
};
