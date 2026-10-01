module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#panel=classroom', { waitUntil:'load' });
  await page.waitForTimeout(2500);
  // intercept window.print so the sheet stays in the DOM
  await page.evaluate(()=>{ window.__printed = []; window.print = () => { window.__printed.push(document.body.innerText.length); }; });
  const names = ['Print the lesson plan','Print the board sheet'];
  for (const n of names) {
    await page.evaluate((nm)=>{const b=Array.from(document.querySelectorAll('button,a')).find(x=>(x.textContent||'').trim()===nm); if(b)b.click();}, n);
    await page.waitForTimeout(1200);
    const t = await page.evaluate(()=>{
      const cands = Array.from(document.querySelectorAll('[id*=print],[class*=print],[class*=sheet]'));
      const withText = cands.filter(c=>(c.innerText||'').length>200);
      return withText.length ? withText[0].innerText.slice(0,3000) : '(none) ';
    });
    log('### ' + n + '\n' + t + '\n');
  }
  // find any minute figure anywhere in the DOM including hidden print nodes
  const mins = await page.evaluate(()=>{
    const txt = document.documentElement.textContent;
    const out=[]; const re=/[^.\n]{0,90}\b\d{1,3}\s*(?:–|-|to)?\s*\d{0,3}\s*minutes?\b[^.\n]{0,50}/gi; let m;
    while((m=re.exec(txt))) out.push(m[0].replace(/\s+/g,' ').trim());
    const re2=/[^.\n]{0,90}\b(thirty|forty|fifty|forty-five)[- ]minute[^.\n]{0,50}/gi;
    while((m=re2.exec(txt))) out.push('WORDS: '+m[0].replace(/\s+/g,' ').trim());
    return [...new Set(out)];
  });
  log('=== EVERY MINUTE FIGURE IN THE DOM (' + mins.length + ') ===\n' + mins.join('\n'));
};
