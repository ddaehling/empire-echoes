/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const { fixGrid } = require('./critic-p04-r4-lib.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500); await fixGrid(page, log);
  await page.evaluate(() => { try{localStorage.clear()}catch(e){} location.hash = '#year=1900&sel=british-india'; });
  await page.waitForTimeout(1500);
  const t = await page.evaluate(()=>document.querySelector('#dossier').innerText);
  log('princely mention:', /princely|paramountcy|565/i.test(t) ? t.slice(Math.max(0,t.search(/princely|565/i)-200), t.search(/princely|565/i)+500).replace(/\n+/g,' | ') : 'NONE');
  const btns = await page.evaluate(()=>[...document.querySelectorAll('#dossier button')].map(b=>b.textContent.trim().slice(0,55)));
  log('buttons:', JSON.stringify(btns));
  // ledger
  const ls = await page.evaluate(()=>{ const o={}; for (let i=0;i<localStorage.length;i++){const k=localStorage.key(i); o[k]=(localStorage.getItem(k)||'').slice(0,600);} return o; });
  log('localStorage:', JSON.stringify(ls).slice(0,2000));
  // disagree section
  const i = t.indexOf('WHERE HISTORIANS DISAGREE');
  log('disagree:', i<0 ? 'NONE' : t.slice(i, i+1400).replace(/\n+/g,' | '));
};
