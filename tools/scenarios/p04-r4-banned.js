/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  const res = await page.evaluate(async () => {
    const { store, data } = window.BEA;
    const wait = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const banned = ['acquired', 'pacified', 'native', 'unrest', 'mixed legacy', 'rich tapestry',
      'played a key role', 'both sides', 'arguably', 'granted'];
    const byWord = {};
    for (const t of data.territories) {
      const y = t.acquiredYear || t.firstYear || 1900;
      store.dispatch('setYear', y); store.dispatch('select', t.id); store.flush();
      await wait();
      const root = document.querySelector('.dossier');
      if (!root) continue;
      const clone = root.cloneNode(true);
      clone.querySelectorAll('blockquote, .dsr__style, .dsr__hist').forEach(n => n.remove());
      const clean = clone.innerText;
      for (const b of banned) {
        const re = new RegExp('.{0,70}\\b' + b.replace(/ /g, '\\s+') + '\\b.{0,70}', 'ig');
        const m = clean.match(re);
        if (!m) continue;
        byWord[b] = byWord[b] || [];
        for (const x of m) byWord[b].push(t.id + ' :: ' + x.replace(/\s+/g, ' '));
      }
    }
    return byWord;
  });
  for (const k of Object.keys(res)) {
    log('=== ' + k + ' (' + res[k].length + ')');
    log(res[k].slice(0, 40).join('\n'));
  }
};
