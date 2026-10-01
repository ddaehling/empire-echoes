/** w4-land — the retrieval card in phone landscape: is it complete, and does
 *  the sheet body scroll to reach its own commit row and why-block? */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { try { BEA.quiz.forget(); } catch (_) {} });
  await page.evaluate(() => { BEA.quiz.open('m11-who-got-rich'); });
  await page.waitForTimeout(700);
  const m = await page.evaluate(() => {
    const b = document.querySelector('.cx-sheet__body');
    const g = document.querySelector('.qz-cp__gap');
    const c = document.querySelector('.qz__commit');
    const r = c ? c.getBoundingClientRect() : null;
    return {
      body: b ? { ch: b.clientHeight, sh: b.scrollHeight, scrollable: b.scrollHeight > b.clientHeight + 1 } : null,
      gap: g ? g.textContent.trim() : null,
      commit: r ? { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) } : null,
      docScrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  log(JSON.stringify(m));
  await shot('landscape-card');
};
