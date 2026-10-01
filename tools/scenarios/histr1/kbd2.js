module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{const b=Array.from(document.querySelectorAll('button')).find(x=>/start the lesson/i.test(x.textContent||'')); if(b)b.click();});
  await page.waitForTimeout(1400);
  const seq=[];
  for (let i=0;i<45;i++){
    await page.keyboard.press('Tab');
    seq.push(await page.evaluate(()=>{const e=document.activeElement;return (e.tagName)+'['+(((e.getAttribute&&e.getAttribute('aria-label'))||e.textContent||'').trim().slice(0,34))+']';}));
  }
  log('TAB ORDER:\n' + seq.join('\n'));
  // now try ArrowRight
  const before = await page.evaluate(()=>document.querySelector('.tr-bar')?document.querySelector('.tr-bar').innerText:'');
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
  const after = await page.evaluate(()=>document.querySelector('.tr-bar')?document.querySelector('.tr-bar').innerText:'');
  log('ArrowRight: before=' + JSON.stringify(before) + ' after=' + JSON.stringify(after));
  // click into the page body then Enter
  await page.evaluate(()=>document.body.focus());
  await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  log('after Enter: ' + await page.evaluate(()=>document.querySelector('.tr-bar')?document.querySelector('.tr-bar').innerText:''));
};
