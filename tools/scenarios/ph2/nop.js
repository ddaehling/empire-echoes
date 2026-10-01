const R = require('../lib/routes.js');
module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  await page.goto('http://localhost:8777/app/#tour=lesson-two&step=4');
  await R.ready(page); await page.waitForTimeout(1800);
  const d = await page.evaluate(() => ({
    fields: [...document.querySelectorAll('.tr-panel textarea, .tr-panel input, .app__sheet textarea, .app__sheet input')].map(n=>({tag:n.tagName,cls:String(n.className).slice(0,40),type:n.type,ph:(n.placeholder||'').slice(0,40)})),
    buttons: [...document.querySelectorAll('.app__sheet button')].map(n=>({cls:String(n.className).slice(0,40),txt:(n.textContent||'').replace(/\s+/g,' ').trim().slice(0,50),dis:n.disabled})),
  }));
  log('FIELDS: ' + JSON.stringify(d.fields, null, 1));
  log('BUTTONS: ' + JSON.stringify(d.buttons.filter(b=>/nop|decline|rather|four/i.test(b.cls+b.txt)), null, 1));
  await shot('nop-0');
  // scroll the panel to the fields
  await page.evaluate(() => { const s=document.querySelector('.tr-panel__scroll'); if(s) s.scrollTop = 700; });
  await page.waitForTimeout(400); await shot('nop-scrolled');
  // type into the real fields
  const typed = await page.evaluate(async () => {
    const fs = [...document.querySelectorAll('.tr-panel textarea, .tr-panel__scroll textarea')];
    return fs.length;
  });
  log('textareas in panel: ' + typed);
  for (let i=0;i<8;i++) {
    const ok = await page.evaluate((i) => {
      const fs=[...document.querySelectorAll('.tr-panel__scroll textarea, .tr-panel__scroll input[type=text]')];
      if (!fs[i]) return false; fs[i].scrollIntoView({block:'center'}); fs[i].focus(); return true;
    }, i);
    if (!ok) break;
    await page.keyboard.type('A treaty concession, in a printed parliamentary paper.');
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => ({
    next: document.querySelector('.tr-bar__next')?.textContent.replace(/\s+/g,''),
    dis: document.querySelector('.tr-bar__next')?.disabled,
    count: [...document.querySelectorAll('.app__sheet')].map(n=>(n.innerText.match(/(\d) of 4 written/)||[])[0]).filter(Boolean),
  }));
  log('AFTER TYPING: ' + JSON.stringify(after));
  await shot('nop-typed');
  // now try decline
  const dec = await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/rather read this atlas/i.test(x.textContent||'')); if(!b) return 'no-decline'; b.scrollIntoView({block:'center'}); b.click(); return 'clicked'; });
  await page.waitForTimeout(900);
  log('DECLINE: ' + dec + ' -> ' + JSON.stringify(await page.evaluate(() => ({ next: document.querySelector('.tr-bar__next')?.textContent.replace(/\s+/g,''), dis: document.querySelector('.tr-bar__next')?.disabled }))));
  await shot('nop-declined');
};
