module.exports = async ({ page, shot, log }) => {
  await page.addInitScript(()=>{window.print=()=>{window.__printed=(window.__printed||0)+1;};});
  await page.goto(page.url().split('#')[0] + '#panel=classroom', { waitUntil:'load' });
  await page.waitForTimeout(8000);
  const dom = await page.evaluate(()=>{
    const p = document.querySelector('.tp, [class*="tp-"]')?.closest('aside,section,div');
    const root = document.querySelector('#tp, .tp-panel, [class*=tp-]')?.parentElement || document.body;
    const ctrl = [...document.querySelectorAll('.tp-lessonpick button, [class*=lesson] button, button[class*=lesson]')].map(b=>({c:b.className,t:b.innerText.trim().replace(/\s+/g,' '),press:b.getAttribute('aria-pressed')}));
    return {ctrl};
  });
  log('LESSON CONTROLS: '+JSON.stringify(dom.ctrl,null,1));
  const all = await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>({t:b.innerText.trim().replace(/\s+/g,' ').slice(0,60),c:String(b.className).slice(0,50),p:b.getAttribute('aria-pressed')})).filter(b=>/lesson|Lesson/i.test(b.t+b.c)));
  log('ANY LESSON BUTTON: '+JSON.stringify(all,null,1));
  // duplication check
  const dup = await page.evaluate(()=>[...document.querySelectorAll('.tp-packs__i, [class*=pack]')].slice(0,20).map(e=>({html:e.innerHTML.slice(0,260)})));
  log('PACK HTML: '+JSON.stringify(dup.slice(0,6),null,1));
  await shot('pick');
};
