module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: /^Start the lesson/i }).first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);
  for (let i = 1; i <= 22; i++) {
    const bar = await page.evaluate(() => (document.querySelector('.tr-bar')||{innerText:'-'}).innerText.replace(/\s+/g,' ').trim());
    // checkpoint / recall card open?
    const card = await page.evaluate(() => {
      const c = [...document.querySelectorAll('button')].find(b => /^Commit$/i.test((b.innerText||'').trim()));
      if (c) { c.focus(); return 'commit'; }
      const rv = [...document.querySelectorAll('button')].find(b => /^(Show me|Reveal|See the record|Continue|Carry on|Back to the lesson|Go on)$/i.test((b.innerText||'').trim()));
      if (rv) { rv.focus(); return 'reveal:' + rv.innerText.trim(); }
      return null;
    });
    if (card) {
      // pick an option first if radios present
      await page.evaluate(() => {
        const o = [...document.querySelectorAll('[role="radio"],.qz__opt,button[data-opt]')].find(x => x.offsetParent !== null);
        if (o) o.click();
      });
      await page.waitForTimeout(400);
      await page.evaluate(() => { const c = [...document.querySelectorAll('button')].find(b => /^Commit$/i.test((b.innerText||'').trim())); c && c.focus(); });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1400);
      log(i + ' card -> ' + card + ' | bar ' + bar);
      continue;
    }
    if (/GATE/.test(bar)) {
      await page.getByRole('button', { name: /place the fact/i }).first().focus();
      await page.keyboard.press('Enter'); await page.waitForTimeout(500);
      await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
      log(i + ' gate placed');
    }
    const what = await page.evaluate(() => {
      const n = [...document.querySelectorAll('.tr-bar button')].find(b => /next beat/i.test(b.getAttribute('aria-label')||''));
      if (n && !n.disabled) { n.focus(); return 'next'; }
      const f = [...document.querySelectorAll('.tr-bar button')].find(b => /finish/i.test((b.getAttribute('aria-label')||b.innerText||'')));
      if (f) { f.focus(); return 'finish'; }
      return null;
    });
    log(i + ' bar="' + bar + '" -> ' + what);
    if (!what) { await shot('stuck'); break; }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1700);
    if (what === 'finish') { await page.waitForTimeout(2500); break; }
  }
  await shot('close-full');
  log('\n===== CLOSE (full walk) =====\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 3500));
};
