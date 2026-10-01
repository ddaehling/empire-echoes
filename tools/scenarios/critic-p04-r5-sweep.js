/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const ids = require('/tmp/tids.json');
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>{if(!/frameSpan/.test(e.message))errs.push('PE '+e.message)});
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.map__furniture{display:none !important}'});
  const banned = /\b(acquired|pacified|natives?|unrest|tribal|tribes?|rich tapestry|played a key role|left a lasting legacy|mixed legacy|both sides|it is important to note|arguably|many would say|civilising mission)\b/gi;
  const bad = [];
  const flags = { unsourced:[], missingActors:[], empty:[], noFranchise:[], short:[] };
  for (let i=0;i<ids.length;i++) {
    const id = ids[i];
    await page.evaluate(id => { location.hash = '#year=1913&sel='+id; }, id);
    await page.waitForTimeout(120);
    const r = await page.evaluate(()=>{
      const el = document.querySelector('.dossier');
      const t = el ? el.innerText : '';
      // strip quoted passages: blockquotes
      const qs = [...(el?el.querySelectorAll('blockquote, [class*=quote], q'):[])].map(n=>n.textContent);
      return { t, len: t.length, qs, h: el?el.scrollHeight:0 };
    });
    if (!r.len || r.len < 300) { flags.short.push(id+':'+r.len); continue; }
    let body = r.t;
    for (const q of r.qs) body = body.split(q).join(' ');
    const m = body.match(banned);
    if (m) bad.push(id+' :: '+[...new Set(m.map(s=>s.toLowerCase()))].join(',')); 
    if (/\[unsourced\]/i.test(r.t)) flags.unsourced.push(id);
    if (/missing local actors/i.test(r.t)) flags.missingActors.push(id);
    if (!/WHO COULD VOTE/i.test(r.t)) flags.noFranchise.push(id);
  }
  log('TOTAL', ids.length);
  log('BANNED HITS ('+bad.length+'):\n'+bad.slice(0,60).join('\n'));
  log('unsourced:', flags.unsourced.length, JSON.stringify(flags.unsourced.slice(0,20)));
  log('missingActors:', flags.missingActors.length, JSON.stringify(flags.missingActors.slice(0,20)));
  log('noFranchiseLine:', flags.noFranchise.length, JSON.stringify(flags.noFranchise.slice(0,30)));
  log('short/empty:', flags.short.length, JSON.stringify(flags.short.slice(0,20)));
  log('PAGE ERRORS:', errs.length, JSON.stringify(errs.slice(0,5)));
};
