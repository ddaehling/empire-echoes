/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  const t0 = Date.now();
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1600);
  for (let i = 1; i <= 22; i++) {
    const info = await page.evaluate(() => {
      const g=s=>{const e=document.querySelector(s); if(!e)return 'none'; const r=e.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`;};
      const p=document.querySelector('[aria-label*="scrollable"]');
      const t=document.body.innerText;
      return { step:(t.match(/(\d+)\s*\/\s*(\d+)/)||[])[0], map:g('.stage__map'),
        panel:p?`${Math.round(p.getBoundingClientRect().height)}h/${p.scrollHeight}`:'none',
        cloze:(t.match(/\d\/6/)||['-'])[0],
        title: t.split('\n').filter(s=>s.trim()).slice(4,8).join(' ~ ').slice(0,180) };
    });
    log(`=== ${i} :: ${info.step} map=${info.map} panel=${info.panel} cloze=${info.cloze} | ${info.title}`);
    await shot('p' + String(i).padStart(2,'0'));
    // answer any multiple-choice groups inside the panel (tension / commit)
    for (let round=0; round<8; round++) {
      const disabled = await page.locator('button:disabled').filter({hasText:/Show me what they wrote/i}).count();
      if (!disabled) break;
      const clicked = await page.evaluate(() => {
        const groups = [...document.querySelectorAll('[class*=tension] fieldset, [class*=tension] [role=group], .tr-tension__q')];
        for (const g of groups) {
          const bs = [...g.querySelectorAll('button')].filter(b=>!b.disabled && !/Show me/.test(b.textContent));
          if (bs.length && !bs.some(b=>b.getAttribute('aria-pressed')==='true'||b.classList.contains('is-chosen')||b.dataset.chosen)) { bs[0].click(); return true; }
        }
        const any = [...document.querySelectorAll('[class*=tension] button')].filter(b=>!b.disabled && !/Show me/.test(b.textContent) && b.getAttribute('aria-pressed')!=='true');
        if (any.length) { any[0].click(); return true; }
        return false;
      });
      if (!clicked) break;
      await page.waitForTimeout(250);
    }
    const show = page.getByRole('button', { name: /Show me what they wrote/i });
    if (await show.count()>0 && await show.first().isEnabled()) { await show.first().click(); await page.waitForTimeout(900); await shot('p'+String(i).padStart(2,'0')+'-reveal'); }
    const didGate = await page.evaluate(() => {
      const b=[...document.querySelectorAll('button')].find(x=>/^complicates it, (fairly sure|sure)$/i.test((x.getAttribute('aria-label')||'').trim()));
      if(b){b.click();return true;} return false; });
    if (didGate) { await page.waitForTimeout(1000); await shot('p'+String(i).padStart(2,'0')+'-gate'); }
    const commit = await page.evaluate(() => {
      const b=[...document.querySelectorAll('button')].filter(x=>/^I think that is (true|false)$/i.test(x.textContent.trim()));
      if(b.length){b[0].click();return true;} return false; });
    if (commit) await page.waitForTimeout(700);
    const guess = page.getByRole('button', { name: /That is my guess/i });
    if (await guess.count()>0 && await guess.first().isVisible()) {
      const inp = page.locator('input').first();
      if (await inp.count()>0) { try{ await inp.fill('4'); }catch(e){} }
      if (await guess.first().isEnabled()) { await guess.first().click(); await page.waitForTimeout(900); }
      else { const rn=page.getByRole('button',{name:/rather not guess/i}); if(await rn.count()>0) {await rn.first().click(); await page.waitForTimeout(700);} }
      await shot('p'+String(i).padStart(2,'0')+'-guess');
    }
    // ordering / commit tasks
    await page.evaluate(() => {
      const b=[...document.querySelectorAll('button')].filter(x=>/^(Commit|Skip — it stays unanswered)$/.test(x.textContent.trim()));
      const c=b.find(x=>/^Commit$/.test(x.textContent.trim())&&!x.disabled)||b.find(x=>/Skip/.test(x.textContent));
      if(c)c.click(); });
    await page.waitForTimeout(900);
    // NOP write-the-four
    const areas = await page.locator('textarea:visible').count();
    if (areas) { for (let k=0;k<areas;k++){ try{ await page.locator('textarea:visible').nth(k).fill('a note'); }catch(e){} } await page.waitForTimeout(400);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(Done|Show me|Compare|Reveal|Now show|See what)/i.test(x.textContent.trim())&&!x.disabled); if(b)b.click();});
      await page.waitForTimeout(1000); await shot('p'+String(i).padStart(2,'0')+'-nop'); }
    const next = page.getByRole('button', { name: /^Next/i }).first();
    if (await next.count()===0 || !(await next.isVisible()) || !(await next.isEnabled())) {
      log('STOP: Next unavailable at ' + info.step);
      const t = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,1200)); log(t);
      break;
    }
    await next.click(); await page.waitForTimeout(1500);
  }
  log('elapsed ms: ' + (Date.now()-t0));
  await shot('done');
  log('--- final ---'); log((await page.evaluate(()=>document.body.innerText)).slice(0,3000));
  log('--- errors ---'); errs.forEach(e=>log(e));
};
