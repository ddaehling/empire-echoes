/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 9 — the dossier measured as a reader meets it, at one viewport.
 *
 * Run once per contract viewport, and again with --dark and --reduced.
 *
 * What it reports, per place:
 *   rail geometry, the scroll it asks for, chars/words/controls, type registers,
 *   whether the four answers clear the panel's bottom edge (the fold),
 *   the document-scroll rule (B4), live map left above a bottom sheet,
 *   red controls VISIBLE without scrolling (the "everything is a CTA" charge),
 *   whether the commit-first question exists on this entry and where it sits,
 *   and — round 4's charge — the index note as a reader actually reads it
 *   (innerText, so `display:none` counts), plus the retrieval note's honesty.
 */
const PLACES = ['kenya', 'bengal-presidency', 'nigeria', 'canada', 'egypt', 'bermuda'];

module.exports = async ({ page, shot, log }) => {
  const out = [];
  for (const id of PLACES) {
    await page.goto('http://localhost:8777/app/#year=1900&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(2200);
    const m = await page.evaluate(() => {
      const aside = document.querySelector('.app__dossier');
      if (!aside) return { missing: true };
      const r = aside.getBoundingClientRect();
      const txt = aside.innerText || '';
      const vis = (n) => n.getClientRects().length > 0;
      const ctrls = [...aside.querySelectorAll('button,a[href],summary,input,select,[tabindex]:not([tabindex="-1"])')].filter(vis);
      const isRed = (n) => {
        const mm = getComputedStyle(n).color.match(/\d+/g);
        return mm && +mm[0] > 110 && +mm[0] - +mm[1] > 40 && +mm[0] - +mm[2] > 40;
      };
      /* A control is only competing for attention if it is inside the panel's
         own viewport before the reader scrolls. */
      const inView = (n) => {
        const b = n.getBoundingClientRect();
        return b.bottom > r.top + 1 && b.top < r.bottom - 1;
      };
      const sizes = new Set();
      for (const n of aside.querySelectorAll('*')) {
        if (!n.textContent || !n.textContent.trim() || !vis(n)) continue;
        sizes.add(getComputedStyle(n).fontSize);
      }
      const fold = aside.querySelector('.dsr__fold');
      const map = document.querySelector('.stage__map');
      const mr = map ? map.getBoundingClientRect() : null;
      const overlap = mr ? Math.max(0, Math.min(r.right, mr.right) - Math.max(r.left, mr.left))
        * Math.max(0, Math.min(r.bottom, mr.bottom) - Math.max(r.top, mr.top)) : 0;
      const think = aside.querySelector('.dsr__think');
      const note = aside.querySelector('.dsr__indexk');
      const retr = aside.querySelector('.dsr__retrnote');
      return {
        rail: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
        scrollH: aside.scrollHeight,
        screenfuls: Math.round((aside.scrollHeight / r.height) * 10) / 10,
        chars: txt.length,
        words: txt.trim().split(/\s+/).filter(Boolean).length,
        controls: ctrls.length,
        redAll: ctrls.filter(isRed).length,
        redVisible: ctrls.filter((n) => isRed(n) && inView(n)).length,
        sizes: [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b)),
        foldBottom: fold ? Math.round(fold.getBoundingClientRect().bottom - r.top) : null,
        foldFits: fold ? fold.getBoundingClientRect().bottom <= r.bottom + 1 : null,
        docScroll: document.documentElement.scrollHeight - innerHeight,
        mapOverlapPx2: Math.round(overlap),
        liveMapAbove: mr ? Math.round(Math.max(0, Math.min(r.top, mr.bottom) - mr.top)) : null,
        isSheet: getComputedStyle(aside).position === 'fixed',
        think: think ? { present: true, topInPanel: Math.round(think.getBoundingClientRect().top - r.top) } : { present: false },
        /* innerText, not textContent: the reader reads what CSS leaves on. */
        indexNote: note ? note.innerText.replace(/\s+/g, ' ').trim() : null,
        retrievalNote: retr ? retr.innerText.replace(/\s+/g, ' ').trim() : null,
        indexRows: aside.querySelectorAll('.dsr__idxbtn').length,
      };
    });
    out.push({ id, m });
    log(id + ' :: ' + JSON.stringify(m));
  }
  /* The index note must never claim a layout the reader is not in. */
  const wide = await page.evaluate(() => innerWidth > 62 * 16);
  for (const { id, m } of out) {
    if (!m.indexNote) continue;
    const claimsRail = /beside the map/.test(m.indexNote);
    const claimsSheet = /over the map/.test(m.indexNote);
    const ok = wide ? (claimsRail && !claimsSheet) : (claimsSheet && !claimsRail);
    log('NOTE ' + id + ' :: ' + (ok ? 'PASS' : 'FAIL') + ' (' + (wide ? 'rail' : 'sheet') + ') ' + m.indexNote.slice(0, 90));
  }
  /* Every entry asks its commit-first question, and never behind a click. */
  log('THINK coverage :: ' + out.filter((o) => o.m.think && o.m.think.present).length + '/' + out.length);

  await page.goto('http://localhost:8777/app/#year=1954&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  await shot('fold');
  await page.evaluate(() => { const a = document.querySelector('.app__dossier'); a.scrollTop = a.scrollHeight; });
  await page.waitForTimeout(300);
  await shot('bottom');
  /* One routed section, on the surface it actually opens on. */
  await page.evaluate(() => {
    const b = document.querySelector('.dsr__idxbtn[data-sheet="testimony"]');
    if (b) b.click();
  });
  await page.waitForTimeout(500);
  await shot('sheet-testimony');
  const sheetGeom = await page.evaluate(() => {
    const s = document.querySelector('.app__sheet');
    if (!s || s.hidden) return null;
    const r = s.getBoundingClientRect();
    const body = document.querySelector('.cx-sheet__body');
    return {
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      bodyScroll: body ? body.scrollHeight : null,
      bodyH: body ? Math.round(body.getBoundingClientRect().height) : null,
      minOk: r.height >= 280,
      docScroll: document.documentElement.scrollHeight - innerHeight,
    };
  });
  log('sheet(testimony) :: ' + JSON.stringify(sheetGeom));
};
