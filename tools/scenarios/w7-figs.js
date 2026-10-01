/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** w7-figs.js — measure the three ON_PATH figures: words before the commit and
 *  after the reveal, plus the checkpoint sheets, so `_budgetMinutes` can price
 *  what is actually on screen. */
module.exports = async ({ page, shot, log }) => {
  const words = 'e => (String(e && e.innerText || "").trim().match(/\\S+/g)||[]).length';
  for (const beat of ['barbados', 'revenue-loop', 'exits']) {
    await page.goto('http://localhost:8777/app/#tour=core&step=0', { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.evaluate((b) => window.BEA.bus.emit('tours:goBeat', { id: b }), beat);
    await page.waitForTimeout(1400);
    await page.evaluate((b) => window.BEA.bus.emit('tours:beat', { id: b, n: 1, total: 13, exploring: false }), beat);
    await page.waitForTimeout(1600);
    const pre = await page.evaluate(() => {
      const w = (e) => (String((e && e.innerText) || '').trim().match(/\S+/g) || []).length;
      const op = document.querySelector('.viz-onpath');
      return { ok: !!op, words: w(op), controls: op ? [...op.querySelectorAll('button, input')].map((b) => (b.textContent || b.type || '').trim().slice(0, 40)) : [] };
    });
    // commit
    await page.evaluate(() => {
      const op = document.querySelector('.viz-onpath'); if (!op) return;
      for (const inp of op.querySelectorAll('input[type=number], input[type=range]')) {
        inp.value = String(inp.min && inp.max ? Math.round((+inp.min + +inp.max) / 2) : 3);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
      for (const b of op.querySelectorAll('button')) { if (/commit|guess|reveal|count/i.test(b.textContent) && !b.disabled) { b.click(); break; } }
    });
    await page.waitForTimeout(900);
    const post = await page.evaluate(() => {
      const w = (e) => (String((e && e.innerText) || '').trim().match(/\S+/g) || []).length;
      const op = document.querySelector('.viz-onpath');
      return { words: w(op), text: op ? op.innerText.replace(/\s+/g, ' ').slice(0, 300) : '' };
    });
    log('FIG ' + beat + ' pre=' + JSON.stringify(pre) + ' post=' + post.words + ' :: ' + post.text);
    await shot('fig-' + beat);
  }
};
