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

  const nextState = () => page.evaluate(() => {
    const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className));
    const t=document.body.innerText;
    return { step:(t.match(/(\d+)\s*\/\s*(\d+)/)||[])[0],
      next: b.map(x=>({label:(x.getAttribute('aria-label')||x.textContent).trim().slice(0,40), disabled:x.disabled})) };
  });

  for (let i = 1; i <= 20; i++) {
    let st = await nextState();
    const geo = await page.evaluate(()=>{ const g=s=>{const e=document.querySelector(s); if(!e)return 'none'; const r=e.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`;};
      const p=document.querySelector('[aria-label*="scrollable"]');
      return `map=${g('.stage__map')} panel=${p?Math.round(p.getBoundingClientRect().height)+'h/'+p.scrollHeight:'none'} cloze=${(document.body.innerText.match(/\d\/6/)||['-'])[0]}`; });
    const head = await page.evaluate(()=>{ const e=document.querySelector('.tr-beat__line,.tr-beat__head,[class*=beat] h2, [class*=beat] p'); return e?e.innerText.replace(/\s+/g,' ').slice(0,120):''; });
    log(`=== ${i} :: ${st.step} ${geo} | ${head}`);
    await shot('d' + String(i).padStart(2,'0'));

    let tries = 0;
    while (st.next.length && st.next.every(n=>n.disabled) && tries < 30) {
      tries++;
      const gt = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(weakens|complicates|doesn't affect) it, (sure|fairly sure|not sure)$/i.test((x.getAttribute('aria-label')||'').trim())&&!x.disabled); if(b){b.click();return true;} return false;});
      if (gt) { await page.waitForTimeout(1000); st = await nextState(); continue; }
      const go = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Show me what they wrote/i.test(x.textContent)&&!x.disabled); if(b){b.click();return true;} return false;});
      if (go) { await page.waitForTimeout(1200); st = await nextState(); continue; }
      const acted = await page.evaluate(() => {
        const panel = document.querySelector('.tr-panel, [class*="tr-panel"]') || document;
        const bs = [...panel.querySelectorAll('button')].filter(b => !b.disabled && b.offsetParent &&
          !/tr-panel__next|tr-bar__|tl-|legend|ly-|bar__more|dossier__close|__close/.test(b.className) &&
          !/^(×|✕|Finish|Back|Tools|Play|Layers)/.test(b.textContent.trim()) &&
          !/Blank \d|Skip to|rather not|Open that record|All \d+|full record|Weigh it up|go to it/i.test((b.getAttribute('aria-label')||b.textContent)));
        const fresh = bs.filter(b => b.getAttribute('aria-pressed') !== 'true' && !b.classList.contains('is-on') && !b.classList.contains('is-chosen') && b.dataset.chosen !== 'yes' && !b.hasAttribute('data-picked'));
        const pick = fresh.length ? fresh : bs;
        if (!pick.length) return null;
        const b = pick[0];
        const lbl = (b.getAttribute('aria-label')||b.textContent).trim().slice(0,60);
        b.click(); b.setAttribute('data-picked','1'); return lbl;
      }).catch(()=>null);
      if (!acted) {
        const areas = await page.locator('textarea:visible').count();
        if (areas) { for (let k=0;k<areas;k++){ try{ await page.locator('textarea:visible').nth(k).fill('a note'); }catch(e){} } }
        else break;
      } else log('   act: ' + acted);
      await page.waitForTimeout(500);
      st = await nextState();
    }
    st = await nextState();
    const usable = st.next.find(n=>!n.disabled);
    if (!usable) {
      log('   BLOCKED at ' + st.step + ' :: ' + JSON.stringify(st.next));
      await shot('blocked-' + String(i).padStart(2,'0'));
      const c = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent&&!b.disabled).map(b=>((b.getAttribute('aria-label')||b.textContent).trim().replace(/\s+/g,' ').slice(0,60))));
      c.forEach(x=>log('     btn: '+x));
      break;
    }
    await page.evaluate(() => { const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b)b.click(); });
    await page.waitForTimeout(1500);
    const after = await nextState();
    if (after.step === st.step) { log('   step did not advance from ' + st.step); }
  }
  log('elapsed ms: ' + (Date.now()-t0));
  await shot('final');
  log('--- final text ---'); log((await page.evaluate(()=>document.body.innerText)).slice(0,4000));
  log('--- errors ---'); errs.forEach(e=>log(e));
};
