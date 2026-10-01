module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1200);
  const y = async l => log(l+' year='+await page.evaluate(()=>window.BEA.store.getState().year));
  await page.evaluate(()=>window.BEA.store.act.setYear(1765)); await page.waitForTimeout(600); await y('after setYear 1765');
  await page.evaluate(()=>window.BEA.store.act.select('british-india')); await page.waitForTimeout(700); await y('after select');
  const clicked = await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent).find(e=>/compare/i.test(e.getAttribute('aria-label')||e.innerText)); if(b){b.click();return (b.getAttribute('aria-label')||b.innerText).trim();} return null;});
  log('clicked: '+clicked);
  await page.waitForTimeout(1600); await y('after compare open');
  await shot('compare-open');
  const heads = await page.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,[class*=year],[data-year]')].map(e=>e.innerText||e.getAttribute('data-year')).filter(Boolean).slice(0,25));
  log('HEADS: '+JSON.stringify(heads));
  // now inside a lesson beat
  await page.goto('http://localhost:8777/app/'); await page.waitForTimeout(2500);
  await page.locator('text=Start the lesson').first().click(); await page.waitForTimeout(1500);
  for(let i=0;i<3;i++){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent).find(e=>/^next/i.test(e.innerText.trim())); if(b)b.click();}); await page.waitForTimeout(800); }
  await y('beat 4');
  const lede = await page.evaluate(()=>{const e=document.querySelector('[data-mount=tourpanel]')||document.body; const t=e.innerText; const m=t.match(/\b(1[5-9]\d\d|20\d\d)\b/); return {first:m&&m[0], snippet:t.slice(0,200).replace(/\n/g,' ')};});
  log('BEAT LEDE: '+JSON.stringify(lede));
  const c2 = await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent).find(e=>/compare/i.test(e.getAttribute('aria-label')||e.innerText)); if(b){b.click();return 'yes';} return 'no compare control in beat';});
  log('compare in beat: '+c2);
  await page.waitForTimeout(1500); await y('after compare in beat');
  await shot('compare-in-beat');
  log('SCREEN: '+(await page.evaluate(()=>document.body.innerText)).slice(0,1400));
};
