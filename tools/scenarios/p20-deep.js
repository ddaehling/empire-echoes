/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p20-deep — the parts that matter, scrolled into view. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1000);
  await page.click('.tp-entry');
  await page.waitForTimeout(800);

  const to = async (sel, name, off = 0) => {
    const ok = await page.evaluate(([s, o]) => {
      const n = document.querySelector(s);
      if (!n) return false;
      const p = document.querySelector('.tp__pages');
      p.scrollTop = n.getBoundingClientRect().top + p.scrollTop - p.getBoundingClientRect().top - o;
      return true;
    }, [sel, off]);
    log(name + ' -> ' + ok);
    await page.waitForTimeout(400);
    if (ok) await shot(name);
  };

  await to('#tp-move-utility .tp-source', 'w1-source', 20);
  await to('#tp-move-utility .tp-vs', 'w2-weak-strong', 20);
  await to('#tp-move-utility .tp-do', 'w3-yourturn', 20);
  await to('#tp-move-paragraph .tp-bars', 'w4-tally', 20);
  await to('#tp-move-scope .tp-cases', 'w5-cases', 20);

  // commit-then-reveal
  await page.click('#tp-write-utility');
  await page.type('#tp-write-utility', 'Plaatje was a founding officer of the South African Native National Congress and he wrote this book in London in 1916 to get the Natives Land Act repealed, so it is a campaign document written to be quoted.', { delay: 0 });
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => ({
    count: document.querySelector('#tp-count-utility').textContent,
    disabled: document.querySelector('#tp-move-utility .tp-reveal').disabled,
  }));
  log('WRITE ' + JSON.stringify(before));
  await page.click('#tp-move-utility .tp-reveal');
  await page.waitForTimeout(400);
  await to('#tp-move-utility .tp-model', 'w6-model', 20);
  await page.evaluate(() => document.querySelectorAll('#tp-move-utility .tp-scheme__i input').forEach((b, i) => { if (i < 4) { b.checked = true; b.dispatchEvent(new Event('change')); } }));
  await page.waitForTimeout(200);
  await to('#tp-move-utility .tp-scheme', 'w7-scheme', 20);

  // ledger
  await page.click('#tp-tab-evidence');
  await page.waitForTimeout(700);
  await to('.tp-led__tools', 'e1-table', 10);
  await page.click('.tp-chip');            // "only numbers with no range"
  await page.waitForTimeout(400);
  const filtered = await page.evaluate(() => ({ count: document.querySelector('.tp-led__count').textContent, rows: document.querySelectorAll('.tp-led__rec').length }));
  log('FILTER ' + JSON.stringify(filtered));
  await shot('e2-filtered');
  await page.click('.tp-led__sort');       // sort by subject
  await page.waitForTimeout(400);
  const sorted = await page.evaluate(() => [...document.querySelectorAll('.tp-led__rec .tp-led__link')].slice(0, 3).map(t => t.textContent));
  log('SORTED ' + JSON.stringify(sorted));

  // classroom
  await page.click('#tp-tab-classroom');
  await page.waitForTimeout(600);
  await to('.tp-lesson', 'c1-lesson', 20);
  await to('.tp-keys', 'c2-links', 20);
  await page.evaluate(() => document.querySelector('.tp-qs__q .cx-more').click());
  await page.waitForTimeout(300);
  await to('.tp-qs', 'c3-questions', 20);
  await to('.tp-packs', 'c4-packs', 20);

  // methods
  await page.click('#tp-tab-methods');
  await page.waitForTimeout(600);
  await to('.tp-status', 'm1-status', 20);
  await to('.tp-concede', 'm2-concede', 20);
  await to('.tp-build', 'm3-build', 60);
};
