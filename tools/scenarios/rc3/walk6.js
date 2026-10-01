module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1300);
  const satisfy = async () => {
    await page.evaluate(() => {
      const j = [...document.querySelectorAll('button')].find(b=>/the field|place the fact/i.test(b.getAttribute('aria-label')||b.innerText));
      if (j) j.click();
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      document.querySelectorAll('textarea').forEach(t => { if(!t.value){ t.value='A concession document of 1888, made for the company; it cannot record what was said aloud.'; t.dispatchEvent(new Event('input',{bubbles:true})); t.dispatchEvent(new Event('change',{bubbles:true})); }});
    });
    await page.waitForTimeout(400);
    // click one unchecked radio per radiogroup
    for (let pass=0; pass<3; pass++) {
      const did = await page.evaluate(() => {
        const groups = [...document.querySelectorAll('[role=radiogroup]')];
        let n=0;
        const doGroup = (g)=>{ const rs=[...g.querySelectorAll('[role=radio]')]; if(rs.length && !rs.some(r=>r.getAttribute('aria-checked')==='true')) { rs[0].click(); n++; } };
        if (groups.length) groups.forEach(doGroup);
        else { const rs=[...document.querySelectorAll('[role=radio]')]; rs.forEach(r=>{ if(r.getAttribute('aria-checked')!=='true'){r.click(); n++;} }); }
        return n;
      });
      await page.waitForTimeout(400);
      if (!did) break;
    }
    await page.evaluate(() => {
      const rx = /Now show me this atlas|Show me what they wrote|That is my guess|^Weigh it up|^Show me|^Reveal|Place it/i;
      const b = [...document.querySelectorAll('button')].find(b=>rx.test((b.getAttribute('aria-label')||b.innerText).trim()) && !b.disabled);
      if (b) b.click();
    });
    await page.waitForTimeout(900);
  };
  let last='';
  for (let i = 1; i <= 40; i++) {
    const bar = await page.evaluate(() => document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,110)||'');
    log(`STEP ${i} | ${bar} | ${page.url().replace(/.*#/,'').slice(0,90)}`);
    let hasNext = await page.evaluate(()=>!![...document.querySelectorAll('button')].find(b=>/^Next beat$/i.test((b.getAttribute('aria-label')||'').trim())));
    let tries=0;
    while (!hasNext && tries<5) { await satisfy(); hasNext = await page.evaluate(()=>!![...document.querySelectorAll('button')].find(b=>/^Next beat$/i.test((b.getAttribute('aria-label')||'').trim()))); tries++; }
    if (!hasNext) { log('   BLOCKED'); await shot('blk'+i); log((await page.evaluate(()=>document.body.innerText)).slice(0,1500)); break; }
    await shot('s'+String(i).padStart(2,'0'));
    await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(b=>/^Next beat$/i.test((b.getAttribute('aria-label')||'').trim())); if(b) b.click(); });
    await page.waitForTimeout(1200);
    if (page.url()===last) { log('  NO ADVANCE — probably at end'); break; }
    last = page.url();
  }
  await shot('final');
  log('FINAL>>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,7000));
};
