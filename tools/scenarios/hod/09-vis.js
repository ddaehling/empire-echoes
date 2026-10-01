module.exports = async ({ page, shot, log }) => {
  await page.addInitScript(()=>{window.print=()=>{};});
  await page.goto(page.url().split('#')[0] + '#panel=classroom', { waitUntil:'load' });
  await page.waitForTimeout(13000);
  const r = await page.evaluate(()=>[...document.querySelectorAll('.tp-packs__i')].map(li=>{
    const b=li.getBoundingClientRect(); const cs=getComputedStyle(li);
    let sec = li.closest('section,[class*=tp-]'); let chain=[];
    let n=li; for(let i=0;i<6&&n;i++){ n=n.parentElement; if(n) chain.push(n.className||n.tagName); }
    return {id:li.dataset.pack, t:(li.querySelector('.tp-packs__t')||{}).innerText, w:Math.round(b.width),h:Math.round(b.height), top:Math.round(b.top), disp:cs.display, vis:cs.visibility, chain:chain.join(' < ').slice(0,160)};
  }));
  r.forEach(x=>log(JSON.stringify(x)));
  // scroll the panel and shoot the packs region
  await page.evaluate(()=>{const e=document.querySelector('.tp-packs'); if(e) e.scrollIntoView({block:'start'});});
  await page.waitForTimeout(1200); await shot('packs');
};
