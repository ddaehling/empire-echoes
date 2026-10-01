module.exports = async ({ page, shot, log }) => {
  await page.addInitScript(()=>{window.print=()=>{};});
  await page.goto(page.url().split('#')[0] + '#tour=lesson-two&step=1', { waitUntil:'load' });
  await page.waitForTimeout(12000);
  log('STATUS: '+await page.evaluate(()=>{const s=document.querySelector('[role=status],.sr-only,[aria-live]');return s?s.innerText:'';}));
  log('BODY HEAD: '+(await page.evaluate(()=>document.body.innerText)).slice(0,1200));
  await shot('l2-step1');
  // now open desk and print the plan
  await page.evaluate(()=>{location.hash='#panel=classroom';});
  await page.waitForTimeout(5000);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('.tp-unit__b')].find(x=>/LESSON TWO/i.test(x.innerText)); b&&b.click();});
  await page.waitForTimeout(3500);
  const ok = await page.evaluate(()=>{const li=[...document.querySelectorAll('.tp-packs__i')].find(x=>x.dataset.pack&&x.dataset.pack.startsWith('plan')); if(!li)return 'no'; li.querySelector('button').click(); return li.dataset.pack;});
  log('clicked '+ok); await page.waitForTimeout(2500);
  const p = await page.evaluate(()=>{const e=document.querySelector('.tp-paper'); return e?e.innerText:'NONE';});
  log('=== PAPER AFTER RUNNING L2 ===');
  log(p.slice(0,3000));
};
