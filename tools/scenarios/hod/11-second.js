module.exports = async ({ page, shot, log }) => {
  await page.addInitScript(()=>{window.print=()=>{};});
  await page.goto(page.url().split('#')[0] + '#panel=classroom', { waitUntil:'load' });
  await page.waitForTimeout(13000);
  await page.evaluate(()=>{const l=[...document.querySelectorAll('.tp-packs__i')].filter(x=>/Lesson OneLesson One/.test(x.innerText)); if(l[0]) l[0].scrollIntoView({block:'center'});});
  await page.waitForTimeout(1500);
  await shot('second-block');
  // heading of each tp-block containing packs
  log(JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('.tp-block')].filter(b=>b.querySelector('.tp-packs')).map(b=>({h:(b.querySelector('h2,h3')||{}).innerText, n:b.querySelectorAll('.tp-packs__i').length}))),null,1));
};
