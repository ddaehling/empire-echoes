module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#panel=classroom', { waitUntil:'load' });
  await page.waitForTimeout(3000);
  const btns = await page.evaluate(()=>Array.from(document.querySelectorAll('button,a')).filter(b=>/^print/i.test((b.textContent||'').trim())).map(b=>(b.textContent||'').trim()));
  log('print controls: ' + JSON.stringify(btns));
  // click the lesson plan print and capture what the print root holds
  await page.evaluate(()=>{const b=Array.from(document.querySelectorAll('button,a')).find(x=>/print the lesson plan/i.test(x.textContent||'')); if(b)b.click();});
  await page.waitForTimeout(1500);
  const t = await page.evaluate(()=>{
    const r = document.querySelector('#print-root, .tk-print, [class*="print"]');
    return r ? r.innerText.slice(0,4000) : 'no print root; body head: ' + document.body.innerText.slice(0,1500);
  });
  log('=== PRINT ROOT ===\n' + t);
  // titles of every printable sheet
  const titles = await page.evaluate(()=>Array.from(document.querySelectorAll('h1,h2,h3')).map(h=>h.textContent.trim()).filter(x=>/minute|lesson plan|task sheet|answer key|board/i.test(x)));
  log('sheet titles: ' + JSON.stringify(titles));
};
