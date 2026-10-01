/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 r3 — the edges: a very short stage (tight), print, and the folded pill. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.waitForTimeout(2800);

  const probe = () => {
    const p = document.querySelector('.legend');
    const st = document.querySelector('.app__stage').getBoundingClientRect();
    const r = p && p.getBoundingClientRect();
    const head = document.querySelector('.legend__head');
    const hr = head && head.getBoundingClientRect();
    const body = document.querySelector('#legend-body');
    return {
      stageH: Math.round(st.height),
      tight: document.querySelector('.stage__legend').dataset.tight,
      dense: document.querySelector('.stage__legend').dataset.dense,
      panel: r && { y: Math.round(r.y), h: Math.round(r.height), sh: p.scrollHeight, ch: p.clientHeight },
      head: hr && { y: Math.round(hr.y), h: Math.round(hr.height), insidePanel: hr.top >= r.top - 2 && hr.top < r.bottom },
      body: body && { ch: body.clientHeight, sh: body.scrollHeight },
      inStage: r ? (r.top >= st.top - 2 && r.bottom <= st.bottom + 2) : null,
      headIsFirst: (() => { const kids = [...document.querySelector('.legend').children];
        return kids.length ? kids[0].className : null; })(),
    };
  };

  for (const h of [560, 620, 700, 900]) {
    await page.setViewportSize({ width: 1280, height: h });
    await page.waitForTimeout(700);
    log('viewport 1280x' + h + ':', JSON.stringify(await page.evaluate(probe)));
    await shot('01-h' + h);
  }

  /* print */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(500);
  log('print:', JSON.stringify(await page.evaluate(() => {
    const p = document.querySelector('.legend');
    const cs = getComputedStyle(p);
    const body = document.querySelector('#legend-body');
    return { overflow: cs.overflow, maxH: cs.maxBlockSize,
      bodyOverflow: body ? getComputedStyle(body).overflow : null,
      detailsShown: [...document.querySelectorAll('details.legend__det')].map(d => getComputedStyle(d.querySelector('ul, p') || d).display) };
  })));
  await shot('02-print');
  await page.emulateMedia({ media: 'screen' });

  log('errors:', errs.length ? JSON.stringify(errs.slice(0, 8)) : 'none');
};
