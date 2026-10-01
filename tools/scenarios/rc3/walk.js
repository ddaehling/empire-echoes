module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1500);
  await shot('step-01');
  const dump = async (i) => {
    const o = await page.evaluate(() => {
      const panel = document.querySelector('[data-beat], .beat, .lesson, [class*="beat"]');
      return {
        url: location.href,
        text: document.body.innerText.replace(/\s+\n/g,'\n').slice(0, 2600),
        ctrls: [...document.querySelectorAll('button,[role=button]')].filter(e=>e.offsetParent!==null).map(e=>(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).slice(0,40)
      };
    });
    log('=== STEP ' + i + ' url=' + o.url);
    log(o.text);
    log('CTRLS: ' + JSON.stringify(o.ctrls));
  };
  await dump(1);
  for (let i = 2; i <= 30; i++) {
    const next = page.getByRole('button', { name: /^(Next|Go on|Continue)/i }).first();
    const n = await next.count();
    if (!n) { log('NO NEXT at step ' + i); break; }
    const dis = await next.isDisabled().catch(()=>false);
    if (dis) { log('NEXT DISABLED at step ' + i + ' (gate)'); 
      // try to satisfy gate: click any option
      const opts = page.locator('[data-option], .option, button[data-choice]');
      const c = await opts.count();
      log('gate options: ' + c);
      if (c) { await opts.first().click(); await page.waitForTimeout(600); }
    }
    await next.click({timeout: 5000}).catch(e=>log('click fail '+e.message));
    await page.waitForTimeout(900);
    await dump(i);
    if (i % 4 === 0 || i>=20) await shot('step-' + String(i).padStart(2,'0'));
  }
};
