/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 7 — the band's sentence, over the whole dataset, at one viewport.
 * Round 3: "the lede truncates mid-sentence with an ellipsis whenever a
 * territory is selected." Select every entry this atlas has, read what the
 * band actually shows, and count three things: sentences clipped by the band
 * (must be zero), sentences that end in an ellipsis (must be zero), and
 * entries whose argument line would not fit at all and fall through to the
 * legal-status sentence.
 */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  const res = await page.evaluate(async () => {
    const { store, data } = window.BEA;
    const ids = [...data.byId.keys()];
    const out = { n: 0, clipped: [], ellipsis: [], status: [], samples: [] };
    const wait = () => new Promise((r) => setTimeout(r, 80));
    /* Prime: the first selection of a session also opens the rail, which
       changes the band's width on the frame it happens. Measure from the
       second one on. */
    store.dispatch('select', ids[0]);
    await new Promise((r) => setTimeout(r, 400));
    for (const id of ids) {
      const t = data.byId.get(id);
      const why = ((t.pedagogy || {}).whyItMatters || '').trim();
      store.dispatch('select', id);
      await wait();
      const say = document.querySelector('.cx-lede__say');
      if (!say) continue;
      const txt = (say.textContent || '').trim();
      if (!txt) continue;
      out.n++;
      if (say.scrollHeight > say.clientHeight + 1) out.clipped.push([id, txt]);
      if (/[…]$|\.\.\.$/.test(txt)) out.ellipsis.push([id, txt]);
      /* the argument line exists but the band is showing the status sentence */
      if (why && / in \d{4}\.$/.test(txt) && !why.startsWith(txt.slice(0, 12))) out.status.push([id, txt, why.slice(0, 80)]);
      if (out.samples.length < 6) out.samples.push([id, txt]);
    }
    return out;
  });
  log('entries with a sentence in the band: ' + res.n);
  log('CLIPPED BY THE BAND: ' + res.clipped.length + (res.clipped.length ? ' :: ' + JSON.stringify(res.clipped.slice(0, 6)) : ''));
  log('ENDING IN AN ELLIPSIS: ' + res.ellipsis.length + (res.ellipsis.length ? ' :: ' + JSON.stringify(res.ellipsis.slice(0, 6)) : ''));
  log('fell through to the legal-status sentence: ' + res.status.length + ' :: ' + JSON.stringify(res.status.slice(0, 8)));
  log('samples :: ' + JSON.stringify(res.samples));
};
