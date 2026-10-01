module.exports = async ({ page, shot, log }) => {
  await page.addInitScript(()=>{window.print=()=>{};});
  await page.goto(page.url().split('#')[0] + '#panel=classroom', { waitUntil:'load' });
  await page.waitForTimeout(14000);
  const dump = async (tag) => {
    const r = await page.evaluate(()=>({
      unit: [...document.querySelectorAll('.tp-unit__b')].map(b=>({t:b.innerText.replace(/\n/g,' | '),on:b.getAttribute('aria-pressed')})),
      packs: [...document.querySelectorAll('.tp-packs__i')].map(li=>({
        id: li.dataset.pack,
        title: (li.querySelector('.tp-packs__t')||{}).innerText,
        titleHTML: (li.querySelector('.tp-packs__t')||{}).innerHTML,
        why: ((li.querySelector('.tp-packs__w')||{}).innerText||'').slice(0,200)
      }))
    }));
    log('=== '+tag+' ===');
    log('UNIT: '+JSON.stringify(r.unit,null,1));
    r.packs.forEach(p=>log(`  [${p.id}] TITLE="${p.title}"\n      HTML=${p.titleHTML}\n      WHY=${p.why}`));
  };
  await dump('LESSON ONE (default)');
  await shot('l1');
  // switch to lesson two
  const ok = await page.evaluate(()=>{const b=[...document.querySelectorAll('.tp-unit__b')].find(x=>/LESSON TWO/i.test(x.innerText)); if(!b)return false; b.click(); return true;});
  log('switched: '+ok);
  await page.waitForTimeout(4000);
  await dump('LESSON TWO');
  await shot('l2');
};
