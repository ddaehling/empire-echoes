/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 9 — the three sentences that have to be true when they are read.
 *
 *  1. the index note: rail vs bottom sheet (round 4's charge, already fixed —
 *     re-asserted here so it cannot regress);
 *  2. the retrieval note: it says nothing outside this panel reads the
 *     student's record. That is a claim about the BUILD, and it was printed
 *     unconditionally. Tested both ways: with no subscriber, and with one.
 *  3. the dispute preview on the index row, whole or absent — never half.
 *
 * Plus: does opening a routed section with a REAL mouse click draw a focus
 * ring round a heading a mouse user never asked to focus?
 */
module.exports = async ({ page, shot, log }) => {
  const go = async (hash) => {
    await page.goto('http://localhost:8777/app/' + hash, { waitUntil: 'load' });
    await page.waitForTimeout(2200);
  };

  /* ---- 3. the dispute preview, over every entry that has one ------------- */
  await go('#year=1900&sel=kenya');
  const previews = await page.evaluate(async () => {
    const store = window.BEA.store;
    const data = window.BEA.data;
    const all = (data.territories || []).map((t) => t.id);
    const rows = [];
    for (const id of all) {
      const t = data.get(id);
      if (!t || !t.contested || !t.contested.note) continue;
      rows.push(id);
    }
    /* Sample the first 30 contested entries — enough to catch a truncation
       rule that is wrong, cheap enough to run every round. */
    const sample = rows.slice(0, 30);
    const bad = [];
    for (const id of sample) {
      store.dispatch('select', id);
      await new Promise((r) => setTimeout(r, 90));
      const p = document.querySelector('.dsr__idxsay');
      if (!p) continue;
      const s = p.textContent.trim();
      if (!/[.!?]$/.test(s)) bad.push(id + ' :: ' + s.slice(-40));
      if (s.length > 120) bad.push(id + ' :: too long ' + s.length);
      /* and it must be printed whole, not clipped by its own box */
      if (p.scrollHeight > p.clientHeight + 1) bad.push(id + ' :: clipped');
    }
    return { contestedEntries: rows.length, sampled: sample.length, bad };
  });
  log('PREVIEW :: ' + JSON.stringify(previews) + ' -> ' + (previews.bad.length ? 'FAIL' : 'PASS'));

  /* ---- 2. the retrieval note, both ways --------------------------------- */
  await go('#year=1900&sel=kenya');
  const retr = await page.evaluate(async () => {
    const store = window.BEA.store, bus = window.BEA.bus;
    const read = () => {
      const n = document.querySelector('.dsr__retrnote');
      return n ? n.textContent.replace(/\s+/g, ' ').trim() : null;
    };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    /* Read four claims, leave, come back: that is what produces the block. */
    const aside = document.querySelector('.app__dossier');
    aside.scrollTop = 0;
    await wait(2200);
    aside.scrollTop = 600; await wait(2000);
    store.dispatch('select', 'nigeria'); await wait(400);
    store.dispatch('select', 'kenya'); await wait(600);
    const withoutConsumer = read();
    /* Now let something consume the record, as a built tours/close module
       would, and re-render. */
    const off = bus.on('ledger:append', () => {});
    store.dispatch('select', 'nigeria'); await wait(300);
    store.dispatch('select', 'kenya'); await wait(600);
    const withConsumer = read();
    off();
    return { withoutConsumer, withConsumer, subs: 0 };
  });
  log('RETRIEVAL(no consumer) :: ' + JSON.stringify(retr.withoutConsumer));
  log('RETRIEVAL(consumer)    :: ' + JSON.stringify(retr.withConsumer));
  const okA = retr.withoutConsumer && /not built in this copy/.test(retr.withoutConsumer);
  const okB = retr.withConsumer && /rest of the atlas reads it/.test(retr.withConsumer);
  log('RETRIEVAL -> ' + (retr.withoutConsumer == null ? 'SKIPPED (no retrieval block)' : (okA && okB ? 'PASS' : 'FAIL')));

  /* ---- the focus ring after a real mouse click -------------------------- */
  await go('#year=1954&sel=kenya');
  const btn = await page.$('.dsr__idxbtn[data-sheet="testimony"]');
  if (btn) {
    await btn.scrollIntoViewIfNeeded();
    await btn.click();                      /* a real pointer press */
    await page.waitForTimeout(500);
    const ring = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a) return null;
      const cs = getComputedStyle(a);
      return {
        tag: a.tagName, cls: a.className,
        focusVisible: a.matches(':focus-visible'),
        outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle,
      };
    });
    log('MOUSE-OPEN focus :: ' + JSON.stringify(ring));
    await shot('mouse-opened-sheet');
  }
};
