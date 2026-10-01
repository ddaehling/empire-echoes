/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 3 — does the dossier ask anything, and does the reveal work? */
const wait = (p, ms) => p.waitForTimeout(ms);

module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', (r) => errs.push('REQFAIL ' + r.url()));

  await page.goto('http://localhost:8777/app/#year=1955&sel=kenya', { waitUntil: 'load' });
  await wait(page, 2200);
  await shot('01-fold-kenya-1955');

  const fold = await page.evaluate(() => {
    const host = document.querySelector('.app__dossier');
    const art = document.querySelector('.dossier');
    if (!art) return { none: true };
    const hb = host.getBoundingClientRect();
    const out = { host: { h: Math.round(hb.height), w: Math.round(hb.width) }, over: [], text: {} };
    for (const sel of ['.dsr__franchise', '.dsr__fact--tight', '.dsr__statusline', '.dsr__fold [data-block="taken"] .dsr__from', '.dsr__fold [data-block="ended"] .dsr__lead', '.dsr__fold [data-block="ended"] .dsr__from']) {
      const n = art.querySelector(sel);
      if (n) out.text[sel] = n.innerText.replace(/\s+/g, ' ').trim();
    }
    const foldEl = art.querySelector('.dsr__fold');
    if (foldEl) {
      const fb = foldEl.getBoundingClientRect();
      out.foldBottom = Math.round(fb.bottom - hb.top);
      out.foldFits = fb.bottom <= hb.bottom + 1;
    }
    /* anything clipped with an ellipsis? */
    out.ellipsis = [...art.querySelectorAll('.dsr__fold *')].filter((n) => {
      if (n.children.length) return false;
      return n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1;
    }).map((n) => n.className + ' :: ' + n.innerText.slice(0, 60));
    const rail = art.querySelector('.dsr__rail');
    out.rail = rail ? { scrollW: rail.scrollWidth, clientW: rail.clientWidth, n: rail.children.length } : null;
    out.questions = art.innerText.split('\n').filter((l) => l.includes('?')).slice(0, 8);
    out.inputs = art.querySelectorAll('button.dsr__choice').length;
    out.correctionInDom = /What the record shows/.test(art.innerText);
    return out;
  });
  log('FOLD', JSON.stringify(fold, null, 1));

  /* scroll to the THINK box */
  await page.evaluate(() => {
    const t = document.querySelector('#dsr-think');
    if (t) t.scrollIntoView({ block: 'start' });
  });
  await wait(page, 400);
  await shot('02-think-before');

  const before = await page.evaluate(() => document.querySelector('.dossier').innerText.length);
  await page.click('.dsr__choice[data-value="true"]');
  await wait(page, 500);
  await shot('03-think-after');
  const after = await page.evaluate(() => {
    const a = document.querySelector('.dossier');
    return {
      len: a.innerText.length,
      verdict: (a.querySelector('.dsr__askverdict') || {}).innerText,
      correction: (a.querySelector('.dsr__correction') || {}).innerText,
      state: (a.querySelector('[data-ask]') || {}).dataset,
    };
  });
  log('BEFORE len', before, 'AFTER', JSON.stringify(after, null, 1));

  /* the toll question */
  const toll = await page.evaluate(() => {
    const b = document.querySelector('.dsr__ask--toll');
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    return b.innerText.replace(/\s+/g, ' ').slice(0, 300);
  });
  log('TOLL Q', toll);
  await wait(page, 300);
  await shot('04-toll-before');
  if (toll) {
    await page.click('.dsr__ask--toll .dsr__choice[data-value="thousands"]');
    await wait(page, 500);
    await shot('05-toll-after');
    log('TOLL A', await page.evaluate(() => document.querySelector('.dsr__ask--toll').innerText.replace(/\s+/g, ' ').slice(0, 500)));
  }

  log('CONSOLE ERRORS:', errs.length, JSON.stringify(errs.slice(0, 8)));
};
