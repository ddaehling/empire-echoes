/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* =============================================================================
   P17 ROUND 6 — THE SPOKEN NAME OF EVERY CONTROL AND SWATCH IN THE LEGEND.

   Chromium's own accessible-name computation, through CDP, on the running app,
   beside the string a sighted reader actually sees (text-transform applied,
   `aria-hidden` and `.visually-hidden` subtrees removed — the two things a
   name computation and an eye disagree about).

   It asserts WCAG 2.5.3 Label in Name on every INTERACTIVE element: the
   accessible name must contain the visible label. Case and punctuation are
   normalised, word order is not.
   ========================================================================== */

const VIS = `function(){
  const b=this.getBoundingClientRect(); const cs=getComputedStyle(this);
  const painted = cs.display!=='none' && cs.visibility!=='hidden' && b.width>0 && b.height>0;
  const w=document.createTreeWalker(this,NodeFilter.SHOW_TEXT,null); const out=[];
  while(w.nextNode()){
    let p=w.currentNode.parentElement, hid=false, tt='none';
    let q=p;
    while(q && q!==this.parentElement){
      const s=getComputedStyle(q);
      if(q.getAttribute && q.getAttribute('aria-hidden')==='true'){hid=true;break;}
      if(q.classList && (q.classList.contains('visually-hidden')||q.classList.contains('legend__spoken'))){hid=true;break;}
      if(s.display==='none'||s.visibility==='hidden'){hid=true;break;}
      if(tt==='none' && s.textTransform!=='none') tt=s.textTransform;
      q=q.parentElement;
    }
    if(hid) continue;
    let t=w.currentNode.nodeValue;
    if(tt==='uppercase') t=t.toUpperCase(); else if(tt==='lowercase') t=t.toLowerCase();
    else if(tt==='capitalize') t=t.replace(/\\b\\w/g,c=>c.toUpperCase());
    out.push(t);
  }
  const tag=this.tagName.toLowerCase();
  const role=this.getAttribute('role')||'';
  const interactive = tag==='button'||tag==='a'||tag==='input'||tag==='select'||tag==='textarea'||tag==='summary'
    || ['button','link','checkbox','radio','tab','menuitem','switch','option'].includes(role)
    || this.hasAttribute('tabindex');
  return { vis: out.join(' ').replace(/\\s+/g,' ').trim(), cls:this.className||'', painted, interactive,
           box:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)] };
}`;

const norm = s => String(s).toLowerCase().replace(/[‘’']/g, "'")
  .replace(/[—–·:;,.…()→▸▾+\-\/]/g, ' ').replace(/\s+/g, ' ').trim();

async function audit(page, selector, log, tag, fails) {
  const cdp = await page.context().newCDPSession(page);
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector }).catch(() => ({ nodeIds: [] }));
  const rows = [];
  for (const nodeId of nodeIds) {
    let name = '', role = '', ignored = false;
    try {
      const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
      const n = nodes && nodes[0];
      if (n) { role = n.role ? n.role.value : ''; name = n.name ? n.name.value : ''; ignored = !!n.ignored; }
    } catch (e) { name = 'ERR ' + e.message; }
    const res = await cdp.send('DOM.resolveNode', { nodeId }).catch(() => ({ object: null }));
    let v = { vis: '', cls: '', painted: false, interactive: false, box: null };
    if (res && res.object) {
      const r = await cdp.send('Runtime.callFunctionOn', { objectId: res.object.objectId, returnByValue: true, functionDeclaration: VIS }).catch(() => null);
      if (r && r.result && r.result.value) v = r.result.value;
      await cdp.send('Runtime.releaseObject', { objectId: res.object.objectId }).catch(() => {});
    }
    let verdict;
    if (!v.painted) verdict = 'not painted';
    else if (ignored) verdict = v.interactive ? '*** INTERACTIVE BUT IGNORED ***' : 'not in the tree (generic box)';
    else if (!v.vis) verdict = name ? 'no visible text' : 'no name, no text';
    else if (!name) verdict = v.interactive ? '*** CONTROL WITH NO NAME ***' : 'name from contents';
    else if (norm(name).includes(norm(v.vis))) verdict = 'ok';
    else if (norm(name).startsWith(norm(v.vis).split(' ')[0])) verdict = v.interactive ? '*** 2.5.3 LABEL-IN-NAME FAIL ***' : 'name differs from print';
    else verdict = v.interactive ? '*** 2.5.3 LABEL-IN-NAME FAIL ***' : 'name differs from print';
    if (/\*\*\*/.test(verdict)) fails.push(tag + ' ' + (v.cls || selector) + ' :: seen "' + v.vis.slice(0, 60) + '" :: said "' + String(name).slice(0, 80) + '"');
    rows.push({ role, cls: String(v.cls).slice(0, 52), name, vis: v.vis, verdict, box: v.box, interactive: v.interactive });
  }
  await cdp.detach();
  if (!rows.length) return rows;
  log('--- ' + tag + ' :: ' + selector + ' (' + rows.length + ') ---');
  for (const o of rows) {
    if (o.verdict === 'not painted') continue;
    log('   [' + o.role + (o.interactive ? ' control' : '') + '] .' + o.cls + ' ' + JSON.stringify(o.box));
    log('      SEEN : "' + o.vis.slice(0, 130) + '"');
    log('      SAID : "' + String(o.name).slice(0, 230) + '"   => ' + o.verdict);
  }
  return rows;
}

const SELS = [
  '.legend--ribbon', '.legend__rib', '.legend__say', '.legend__route', '.legend__pin .legend__rib',
  '.legend button', '.legend a[href]', '.legend summary', '.legend [tabindex]', '.legend [role="button"]',
  '.legend__entry', '.legend__ramp-step', '.legend__h', '.byline__crit', '.byline__item',
  '.lplate__q button', '.legend .sym', '#legend-byline',
];

module.exports = async ({ page, shot, log }) => {
  const fails = [];
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });

  await page.evaluate(() => { location.hash = '#year=1700&layer=status'; });
  await page.waitForTimeout(1400);
  await shot('A-plate');
  for (const s of SELS) await audit(page, s, log, 'A/cold-plate', fails);

  /* the sheet: the key, then the criticism, then the poster */
  for (const sec of ['colour', 'criticism', 'poster']) {
    await page.evaluate((x) => window.BEA.legend.openPlate(x), sec);
    await page.waitForTimeout(1100);
    await shot('B-sheet-' + sec);
    for (const s of SELS) await audit(page, s, log, 'B/sheet:' + sec, fails);
  }

  /* a territory selected — the working stage, the pinned ribbon, the byline */
  await page.evaluate(() => { location.hash = '#year=1900&sel=british-india&layer=status'; });
  await page.waitForTimeout(1600);
  await shot('C-working');
  for (const s of SELS) await audit(page, s, log, 'C/working', fails);

  /* a thematic layer — the chips are the layer's own categories, not families */
  await page.evaluate(() => { location.hash = '#year=1900&layer=exit'; });
  await page.waitForTimeout(1400);
  await shot('D-layer-exit');
  for (const s of SELS) await audit(page, s, log, 'D/layer=exit', fails);

  await page.evaluate(() => { location.hash = '#year=1900&layer=tenure'; });
  await page.waitForTimeout(1400);
  for (const s of ['.legend__rib']) await audit(page, s, log, 'E/layer=tenure', fails);

  /* the apparatus stage — where the byline renders (62rem and up) */
  await page.evaluate(() => { location.hash = '#year=1900&layer=status&filter=stage:apparatus'; });
  await page.waitForTimeout(1800);
  await shot('F-apparatus');
  for (const s of SELS.concat(['.byline__item', '.byline__value', '.byline__mode-h', '.byline__ask-h']))
    await audit(page, s, log, 'F/apparatus', fails);

  /* a mounted beat — the state a student is in for most of the lesson */
  await page.evaluate(() => { location.hash = '#tour=empire&step=9'; });
  await page.waitForTimeout(1800);
  await shot('G-beat');
  for (const s of SELS) await audit(page, s, log, 'G/beat 9', fails);

  log('');
  log('=== WCAG 2.5.3 / naming failures: ' + fails.length + ' ===');
  fails.forEach(f => log('   FAIL ' + f));
  log(fails.length ? '>>> LEGEND NAMING BROKEN' : '>>> every legend control says what it prints');
};
