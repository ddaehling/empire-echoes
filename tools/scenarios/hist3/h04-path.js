module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1000);
  // start lesson
  const start = page.locator('text=Start the lesson').first();
  await start.click(); await page.waitForTimeout(1400);
  await shot('beat-01');
  const t0 = Date.now();
  let words = 0, beats = 0, gates = 0;
  for (let i = 0; i < 40; i++) {
    const txt = await page.evaluate(() => document.body.innerText);
    const w = txt.split(/\s+/).length; words += w;
    const head = txt.split('\n').filter(Boolean).slice(0,6).join(' / ');
    log('STEP '+(i+1)+' ['+w+'w] '+head.slice(0,260));
    if (i===0||i===7||i===13||i===22) {
      const ctrls = await page.evaluate(()=>[...document.querySelectorAll('header button, header a, [data-mount=masthead] button, [data-mount=masthead] a')].map(e=>e.innerText.trim().replace(/\s+/g,' ')).filter(Boolean));
      log('  MASTHEAD('+ctrls.length+'): '+ctrls.join(' | '));
      await shot('beat-'+String(i+1).padStart(2,'0'));
    }
    // find a next control
    const next = await page.evaluate(() => {
      const cands=[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent!==null);
      const n=cands.find(e=>/^(next|continue|go on|on ?→|next →)/i.test(e.innerText.trim()));
      return n? n.innerText.trim() : null;
    });
    if (!next) {
      // gate? try answering
      const opt = await page.evaluate(() => {
        const cands=[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null);
        const o=cands.find(e=>/I think that is|commit|Show me|Reveal|I'?ll say|My answer/i.test(e.innerText));
        if(o){o.click(); return o.innerText.trim();} return null;
      });
      if (opt) { gates++; log('  GATE answered: '+opt); await page.waitForTimeout(700); continue; }
      log('  NO NEXT CONTROL — stop at step '+(i+1));
      const btns = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null).map(e=>e.innerText.trim().replace(/\s+/g,' ')).slice(0,25));
      log('  visible buttons: '+btns.join(' | '));
      break;
    }
    beats++;
    await page.evaluate(() => {
      const cands=[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent!==null);
      const n=cands.find(e=>/^(next|continue|go on|on ?→|next →)/i.test(e.innerText.trim()));
      if(n) n.click();
    });
    await page.waitForTimeout(800);
  }
  log('BEATS ADVANCED: '+beats+'  GATES: '+gates+'  TOTAL WORDS SEEN: '+words+'  elapsed(ms): '+(Date.now()-t0));
  await shot('path-end');
};
