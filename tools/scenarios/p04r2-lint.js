/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const BANNED = [
  ['acquired', /\bacquired\b/gi], ['pacified', /\bpacified\b/gi], ['unrest', /\bunrest\b/gi],
  ['both sides', /\bboth sides\b/gi], ['mixed legacy', /\bmixed legacy\b/gi],
  ['arguably', /\barguably\b/gi], ['played a key role', /\bplayed a key role\b/gi],
  ['rich tapestry', /\brich tapestry\b/gi], ['left a lasting legacy', /\bleft a lasting legacy\b/gi],
  ['many would say', /\bmany would say\b/gi], ['it is important to note', /it is important to note/gi],
];
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2600);
  const ids = await page.evaluate(() => window.BEA.data.territories.map(t => t.id));
  const body = {}, footer = {};
  const ctx = [];
  for (const id of ids) {
    await page.evaluate((i) => { location.hash = '#year=1913&sel=' + i; }, id);
    await page.waitForTimeout(40);
    const t = await page.evaluate(() => {
      const d = document.querySelector('.app__dossier');
      const st = d.querySelector('.dsr__style');
      const stTxt = st ? st.textContent.replace(/\s+/g, ' ') : '';
      const clone = d.cloneNode(true);
      const s2 = clone.querySelector('.dsr__style'); if (s2) s2.remove();
      return { body: clone.textContent.replace(/\s+/g, ' '), footer: stTxt };
    });
    for (const [name, re] of BANNED) {
      const b = t.body.match(re);
      if (b) { (body[name] = body[name] || []).push(id + ' x' + b.length);
        let m; const r = new RegExp(re.source, 'gi');
        while ((m = r.exec(t.body)) && ctx.length < 60) ctx.push(id + ' | ' + t.body.slice(Math.max(0, m.index - 60), m.index + m[0].length + 45));
      }
      const f = t.footer.match(re);
      if (f) (footer[name] = footer[name] || []).push(id);
    }
  }
  log('=== BODY (rendered prose, house-style footer excluded) ===');
  const keys = Object.keys(body);
  if (!keys.length) log('  ZERO banned strings in the rendered dossier prose across all ' + ids.length + ' territories.');
  for (const k of keys) log('  "' + k + '": ' + body[k].length + ' → ' + body[k].slice(0, 12).join(', '));
  log('=== CONTEXTS ===');
  ctx.slice(0, 40).forEach(c => log('  · ' + c));
  log('=== FOOTER (the audit line that names the word we replaced, in quotation marks) ===');
  for (const k of Object.keys(footer)) log('  "' + k + '": ' + footer[k].length + ' territories');
};
