/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* The whole of DIDACTIC_SPEC §7.1's banned-string list, over all 260 rendered
   dossiers, ignoring quotations and the house-style audit block. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  const res = await page.evaluate(async () => {
    const { store, data } = window.BEA;
    const wait = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const banned = ['acquired', 'pacified', 'civilising mission', 'tribe', 'tribes', 'tribal',
      'unrest', 'the natives revolted', 'rich tapestry', 'played a key role', 'left a lasting legacy',
      'both sides', 'it is important to note', 'arguably', 'many would say', 'mixed legacy',
      'the empire on which the sun never set', 'genocidal', 'evil', 'lost their lives'];
    const nounSlaves = /\b(?:the |a |some |these |those |many |\d+ )slaves\b/i;
    const out = {};
    for (const t of data.territories) {
      store.dispatch('setYear', t.acquiredYear || t.firstYear || 1900);
      store.dispatch('select', t.id); store.flush(); await wait();
      const root = document.querySelector('.dossier');
      if (!root) continue;
      const clone = root.cloneNode(true);
      clone.querySelectorAll('blockquote, .dsr__style, .dsr__hist').forEach(n => n.remove());
      let clean = clone.innerText;
      /* strip anything the record already has inside quotation marks */
      clean = clean.replace(/['‘“][^'’”]{0,200}['’”]/g, ' ');
      for (const b of banned) {
        const re = new RegExp('.{0,60}\\b' + b.replace(/ /g, '\\s+') + '\\b.{0,60}', 'i');
        const m = clean.match(re);
        if (m) { (out[b] = out[b] || []).push(t.id + ' :: ' + m[0].replace(/\s+/g, ' ')); }
      }
      const m2 = clean.match(new RegExp('.{0,60}' + nounSlaves.source + '.{0,60}', 'i'));
      if (m2) (out['slaves (noun)'] = out['slaves (noun)'] || []).push(t.id + ' :: ' + m2[0].replace(/\s+/g, ' '));
    }
    return out;
  });
  const keys = Object.keys(res);
  log('banned strings with hits: ' + (keys.length ? keys.join(', ') : 'NONE'));
  for (const k of keys) { log('=== ' + k + ' (' + res[k].length + ')'); log(res[k].slice(0, 12).join('\n')); }
};
