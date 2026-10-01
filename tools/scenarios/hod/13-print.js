module.exports = async ({ page, shot, log }) => {
  await page.addInitScript(()=>{window.print=()=>{window.__p=(window.__p||0)+1;};});
  const which = process.env.HOD_LESSON || '1';
  const pack = process.env.HOD_PACK || 'plan';
  await page.goto(page.url().split('#')[0] + '#panel=classroom', { waitUntil:'load' });
  await page.waitForTimeout(13000);
  if (which==='2') {
    await page.evaluate(()=>{const b=[...document.querySelectorAll('.tp-unit__b')].find(x=>/LESSON TWO/i.test(x.innerText)); b&&b.click();});
    await page.waitForTimeout(4000);
  }
  const ok = await page.evaluate((pid)=>{
    const li=[...document.querySelectorAll('.tp-packs__i')].find(x=>x.dataset.pack&&x.dataset.pack.startsWith(pid));
    if(!li) return 'no li';
    const b=li.querySelector('button'); if(!b) return 'no btn'; b.click(); return li.dataset.pack;
  }, pack);
  log('clicked '+ok);
  await page.waitForTimeout(2500);
  const paper = await page.evaluate(()=>{const p=document.querySelector('.tp-paper'); return p? p.innerText : 'NO PAPER';});
  log('===== PAPER ('+ok+') =====');
  log(paper);
  await page.emulateMedia({media:'print'});
  await page.waitForTimeout(600);
  await shot('print-'+pack+'-L'+which);
  await page.emulateMedia({media:'screen'});
};
